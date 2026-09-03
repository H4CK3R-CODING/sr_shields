import axios from "axios";
import * as cheerio from "cheerio";
import {
    sendWhatsAppMessage
} from "./whatsapp.js";
import dotenv from "dotenv";

dotenv.config();

/*
|--------------------------------------------------------------------------
| CONFIG
|--------------------------------------------------------------------------
*/

const URL = "https://www.sarkariresult.com/";

const MESSAGE_DELAY = 3000;

const RETRY_COUNT = 5;

const RETRY_DELAY = 5000;


/*
|--------------------------------------------------------------------------
| CSC CENTER FOOTER
|--------------------------------------------------------------------------
*/

const CSC_FOOTER = `
━━━━━━━━━━━━━━━━━━
🏠 *घर बैठे फॉर्म भरवाने के लिए*

अपने आवश्यक Documents 📄
*8607550898* 📱 पर भेजकर
घर बैठे फॉर्म भरवा सकते हैं।

━━━━━━━━━━━━━━━━━━
🛡️ *MR. SR's Shield Cyber Café*
🎓 *Kurukshetra University*
━━━━━━━━━━━━━━━━━━
`.trim();


/*
|--------------------------------------------------------------------------
| SLEEP
|--------------------------------------------------------------------------
*/

function sleep(ms) {
    return new Promise(
        resolve => setTimeout(resolve, ms)
    );
}


/*
|--------------------------------------------------------------------------
| FETCH WEBSITE
|--------------------------------------------------------------------------
*/

async function getWebsite() {

    try {

        const response =
            await axios.get(
                URL,
                {
                    timeout: 30000,

                    headers: {
                        "User-Agent":
                            "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/131.0.0.0 Safari/537.36",

                        "Accept":
                            "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",

                        "Accept-Language":
                            "en-US,en;q=0.9"
                    }
                }
            );

        return response.data;

    } catch (error) {

        console.error(
            "❌ Failed to fetch SarkariResult:",
            error.message
        );

        return null;

    }

}


/*
|--------------------------------------------------------------------------
| VALIDATE RECIPIENTS
|--------------------------------------------------------------------------
*/

function normalizeRecipients(
    recipients = []
) {

    if (!Array.isArray(recipients)) {
        return [];
    }

    return recipients
        .filter(
            recipient =>
                recipient &&
                recipient.id &&
                (
                    recipient.type === "group" ||
                    recipient.type === "channel"
                )
        )
        .map(
            recipient => ({

                id:
                    recipient.id,

                name:
                    recipient.name ||
                    recipient.id,

                type:
                    recipient.type

            })
        );

}


/*
|--------------------------------------------------------------------------
| NOTIFICATION COUNTS
|--------------------------------------------------------------------------
*/

export async function getNotificationCounts() {
    console.log("\n📊 FETCHING NOTIFICATION COUNTS");

    const data = await getWebsite();

    if (!data) {
        throw new Error(
            "Unable to fetch SarkariResult website."
        );
    }

    const $ = cheerio.load(data);

    const counts = {
        jobs: 0,
        admitCards: 0,
        results: 0,
        admissions: 0
    };

    $(".gb-container").each((i, element) => {

        const heading = $(element)
            .find(".gb-headline a")
            .text()
            .trim()
            .toLowerCase();

        const count = $(element)
            .find("ul.sarkari-quick-list li a")
            .length;

        if (heading === "admit card") {
            counts.admitCards = count;
        }

        if (heading === "result") {
            counts.results = count;
        }

        if (heading === "admission") {
            counts.admissions = count;
        }
    });

    $("p.gb-headline").each((i, element) => {

        const heading = $(element)
            .text()
            .trim()
            .toLowerCase();

        if (heading === "latest job") {

            counts.jobs = $(element)
                .parent()
                .find("ul.sarkari-quick-list li a")
                .length;
        }
    });

    console.log("📊 Notification Counts:", counts);

    return counts;
}


