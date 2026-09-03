import {
    connectWhatsApp,
    ensureWhatsAppConnected,
    getWhatsAppStatus,
    getQRCode,
    getGroups,
    getChannels,
    sendWhatsAppMessage,
    removeWhatsAppAuth,
    enableWhatsAppLogin,
    getMongoDatabase
} from "../services/whatsapp.js";

import {
    jobFinder,
    admitCardScrape,
    resultScrape,
    admissionScrape,
    getNotificationCounts
} from "../services/scrapper.js";


// ============================================================
// CONFIG
// ============================================================

const WHATSAPP_AUTH_ID =
    process.env.WHATSAPP_AUTH_ID || "default";

const RECIPIENT_COLLECTION =
    "whatsapp_recipients";


// ============================================================
// MONGODB RECIPIENT HELPERS
// ============================================================

async function getRecipientCollection() {

    const db = await getMongoDatabase();

    const collection =
        db.collection(RECIPIENT_COLLECTION);

    // Prevent duplicate recipient IDs
    await collection.createIndex(
        {
            authId: 1,
            id: 1
        },
        {
            unique: true
        }
    );

    return collection;
}


// ============================================================
// LOAD SAVED RECIPIENTS
// ============================================================

export async function loadRecipients() {

    const collection =
        await getRecipientCollection();

    return collection
        .find({
            authId: WHATSAPP_AUTH_ID,
            selected: true
        })
        .project({
            _id: 0,
            id: 1,
            name: 1,
            type: 1
        })
        .toArray();
}

