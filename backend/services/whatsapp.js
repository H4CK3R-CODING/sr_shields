import makeWASocket, {
    DisconnectReason,
    initAuthCreds,
    BufferJSON,
    fetchLatestWaWebVersion
} from "@whiskeysockets/baileys";

import { Boom } from "@hapi/boom";
import QRCode from "qrcode";
import { MongoClient } from "mongodb";
import "dotenv/config";


/*
|--------------------------------------------------------------------------
| MONGODB CONFIG
|--------------------------------------------------------------------------
*/

const MONGODB_URI =
    process.env.MONGO_URI;

const MONGODB_DB =
    process.env.MONGODB_DB ||
    "test";

const WHATSAPP_AUTH_ID =
    process.env.WHATSAPP_AUTH_ID ||
    "default";


let mongoClient = null;
let mongoDb = null;
let authCollection = null;


/*
|--------------------------------------------------------------------------
| MONGODB CONNECTION
|--------------------------------------------------------------------------
*/

async function getMongoAuthCollection() {

    if (!MONGODB_URI) {

        throw new Error(
            "MONGODB_URI is not configured. Add it to your environment variables."
        );

    }


    if (authCollection) {

        return authCollection;

    }


    mongoClient =
        new MongoClient(
            MONGODB_URI
        );


    await mongoClient.connect();


    mongoDb =
        mongoClient.db(
            MONGODB_DB
        );


    authCollection =
        mongoDb.collection(
            "whatsapp_auth"
        );


    await authCollection.createIndex(
        {
            authId: 1,
            type: 1,
            keyId: 1
        },
        {
            unique: true
        }
    );


    console.log(
        `✅ MongoDB connected: ${MONGODB_DB}`
    );


    return authCollection;

}

export async function getMongoDatabase() {

    await getMongoAuthCollection();

    return mongoDb;

}

/*
|--------------------------------------------------------------------------
| MONGODB AUTH STATE
|--------------------------------------------------------------------------
|
| Stores:
|
| 1. WhatsApp credentials
| 2. Signal keys
| 3. Session keys
|
| Everything is stored in MongoDB so authentication survives
| server restart/redeployment.
|
|--------------------------------------------------------------------------
*/

async function useMongoAuthState() {

    const collection =
        await getMongoAuthCollection();


    /*
    |--------------------------------------------------------------------------
    | LOAD CREDENTIALS
    |--------------------------------------------------------------------------
    */

    const credsDocument =
        await collection.findOne(
            {
                authId:
                    WHATSAPP_AUTH_ID,

                type:
                    "creds"
            }
        );


    const creds =
        credsDocument?.data
            ? JSON.parse(
                credsDocument.data,
                BufferJSON.reviver
            )
            : initAuthCreds();


    /*
    |--------------------------------------------------------------------------
    | KEYS
    |--------------------------------------------------------------------------
    */

    const keys = {

        async get(
            type,
            ids
        ) {

            const documents =
                await collection
                    .find(
                        {
                            authId:
                                WHATSAPP_AUTH_ID,

                            type:
                                `key:${type}`,

                            keyId:
                                {
                                    $in:
                                        ids
                                }
                        }
                    )
                    .toArray();


            const result = {};


            for (
                const id
                of ids
            ) {

                const document =
                    documents.find(
                        item =>
                            item.keyId === id
                    );


                if (
                    document?.data
                ) {

                    result[id] =
                        JSON.parse(
                            document.data,
                            BufferJSON.reviver
                        );

                }

            }


            return result;

        },


        async set(
            data
        ) {

            const operations = [];


            for (
                const category
                in data
            ) {

                for (
                    const id
                    in data[category]
                ) {

                    const value =
                        data[category][id];


                    /*
                    |--------------------------------------------------------------------------
                    | SAVE KEY
                    |--------------------------------------------------------------------------
                    */

                    if (
                        value
                    ) {

                        operations.push(
                            {
                                updateOne:
                                    {
                                        filter:
                                            {
                                                authId:
                                                    WHATSAPP_AUTH_ID,

                                                type:
                                                    `key:${category}`,

                                                keyId:
                                                    id
                                            },

                                        update:
                                            {
                                                $set:
                                                    {
                                                        authId:
                                                            WHATSAPP_AUTH_ID,

                                                        type:
                                                            `key:${category}`,

                                                        keyId:
                                                            id,

                                                        data:
                                                            JSON.stringify(
                                                                value,
                                                                BufferJSON.replacer
                                                            ),

                                                        updatedAt:
                                                            new Date()
                                                    }
                                            },

                                        upsert:
                                            true
                                    }
                            }
                        );

                    }


                    /*
                    |--------------------------------------------------------------------------
                    | DELETE KEY
                    |--------------------------------------------------------------------------
                    */

                    else {

                        operations.push(
                            {
                                deleteOne:
                                    {
                                        filter:
                                            {
                                                authId:
                                                    WHATSAPP_AUTH_ID,

                                                type:
                                                    `key:${category}`,

                                                keyId:
                                                    id
                                            }
                                    }
                            }
                        );

                    }

                }

            }


            if (
                operations.length
            ) {

                await collection.bulkWrite(
                    operations,
                    {
                        ordered:
                            false
                    }
                );

            }

        }

    };


    /*
    |--------------------------------------------------------------------------
    | SAVE CREDENTIALS
    |--------------------------------------------------------------------------
    */

    const saveCreds =
        async () => {

            await collection.updateOne(
                {
                    authId:
                        WHATSAPP_AUTH_ID,

                    type:
                        "creds"
                },

                {
                    $set:
                        {
                            authId:
                                WHATSAPP_AUTH_ID,

                            type:
                                "creds",

                            data:
                                JSON.stringify(
                                    creds,
                                    BufferJSON.replacer
                                ),

                            updatedAt:
                                new Date()
                        }
                },

                {
                    upsert:
                        true
                }
            );

        };


    return {

        state:
            {
                creds,
                keys
            },

        saveCreds

    };

}