/*
|--------------------------------------------------------------------------
| SEND MESSAGE TO ONE RECIPIENT
|--------------------------------------------------------------------------
*/

async function sendToRecipient(
    recipient,
    text
) {

    let retries = 0;

    while (
        retries < RETRY_COUNT
    ) {

        try {

            /*
            |--------------------------------------------------------------------------
            | Validate recipient
            |--------------------------------------------------------------------------
            */

            if (
                !recipient?.id
            ) {

                throw new Error(
                    "Recipient ID is missing"
                );

            }


            /*
            |--------------------------------------------------------------------------
            | Validate WhatsApp recipient
            |--------------------------------------------------------------------------
            */

            if (
                !recipient.id.endsWith("@g.us") &&
                !recipient.id.endsWith("@newsletter")
            ) {

                throw new Error(
                    `Invalid recipient JID: ${recipient.id}`
                );

            }


            /*
            |--------------------------------------------------------------------------
            | SEND THROUGH CENTRAL WHATSAPP FUNCTION
            |--------------------------------------------------------------------------
            */

            const result =
                await sendWhatsAppMessage(
                    recipient.id,
                    text
                );


            console.log(
                `✅ Sent to ${recipient.type}: ${recipient.name}`
            );


            return {

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

            };


        } catch (error) {

            retries++;


            console.error(
                `❌ Failed for ${recipient.name} - Retry ${retries}/${RETRY_COUNT}`,
                error.message
            );


            if (
                retries <
                RETRY_COUNT
            ) {

                await sleep(
                    RETRY_DELAY
                );

            } else {

                return {

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

                };

            }

        }

    }

}


/*
|--------------------------------------------------------------------------
| SEND MESSAGE TO ALL SELECTED RECIPIENTS
|--------------------------------------------------------------------------
*/

async function sendMessage(
    text,
    recipients
) {

    const validRecipients =
        normalizeRecipients(
            recipients
        );


    if (
        validRecipients.length === 0
    ) {

        throw new Error(
            "No WhatsApp groups or channels selected."
        );

    }


    if (!text?.trim()) {

        throw new Error(
            "Message is empty."
        );

    }


    console.log(
        `📤 Sending notification to ${validRecipients.length} recipient(s)...`
    );


    const results = [];


    for (
        const recipient
        of validRecipients
    ) {

        const result =
            await sendToRecipient(
                recipient,
                text.trim()
            );


        results.push(
            result
        );


        /*
        |--------------------------------------------------------------------------
        | DELAY BETWEEN RECIPIENTS
        |--------------------------------------------------------------------------
        */

        await sleep(
            1200
        );

    }


    const successful =
        results.filter(
            item =>
                item.success
        ).length;


    console.log(
        `📊 Delivery: ${successful}/${results.length} successful`
    );


    return results;

}


/*
|--------------------------------------------------------------------------
| FORMAT JOB
|--------------------------------------------------------------------------
*/

