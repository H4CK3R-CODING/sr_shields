import cron from "node-cron";

import {
    jobFinder,
    admitCardScrape,
    resultScrape,
    admissionScrape
} from "./scrapper.js";

import { loadRecipients } from "../controllers/notificationController.js";

async function runScheduledScraper(scraper, name) {
    try {
        console.log(`⏰ Starting ${name} scheduled task...`);

        const recipients = await loadRecipients();

        if (!recipients.length) {
            console.log(
                `⚠️ No recipients configured for ${name}`
            );
            return;
        }

        const result = await scraper(
            100,
            recipients
        );

        console.log(
            `✅ ${name} completed`,
            result
        );

    } catch (error) {
        console.error(
            `❌ ${name} failed:`,
            error.message
        );
    }
}

export function startNotificationCron() {

    cron.schedule(
        "30 6 * * *",
        () => runScheduledScraper(
            admitCardScrape,
            "Admit Cards"
        ),
        {
            timezone: "Asia/Kolkata"
        }
    );

    cron.schedule(
        "30 12 * * *",
        () => runScheduledScraper(
            jobFinder,
            "Jobs"
        ),
        {
            timezone: "Asia/Kolkata"
        }
    );

    cron.schedule(
        "30 16 * * *",
        () => runScheduledScraper(
            resultScrape,
            "Results"
        ),
        {
            timezone: "Asia/Kolkata"
        }
    );

    cron.schedule(
        "23 18 * * *",
        () => runScheduledScraper(
            admissionScrape,
            "Admissions"
        ),
        {
            timezone: "Asia/Kolkata"
        }
    );

    console.log("⏰ Notification cron jobs started");
}