/*
|--------------------------------------------------------------------------
| WHATSAPP STATE
|--------------------------------------------------------------------------
*/

let sock = null;

let isConnecting = false;

let isReady = false;

let currentQR = null;

let reconnectTimer = null;

let manualLogout = false;


/*
|--------------------------------------------------------------------------
| CONNECT WHATSAPP
|--------------------------------------------------------------------------
*/

export async function connectWhatsApp() {

    if (
        manualLogout
    ) {

        console.log(
            "🛑 Manual logout active. Not connecting."
        );

        return null;

    }


    if (
        sock &&
        isReady
    ) {

        return sock;

    }


    if (
        isConnecting
    ) {

        return waitForConnection();

    }


    isConnecting = true;


    try {

        console.log(
            "🔄 WhatsApp connecting..."
        );


        /*
        |--------------------------------------------------------------------------
        | LOAD AUTH FROM MONGODB
        |--------------------------------------------------------------------------
        */

        const {
            state,
            saveCreds
        } =
            await useMongoAuthState();


        /*
        |--------------------------------------------------------------------------
        | WHATSAPP WEB VERSION
        |--------------------------------------------------------------------------
        */

        const {
            version,
            isLatest
        } =
            await fetchLatestWaWebVersion();


        console.log(
            `🌐 WhatsApp Web version: ${version.join(".")}`
        );


        console.log(
            `🌐 Latest: ${isLatest}`
        );


        /*
        |--------------------------------------------------------------------------
        | CREATE SOCKET
        |--------------------------------------------------------------------------
        */

        const newSock =
            makeWASocket(
                {

                    version,

                    auth:
                        state,

                    printQRInTerminal:
                        false,

                    browser:
                        [
                            "Mac OS",
                            "Chrome",
                            "14.4.1"
                        ],

                    markOnlineOnConnect:
                        false,

                    syncFullHistory:
                        false,

                    connectTimeoutMs:
                        60000,

                    defaultQueryTimeoutMs:
                        60000,

                    keepAliveIntervalMs:
                        30000,

                    generateHighQualityLinkPreview:
                        false

                }
            );


        sock =
            newSock;


        /*
        |--------------------------------------------------------------------------
        | SAVE AUTH CHANGES
        |--------------------------------------------------------------------------
        */

        sock.ev.on(
            "creds.update",
            saveCreds
        );


        /*
        |--------------------------------------------------------------------------
        | CONNECTION EVENTS
        |--------------------------------------------------------------------------
        */

        sock.ev.on(
            "connection.update",
            async (
                update
            ) => {

                const {
                    connection,
                    lastDisconnect,
                    qr
                } =
                    update;


                /*
                |--------------------------------------------------------------------------
                | QR CODE
                |--------------------------------------------------------------------------
                */

                if (
                    qr
                ) {

                    try {

                        currentQR =
                            await QRCode.toDataURL(
                                qr
                            );


                        console.log(
                            "📱 WhatsApp QR generated"
                        );

                    }

                    catch (
                        error
                    ) {

                        console.error(
                            "QR error:",
                            error.message
                        );

                    }

                }


                /*
                |--------------------------------------------------------------------------
                | CONNECTING
                |--------------------------------------------------------------------------
                */

                if (
                    connection ===
                    "connecting"
                ) {

                    console.log(
                        "🔄 WhatsApp connecting..."
                    );


                    isReady =
                        false;

                }


                /*
                |--------------------------------------------------------------------------
                | CONNECTED
                |--------------------------------------------------------------------------
                */

                if (
                    connection ===
                    "open"
                ) {

                    console.log(
                        "✅ WhatsApp Connected"
                    );


                    isReady =
                        true;


                    isConnecting =
                        false;


                    currentQR =
                        null;


                    if (
                        reconnectTimer
                    ) {

                        clearTimeout(
                            reconnectTimer
                        );


                        reconnectTimer =
                            null;

                    }

                }


                /*
                |--------------------------------------------------------------------------
                | CONNECTION CLOSED
                |--------------------------------------------------------------------------
                */

                if (
                    connection ===
                    "close"
                ) {

                    isReady =
                        false;


                    isConnecting =
                        false;


                    const statusCode =
                        new Boom(
                            lastDisconnect?.error
                        )
                            ?.output
                            ?.statusCode;


                    console.log(
                        "❌ WhatsApp disconnected"
                    );


                    console.log(
                        "Disconnect code:",
                        statusCode
                    );


                    /*
                    |--------------------------------------------------------------------------
                    | MANUAL LOGOUT
                    |--------------------------------------------------------------------------
                    */

                    if (
                        manualLogout
                    ) {

                        console.log(
                            "🛑 Manual logout - no reconnect"
                        );


                        sock =
                            null;


                        return;

                    }


                    /*
                    |--------------------------------------------------------------------------
                    | LOGGED OUT
                    |--------------------------------------------------------------------------
                    */

                    if (
                        statusCode ===
                        DisconnectReason.loggedOut
                    ) {

                        console.log(
                            "🚪 WhatsApp logged out"
                        );


                        sock =
                            null;


                        currentQR =
                            null;


                        return;

                    }


                    /*
                    |--------------------------------------------------------------------------
                    | BAD SESSION
                    |--------------------------------------------------------------------------
                    */

                    if (
                        statusCode ===
                        DisconnectReason.badSession
                    ) {

                        console.log(
                            "⚠️ Bad WhatsApp session"
                        );


                        sock =
                            null;


                        currentQR =
                            null;


                        return;

                    }


                    /*
                    |--------------------------------------------------------------------------
                    | RECONNECT
                    |--------------------------------------------------------------------------
                    */

                    sock =
                        null;


                    scheduleReconnect();

                }

            }
        );


        return sock;

    }

    catch (
        error
    ) {

        console.error(
            "❌ WhatsApp connection error:",
            error.message
        );


        sock =
            null;


        isReady =
            false;


        isConnecting =
            false;


        if (
            !manualLogout
        ) {

            scheduleReconnect();

        }


        throw error;

    }

}