export async function notificationCounts(req, res) {
    try {

        const counts = await getNotificationCounts();

        res.json({
            success: true,
            counts
        });

    } catch (error) {

        console.error(
            "Notification counts error:",
            error
        );

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}


// ============================================================
// WHATSAPP STATUS
// ============================================================

export async function whatsappStatus(req, res) {

    try {

        res.json({
            success: true,
            ...getWhatsAppStatus()
        });

    } catch (error) {

        console.error(
            "WhatsApp status error:",
            error
        );

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
}


// ============================================================
// WHATSAPP QR
// ============================================================

export async function getWhatsAppQR(req, res) {

    try {

        // Allow a new login after logout
        enableWhatsAppLogin();

        const status =
            getWhatsAppStatus();


        // Already connected
        if (status.connected) {

            return res.json({
                success: true,
                connected: true,
                status: "connected",
                qr: null
            });

        }


        // Start connection if not already connecting
        if (!status.connecting) {

            connectWhatsApp().catch(error => {

                console.error(
                    "WhatsApp connection error:",
                    error.message
                );

            });

        }


        // Wait for QR or successful connection
        for (let i = 0; i < 30; i++) {

            const qr =
                getQRCode();

            const current =
                getWhatsAppStatus();


            // Connected while waiting
            if (current.connected) {

                return res.json({
                    success: true,
                    connected: true,
                    status: "connected",
                    qr: null
                });

            }


            // QR available
            if (qr) {

                return res.json({
                    success: true,
                    connected: false,
                    status: "waiting_for_scan",
                    qr
                });

            }


            await new Promise(resolve =>
                setTimeout(resolve, 500)
            );

        }


        // Timeout
        const finalStatus =
            getWhatsAppStatus();

        res.json({
            success: true,
            connected: finalStatus.connected,
            status: finalStatus.status,
            qr: getQRCode()
        });

    } catch (error) {

        console.error(
            "QR API error:",
            error
        );

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
}


// ============================================================
// LOGOUT / REMOVE WHATSAPP AUTH
// ============================================================

export async function logoutWhatsApp(req, res) {

    try {

        const result =
            await removeWhatsAppAuth();


        // Also clear selected recipients
        const collection =
            await getRecipientCollection();

        await collection.updateMany(
            {
                authId: WHATSAPP_AUTH_ID
            },
            {
                $set: {
                    selected: false
                }
            }
        );


        res.json({
            success: true,
            ...result
        });

    } catch (error) {

        console.error(
            "WhatsApp logout error:",
            error
        );

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
}


// ============================================================
// GET WHATSAPP GROUPS
// ============================================================

export async function getWhatsAppGroups(req, res) {

    try {

        const groups =
            await getGroups();

        const collection =
            await getRecipientCollection();


        // Save/update groups in MongoDB
        if (groups.length) {

            const operations =
                groups.map(group => ({
                    updateOne: {
                        filter: {
                            authId:
                                WHATSAPP_AUTH_ID,

                            id:
                                group.id
                        },

                        update: {
                            $set: {
                                authId:
                                    WHATSAPP_AUTH_ID,

                                id:
                                    group.id,

                                name:
                                    group.name,

                                type:
                                    "group",

                                participants:
                                    group.participants || 0,

                                updatedAt:
                                    new Date()
                            },

                            $setOnInsert: {
                                selected:
                                    false,

                                createdAt:
                                    new Date()
                            }
                        },

                        upsert: true
                    }
                }));


            await collection.bulkWrite(
                operations,
                {
                    ordered: false
                }
            );

        }


        res.json({
            success: true,
            groups
        });

    } catch (error) {

        console.error(
            "Get WhatsApp groups error:",
            error
        );

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
}


// ============================================================
// GET WHATSAPP CHANNELS
// ============================================================

export async function getWhatsAppChannels(req, res) {

    try {

        const collection =
            await getRecipientCollection();

        let channels = [];


        // Try WhatsApp first
        try {

            channels =
                await getChannels();

        } catch (error) {

            console.error(
                "WhatsApp channel refresh failed:",
                error.message
            );

        }


        // Save fresh channels
        if (channels.length) {

            const operations =
                channels.map(channel => ({
                    updateOne: {
                        filter: {
                            authId:
                                WHATSAPP_AUTH_ID,

                            id:
                                channel.id
                        },

                        update: {
                            $set: {
                                authId:
                                    WHATSAPP_AUTH_ID,

                                id:
                                    channel.id,

                                name:
                                    channel.name,

                                type:
                                    "channel",

                                updatedAt:
                                    new Date()
                            },

                            $setOnInsert: {
                                selected:
                                    false,

                                createdAt:
                                    new Date()
                            }
                        },

                        upsert: true
                    }
                }));


            await collection.bulkWrite(
                operations,
                {
                    ordered: false
                }
            );

        }


        // Load channels from MongoDB
        const savedChannels =
            await collection
                .find({
                    authId:
                        WHATSAPP_AUTH_ID,

                    type:
                        "channel"
                })
                .project({
                    _id: 0,
                    id: 1,
                    name: 1,
                    type: 1
                })
                .toArray();


        res.json({
            success: true,
            channels:
                savedChannels
        });

    } catch (error) {

        console.error(
            "Get WhatsApp channels error:",
            error
        );

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
}


// ============================================================
// GET SAVED RECIPIENTS
// ============================================================

export async function getRecipients(req, res) {

    try {

        const recipients =
            await loadRecipients();

        res.json({
            success: true,
            recipients
        });

    } catch (error) {

        console.error(
            "Get recipients error:",
            error
        );

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
}


// ============================================================
// SAVE SELECTED RECIPIENTS
// ============================================================

export async function saveRecipients(req, res) {

    try {

        const {
            recipients = []
        } = req.body || {};


        if (!Array.isArray(recipients)) {

            return res.status(400).json({
                success: false,
                message:
                    "Recipients must be an array."
            });

        }


        const collection =
            await getRecipientCollection();


        // Clear previous selections
        await collection.updateMany(
            {
                authId:
                    WHATSAPP_AUTH_ID
            },
            {
                $set: {
                    selected: false,
                    updatedAt: new Date()
                }
            }
        );


        // Validate recipients
        const validRecipients =
            recipients
                .filter(recipient =>
                    recipient &&
                    recipient.id &&
                    (
                        recipient.type === "group" ||
                        recipient.type === "channel"
                    )
                )
                .map(recipient => ({
                    id:
                        recipient.id,

                    name:
                        recipient.name ||
                        recipient.id,

                    type:
                        recipient.type
                }));


        // Save selected recipients
        if (validRecipients.length) {

            const operations =
                validRecipients.map(recipient => ({
                    updateOne: {

                        filter: {
                            authId:
                                WHATSAPP_AUTH_ID,

                            id:
                                recipient.id
                        },

                        update: {
                            $set: {
                                authId:
                                    WHATSAPP_AUTH_ID,

                                id:
                                    recipient.id,

                                name:
                                    recipient.name,

                                type:
                                    recipient.type,

                                selected:
                                    true,

                                updatedAt:
                                    new Date()
                            },

                            $setOnInsert: {
                                createdAt:
                                    new Date()
                            }
                        },

                        upsert: true

                    }
                }));


            await collection.bulkWrite(
                operations,
                {
                    ordered: false
                }
            );

        }


        res.json({
            success: true,
            message:
                "Recipients saved successfully.",
            recipients:
                validRecipients
        });

    } catch (error) {

        console.error(
            "Save recipients error:",
            error
        );

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
}


// ============================================================
// SEND CUSTOM MESSAGE
// ============================================================

export async function sendMessage(req, res) {

    try {

        const {
            message,
            recipientIds = []
        } = req.body || {};


        if (!message?.trim()) {

            return res.status(400).json({
                success: false,
                message:
                    "Message is required."
            });

        }


        if (
            !Array.isArray(recipientIds) ||
            recipientIds.length === 0
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "No WhatsApp recipients selected."
            });

        }


        // Make sure WhatsApp is connected
        await ensureWhatsAppConnected();


        const saved =
            await loadRecipients();


        // Only send to saved recipients
        const recipients =
            saved.filter(recipient =>
                recipientIds.includes(
                    recipient.id
                )
            );


        if (!recipients.length) {

            return res.status(400).json({
                success: false,
                message:
                    "Selected recipients were not found."
            });

        }


        const results = [];


        for (const recipient of recipients) {

            try {

                const result =
                    await sendWhatsAppMessage(
                        recipient.id,
                        message.trim()
                    );


                results.push({
                    id:
                        recipient.id,

                    name:
                        recipient.name,

                    type:
                        recipient.type,

                    success:
                        true,

                    messageId:
                        result?.key?.id ||
                        null
                });

            } catch (error) {

                results.push({
                    id:
                        recipient.id,

                    name:
                        recipient.name,

                    type:
                        recipient.type,

                    success:
                        false,

                    error:
                        error.message
                });

            }


            // Delay between recipients
            await new Promise(resolve =>
                setTimeout(resolve, 1200)
            );

        }


        const successful =
            results.filter(
                item => item.success
            ).length;


        res.json({
            success: true,
            message:
                `Message sent to ${successful}/${results.length} recipients.`,
            successful,
            total:
                results.length,
            results
        });

    } catch (error) {

        console.error(
            "Send WhatsApp message error:",
            error
        );

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
}


// ============================================================
// GENERIC SCRAPER RUNNER
// ============================================================

async function runScraper(
    scraper,
    req,
    res
) {

    try {

        const {
            limit = 10
        } = req.body || {};


        const saved =
            await loadRecipients();


        if (!saved.length) {

            return res.status(400).json({
                success: false,
                message:
                    "No WhatsApp recipients selected."
            });

        }


        const result =
            await scraper(
                Number(limit),
                saved
            );


        res.json({
            success: true,
            result
        });

    } catch (error) {

        console.error(
            "Scraper error:",
            error
        );

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
}


// ============================================================
// JOBS
// ============================================================

export async function runJobs(req, res) {

    return runScraper(
        jobFinder,
        req,
        res
    );

}


// ============================================================
// ADMIT CARDS
// ============================================================

export async function runAdmitCards(req, res) {

    return runScraper(
        admitCardScrape,
        req,
        res
    );

}


// ============================================================
// RESULTS
// ============================================================

export async function runResults(req, res) {

    return runScraper(
        resultScrape,
        req,
        res
    );

}


// ============================================================
// ADMISSIONS
// ============================================================

export async function runAdmissions(req, res) {

    return runScraper(
        admissionScrape,
        req,
        res
    );

}


// ============================================================
// RUN ALL
// ============================================================

export async function runAll(req, res) {

    try {

        const {
            jobs = 10,
            admitCards = 10,
            results = 10,
            admissions = 10
        } = req.body || {};


        const saved =
            await loadRecipients();


        if (!saved.length) {

            return res.status(400).json({
                success: false,
                message:
                    "No recipients selected."
            });

        }


        const result = {};


        result.jobs =
            await jobFinder(
                Number(jobs),
                saved
            );


        result.admitCards =
            await admitCardScrape(
                Number(admitCards),
                saved
            );


        result.results =
            await resultScrape(
                Number(results),
                saved
            );


        result.admissions =
            await admissionScrape(
                Number(admissions),
                saved
            );


        res.json({
            success: true,
            message:
                "All notification categories completed.",
            result
        });

    } catch (error) {

        console.error(
            "Run all notifications error:",
            error
        );

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

}