function formatJob(
    job
) {

    if (!job) {
        return null;
    }


    const {

        title = "",

        importantDates = {},

        applicationFee = {},

        ageLimit = {},

        eligibility = []

    } = job;


    if (

        !title &&

        !Object.keys(
            importantDates
        ).length &&

        !Object.keys(
            applicationFee
        ).length &&

        !Object.keys(
            ageLimit
        ).length &&

        !eligibility.length

    ) {

        return null;

    }


    let msg =
        `🚨 *NEW JOB ALERT*\n\n`;

    msg +=
        `📌 *${title}*\n\n`;


    /*
    |--------------------------------------------------------------------------
    | IMPORTANT DATES
    |--------------------------------------------------------------------------
    */

    const validDates =
        Object.entries(
            importantDates
        )
        .filter(
            ([_, value]) =>
                value
        );


    if (
        validDates.length
    ) {

        msg +=
            `📅 *IMPORTANT DATES*\n`;

        validDates.forEach(
            ([key, value]) => {

                const label =
                    key
                        .replace(
                            /([A-Z])/g,
                            " $1"
                        )
                        .replace(
                            /^./,
                            s =>
                                s.toUpperCase()
                        );


                msg +=
                    `• ${label}: ${value}\n`;

            }
        );


        msg +=
            `\n`;

    }


    /*
    |--------------------------------------------------------------------------
    | APPLICATION FEE
    |--------------------------------------------------------------------------
    */

    const validFees =
        Object.entries(
            applicationFee
        )
        .filter(
            ([_, value]) =>
                value
        );


    if (
        validFees.length
    ) {

        msg +=
            `💰 *APPLICATION FEE*\n`;


        validFees.forEach(
            ([key, value]) => {

                msg +=
                    `• ${key.toUpperCase()}: ${value}\n`;

            }
        );


        msg +=
            `\n`;

    }


    /*
    |--------------------------------------------------------------------------
    | AGE LIMIT
    |--------------------------------------------------------------------------
    */

    const validAge =
        Object.entries(
            ageLimit
        )
        .filter(
            ([_, value]) =>
                value
        );


    if (
        validAge.length
    ) {

        msg +=
            `👤 *AGE LIMIT*\n`;


        validAge.forEach(
            ([key, value]) => {

                const label =
                    key
                        .replace(
                            /([A-Z])/g,
                            " $1"
                        )
                        .replace(
                            /^./,
                            s =>
                                s.toUpperCase()
                        );


                msg +=
                    `• ${label}: ${value}\n`;

            }
        );


        msg +=
            `\n`;

    }


    /*
    |--------------------------------------------------------------------------
    | ELIGIBILITY
    |--------------------------------------------------------------------------
    */

    const validEligibility =
        eligibility.filter(
            item =>
                item &&
                item.trim() &&
                item !==
                    "More Details Read the Notification."
        );


    if (
        validEligibility.length
    ) {

        msg +=
            `🎓 *ELIGIBILITY*\n`;


        validEligibility.forEach(
            item => {

                msg +=
                    `• ${item}\n`;

            }
        );


        msg +=
            `\n`;

    }


    /*
    |--------------------------------------------------------------------------
    | FOOTER
    |--------------------------------------------------------------------------
    */

    msg +=
        `${CSC_FOOTER}`;


    return msg.trim();

}


/*
|--------------------------------------------------------------------------
| SCRAPE JOB DETAILS
|--------------------------------------------------------------------------
*/