/*
|--------------------------------------------------------------------------
| WAIT FOR CONNECTION
|--------------------------------------------------------------------------
*/

function waitForConnection(
    timeout = 30000
) {

    return new Promise(
        (
            resolve,
            reject
        ) => {

            const started =
                Date.now();


            const check =
                () => {

                    if (
                        sock &&
                        isReady
                    ) {

                        resolve(
                            sock
                        );

                        return;

                    }


                    if (
                        Date.now() -
                        started >
                        timeout
                    ) {

                        reject(
                            new Error(
                                "WhatsApp connection timeout"
                            )
                        );

                        return;

                    }


                    setTimeout(
                        check,
                        500
                    );

                };


            check();

        }
    );

}


/*
|--------------------------------------------------------------------------
| ENSURE CONNECTION
|--------------------------------------------------------------------------
*/

export async function ensureWhatsAppConnected() {

    if (
        sock &&
        isReady
    ) {

        return sock;

    }


    if (
        manualLogout
    ) {

        throw new Error(
            "WhatsApp authentication was removed. Connect WhatsApp again."
        );

    }


    if (
        isConnecting
    ) {

        return waitForConnection();

    }


    await connectWhatsApp();


    return waitForConnection();

}


/*
|--------------------------------------------------------------------------
| RECONNECT
|--------------------------------------------------------------------------
*/

function scheduleReconnect() {

    if (
        reconnectTimer ||
        manualLogout
    ) {

        return;

    }


    console.log(
        "🔄 Reconnecting in 5 seconds..."
    );


    reconnectTimer =
        setTimeout(
            async () => {

                reconnectTimer =
                    null;


                try {

                    await connectWhatsApp();

                }

                catch (
                    error
                ) {

                    console.error(
                        "Reconnect failed:",
                        error.message
                    );

                }

            },

            5000

        );

}


