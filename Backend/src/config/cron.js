import cron from "node-cron"
import { publishScheduledGames } from "../jobs/publishGame.job.js"


cron.schedule("* * * * *", async () => {
    await publishScheduledGames();
})