async function vacancyPageScrape(
    url
) {

    try {

        const {
            data
        } =
            await axios.get(
                url,
                {
                    timeout: 30000,

                    headers: {
                        "User-Agent":
                            "Mozilla/5.0"
                    }
                }
            );


        const $ =
            cheerio.load(
                data
            );


        const nameOfPost =
            $(".gb-headline table tbody tr")
                .first()
                .find("td")
                .eq(1)
                .text()
                .trim();


        /*
        |--------------------------------------------------------------------------
        | IMPORTANT DATES
        |--------------------------------------------------------------------------
        */

        const importantDates = {};


        $("h3:contains('Important Dates')")
            .parent()
            .find("ul li")
            .each(
                (i, el) => {

                    const text =
                        $(el)
                            .text()
                            .trim();


                    if (
                        text.includes(
                            "Application Begin"
                        )
                    ) {

                        const parts =
                            text.split(":");


                        if (
                            parts.length > 1
                        ) {

                            importantDates.startDate =
                                parts
                                    .slice(1)
                                    .join(":")
                                    .trim();

                        }

                    }


                    if (
                        text.includes(
                            "Last Date for Apply Online"
                        )
                    ) {

                        const parts =
                            text.split(":");


                        if (
                            parts.length > 1
                        ) {

                            importantDates.lastDate =
                                parts
                                    .slice(1)
                                    .join(":")
                                    .trim();

                        }

                    }

                }
            );


        /*
        |--------------------------------------------------------------------------
        | APPLICATION FEE
        |--------------------------------------------------------------------------
        */

        const applicationFee = {};


        $("h3:contains('Application Fee')")
            .parent()
            .find("ul li")
            .each(
                (i, el) => {

                    const text =
                        $(el)
                            .text()
                            .trim();


                    if (
                        text.includes(
                            "General"
                        )
                    ) {

                        const parts =
                            text.split(":");


                        if (
                            parts.length > 1
                        ) {

                            const fee =
                                parts
                                    .slice(1)
                                    .join(":")
                                    .trim();


                            applicationFee.general =
                                fee;

                            applicationFee.ews =
                                fee;

                            applicationFee.obc =
                                fee;

                        }

                    }

                }
            );


        /*
        |--------------------------------------------------------------------------
        | AGE LIMIT
        |--------------------------------------------------------------------------
        */

        const ageLimit = {};


        $("h2:contains('Age Limit')")
            .parent()
            .find("ul li")
            .each(
                (i, el) => {

                    const text =
                        $(el)
                            .text()
                            .trim();


                    if (
                        text.includes(
                            "Minimum Age"
                        )
                    ) {

                        const parts =
                            text.split(":");


                        if (
                            parts.length > 1
                        ) {

                            ageLimit.minimumAge =
                                parts
                                    .slice(1)
                                    .join(":")
                                    .trim();

                        }

                    }


                    if (
                        text.includes(
                            "Maximum Age"
                        )
                    ) {

                        const parts =
                            text.split(":");


                        if (
                            parts.length > 1
                        ) {

                            ageLimit.maximumAge =
                                parts
                                    .slice(1)
                                    .join(":")
                                    .trim();

                        }

                    }


                    if (
                        text.includes(
                            "Age Relaxation"
                        )
                    ) {

                        ageLimit.ageRelaxation =
                            text;

                    }

                }
            );


        /*
        |--------------------------------------------------------------------------
        | ELIGIBILITY
        |--------------------------------------------------------------------------
        */

        const eligibility = [];


        $("tr").each(
            (i, tr) => {

                const heading =
                    $(tr)
                        .text()
                        .trim()
                        .toLowerCase();


                if (
                    heading.includes(
                        "eligibility"
                    )
                ) {

                    const nextRow =
                        $(tr)
                            .next("tr");


                    nextRow
                        .find("td")
                        .last()
                        .find("li")
                        .each(
                            (i, li) => {

                                const text =
                                    $(li)
                                        .text()
                                        .trim();


                                if (text) {

                                    eligibility.push(
                                        text
                                    );

                                }

                            }
                        );

                }

            }
        );


        return {

            title:
                nameOfPost,

            importantDates,

            applicationFee,

            ageLimit,

            eligibility

        };


    } catch (error) {

        console.error(
            `❌ Failed to scrape job details: ${url}`,
            error.message
        );


        return null;

    }

}


/*
|--------------------------------------------------------------------------
| JOBS
|--------------------------------------------------------------------------
*/

export async function jobFinder(
    limit = 10,
    recipients = []
) {

    console.log(
        "\n======================================"
    );

    console.log(
        "🚀 CHECKING LATEST JOBS"
    );

    console.log(
        "======================================"
    );


    limit =
        Number(limit) || 10;


    const data =
        await getWebsite();


    if (!data) {

        throw new Error(
            "Unable to fetch SarkariResult website."
        );

    }


    const $ =
        cheerio.load(
            data
        );


    const jobs = [];


    $("p.gb-headline")
        .each(
            (i, el) => {

                const heading =
                    $(el)
                        .text()
                        .trim();


                if (
                    heading
                        .toLowerCase() ===
                    "latest job"
                ) {

                    $(el)
                        .parent()
                        .find(
                            "ul.sarkari-quick-list li a"
                        )
                        .slice(
                            0,
                            limit
                        )
                        .each(
                            (i, a) => {

                                const title =
                                    $(a)
                                        .text()
                                        .trim();


                                const url =
                                    $(a)
                                        .attr(
                                            "href"
                                        );


                                if (
                                    url
                                ) {

                                    jobs.push({

                                        title,

                                        url

                                    });

                                }

                            }
                        );


                    return false;

                }

            }
        );


    console.log(
        `📋 Jobs found: ${jobs.length}`
    );


    if (
        !jobs.length
    ) {

        return {

            found: 0,

            sent: 0,

            deliveries: []

        };

    }


    const sent = [];


    for (
        const item
        of jobs
    ) {

        try {

            console.log(
                `🔎 Scraping: ${item.title}`
            );


            const job =
                await vacancyPageScrape(
                    item.url
                );


            if (!job) {
                continue;
            }


            const message =
                formatJob(
                    job
                );


            if (!message) {
                continue;
            }


            const deliveries =
                await sendMessage(
                    message,
                    recipients
                );


            sent.push({

                title:
                    item.title,

                message,

                deliveries

            });


            await sleep(
                MESSAGE_DELAY
            );


        } catch (error) {

            console.error(
                `❌ Error processing job: ${item.title}`,
                error.message
            );

        }

    }


    return {

        found:
            jobs.length,

        sent:
            sent.length,

        notifications:
            sent

    };

}