/*
|--------------------------------------------------------------------------
| STATUS
|--------------------------------------------------------------------------
*/

export function getWhatsAppStatus() {

    return {

        connected:
            isReady,

        connecting:
            isConnecting,

        status:
            isReady
                ? "connected"
                : isConnecting
                    ? "connecting"
                    : "disconnected",

        qr:
            currentQR

    };

}


/*
|--------------------------------------------------------------------------
| QR
|--------------------------------------------------------------------------
*/

export function getQRCode() {

    return currentQR;

}


/*
|--------------------------------------------------------------------------
| CHANNELS
|--------------------------------------------------------------------------
*/

export async function getChannels() {

    const socket =
        await ensureWhatsAppConnected();


    if (
        typeof socket
            .newsletterFetchAllParticipating
        !==
        "function"
    ) {

        throw new Error(
            "Your installed Baileys version does not support WhatsApp Channels."
        );

    }


    const channels =
        await socket
            .newsletterFetchAllParticipating();


    return Object.values(
        channels || {}
    )
        .map(
            channel => ({

                id:
                    channel.id,

                name:
                    channel.name ||
                    channel.subject ||
                    "WhatsApp Channel",

                type:
                    "channel"

            })
        );

}


/*
|--------------------------------------------------------------------------
| GROUPS
|--------------------------------------------------------------------------
*/

export async function getGroups() {

    const socket =
        await ensureWhatsAppConnected();


    const groups =
        await socket
            .groupFetchAllParticipating();


    return Object.values(
        groups
    )
        .map(
            group => ({

                id:
                    group.id,

                name:
                    group.subject ||
                    "Unnamed Group",

                type:
                    "group",

                participants:
                    group.participants?.length ||
                    0

            })
        );

}


/*
|--------------------------------------------------------------------------
| SEND MESSAGE
|--------------------------------------------------------------------------
*/

export async function sendWhatsAppMessage(
    jid,
    message
) {

    const socket =
        await ensureWhatsAppConnected();


    if (
        !jid
    ) {

        throw new Error(
            "Recipient ID is required."
        );

    }


    if (
        !message?.trim()
    ) {

        throw new Error(
            "Message is empty."
        );

    }


    console.log(
        `📤 Sending message to ${jid}`
    );


    const result =
        await socket.sendMessage(
            jid,
            {
                text:
                    message.trim()
            }
        );


    console.log(
        `✅ Message sent to ${jid}`
    );


    return result;

}


/*
|--------------------------------------------------------------------------
| REMOVE WHATSAPP AUTHENTICATION
|--------------------------------------------------------------------------
*/

export async function removeWhatsAppAuth() {

    console.log(
        "🗑️ Removing WhatsApp authentication..."
    );


    manualLogout =
        true;


    /*
    |--------------------------------------------------------------------------
    | STOP RECONNECT TIMER
    |--------------------------------------------------------------------------
    */

    if (
        reconnectTimer
    ) {

        clearTimeout(
            reconnectTimer
        );


        reconnectTimer =
            null;

    }


    /*
    |--------------------------------------------------------------------------
    | LOGOUT CURRENT SOCKET
    |--------------------------------------------------------------------------
    */

    if (
        sock
    ) {

        try {

            await sock.logout();


            console.log(
                "✅ WhatsApp logout successful"
            );

        }

        catch (
            error
        ) {

            console.log(
                "⚠️ Logout warning:",
                error.message
            );

        }

    }


    /*
    |--------------------------------------------------------------------------
    | RESET SOCKET
    |--------------------------------------------------------------------------
    */

    sock =
        null;

    isReady =
        false;

    isConnecting =
        false;

    currentQR =
        null;


    /*
    |--------------------------------------------------------------------------
    | DELETE AUTH FROM MONGODB
    |--------------------------------------------------------------------------
    */

    try {

        const collection =
            await getMongoAuthCollection();


        const result =
            await collection.deleteMany(
                {
                    authId:
                        WHATSAPP_AUTH_ID
                }
            );


        console.log(
            `🗑️ Deleted ${result.deletedCount} WhatsApp authentication records from MongoDB`
        );

    }

    catch (
        error
    ) {

        console.error(
            "❌ MongoDB auth deletion error:",
            error.message
        );

    }


    return {

        success:
            true,

        message:
            "WhatsApp authentication removed."

    };

}


/*
|--------------------------------------------------------------------------
| ENABLE NEW LOGIN
|--------------------------------------------------------------------------
*/

export function enableWhatsAppLogin() {

    manualLogout =
        false;

}