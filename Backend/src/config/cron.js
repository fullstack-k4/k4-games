import cron from "node-cron"
import { publishScheduledGames } from "../jobs/publishGame.job.js"


cron.schedule("0 31 * * * *", async () => {
    await publishScheduledGames();
})