/*
|--------------------------------------------------------------------------
| ADMIT CARDS
|--------------------------------------------------------------------------
*/

export async function admitCardScrape(
    limit = 10,
    recipients = []
) {

    console.log(
        "\n======================================"
    );

    console.log(
        "🎫 CHECKING ADMIT CARDS"
    );

    console.log(
        "======================================"
    );


    limit =
        Number(limit) || 10;


    const data =
        await getWebsite();


    if (!data) {

        throw new Error(
            "Unable to fetch SarkariResult website."
        );

    }


    const $ =
        cheerio.load(
            data
        );


    const admitCards = [];


    $(".gb-container")
        .each(
            (i, element) => {

                const heading =
                    $(element)
                        .find(
                            ".gb-headline a"
                        )
                        .text()
                        .trim();


                if (
                    heading
                        .toLowerCase() ===
                    "admit card"
                ) {

                    $(element)
                        .find(
                            "ul.sarkari-quick-list li a"
                        )
                        .slice(
                            0,
                            limit
                        )
                        .each(
                            (i, card) => {

                                const title =
                                    $(card)
                                        .text()
                                        .trim();


                                const url =
                                    $(card)
                                        .attr(
                                            "href"
                                        );


                                if (
                                    title &&
                                    url
                                ) {

                                    admitCards.push({

                                        title,

                                        url

                                    });

                                }

                            }
                        );

                }

            }
        );


    console.log(
        `📋 Admit Cards found: ${admitCards.length}`
    );


    const sent = [];


    for (
        const item
        of admitCards
    ) {

        const message =
`🎫 *ADMIT CARD UPDATE*

📌 *${item.title}*

━━━━━━━━━━━━━━━━━━
📢 Admit card has been released.

📝 *Important*
Candidates are advised to download their admit card and check all details carefully.

${CSC_FOOTER}`;


        try {

            const deliveries =
                await sendMessage(
                    message,
                    recipients
                );


            sent.push({

                title:
                    item.title,

                message,

                deliveries

            });


            await sleep(
                MESSAGE_DELAY
            );


        } catch (error) {

            console.error(
                `❌ Admit Card error: ${item.title}`,
                error.message
            );

        }

    }


    return {

        found:
            admitCards.length,

        sent:
            sent.length,

        notifications:
            sent

    };

}


/*
|--------------------------------------------------------------------------
| RESULTS
|--------------------------------------------------------------------------
*/

export async function resultScrape(
    limit = 10,
    recipients = []
) {

    console.log(
        "\n======================================"
    );

    console.log(
        "🎉 CHECKING RESULTS"
    );

    console.log(
        "======================================"
    );


    limit =
        Number(limit) || 10;


    const data =
        await getWebsite();


    if (!data) {

        throw new Error(
            "Unable to fetch SarkariResult website."
        );

    }


    const $ =
        cheerio.load(
            data
        );


    const results = [];


    $(".gb-container")
        .each(
            (i, element) => {

                const heading =
                    $(element)
                        .find(
                            ".gb-headline a"
                        )
                        .text()
                        .trim();


                if (
                    heading
                        .toLowerCase() ===
                    "result"
                ) {

                    $(element)
                        .find(
                            "ul.sarkari-quick-list li a"
                        )
                        .slice(
                            0,
                            limit
                        )
                        .each(
                            (i, card) => {

                                const title =
                                    $(card)
                                        .text()
                                        .trim();


                                const url =
                                    $(card)
                                        .attr(
                                            "href"
                                        );


                                if (
                                    title &&
                                    url
                                ) {

                                    results.push({

                                        title,

                                        url

                                    });

                                }

                            }
                        );

                }

            }
        );


    console.log(
        `📋 Results found: ${results.length}`
    );


    const sent = [];


    for (
        const item
        of results
    ) {

        const message =
`🎉 *RESULT UPDATE*

📌 *${item.title}*

━━━━━━━━━━━━━━━━━━
📢 The result has been released.

📝 *Important*
Candidates are advised to check their result and keep a copy for future reference.

${CSC_FOOTER}`;


        try {

            const deliveries =
                await sendMessage(
                    message,
                    recipients
                );


            sent.push({

                title:
                    item.title,

                message,

                deliveries

            });


            await sleep(
                MESSAGE_DELAY
            );


        } catch (error) {

            console.error(
                `❌ Result error: ${item.title}`,
                error.message
            );

        }

    }


    return {

        found:
            results.length,

        sent:
            sent.length,

        notifications:
            sent

    };

}


/*
|--------------------------------------------------------------------------
| ADMISSIONS
|--------------------------------------------------------------------------
*/

export async function admissionScrape(
    limit = 10,
    recipients = []
) {

    console.log(
        "\n======================================"
    );

    console.log(
        "🎓 CHECKING ADMISSIONS"
    );

    console.log(
        "======================================"
    );


    limit =
        Number(limit) || 10;


    const data =
        await getWebsite();


    if (!data) {

        throw new Error(
            "Unable to fetch SarkariResult website."
        );

    }


    const $ =
        cheerio.load(
            data
        );


    const admissions = [];


    $(".gb-container")
        .each(
            (i, element) => {

                const heading =
                    $(element)
                        .find(
                            ".gb-headline a"
                        )
                        .text()
                        .trim();


                if (
                    heading
                        .toLowerCase() ===
                    "admission"
                ) {

                    $(element)
                        .find(
                            "ul.sarkari-quick-list li a"
                        )
                        .slice(
                            0,
                            limit
                        )
                        .each(
                            (i, card) => {

                                const title =
                                    $(card)
                                        .text()
                                        .trim();


                                const url =
                                    $(card)
                                        .attr(
                                            "href"
                                        );


                                if (
                                    title &&
                                    url
                                ) {

                                    admissions.push({

                                        title,

                                        url

                                    });

                                }

                            }
                        );

                }

            }
        );


    console.log(
        `📋 Admissions found: ${admissions.length}`
    );


    const sent = [];


    for (
        const item
        of admissions
    ) {

        const message =
`🎓 *ADMISSION UPDATE*

📌 *${item.title}*

━━━━━━━━━━━━━━━━━━
📢 A new admission notification has been released.

📝 *Important*
Check eligibility, important dates and admission requirements before applying.

${CSC_FOOTER}`;


        try {

            const deliveries =
                await sendMessage(
                    message,
                    recipients
                );


            sent.push({

                title:
                    item.title,

                message,

                deliveries

            });


            await sleep(
                MESSAGE_DELAY
            );


        } catch (error) {

            console.error(
                `❌ Admission error: ${item.title}`,
                error.message
            );

        }

    }


    return {

        found:
            admissions.length,

        sent:
            sent.length,

        notifications:
            sent

    };

}


/*
|--------------------------------------------------------------------------
| EXPORT HELPERS
|--------------------------------------------------------------------------
*/

export {
    formatJob,
    sendMessage
};