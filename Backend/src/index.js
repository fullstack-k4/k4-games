import dotenv from "dotenv"
import { app } from "./app.js"
import cluster from "cluster";
import connectDB from "./db/index.js"
import os from "os";

const totalCPUs = os.cpus().length;

dotenv.config({
    path: './.env'
})

if (cluster.isPrimary) {
    console.log(`Master ${process.pid} is running`);

    // Connect DB for cron jobs in master
    connectDB()
        .then(() => {
            console.log("✅ MongoDB connected in master for cron jobs");

            import("./config/cron.js").then(() => {
                console.log("✅ Cron jobs started in master process");
            });
        })
        .catch((err) => {
            console.error("❌ MongoDB connection failed in master:", err);
        });

    // Fork workers for API
    for (let i = 0; i < totalCPUs; i++) {
        cluster.fork();
    }

    cluster.on("exit", (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} exited. Starting a new worker...`);
        cluster.fork();
    });

} else {
    connectDB()
        .then(() => {
            const server = app.listen(process.env.PORT || 8000, () => {
                console.log(`🚀 Worker ${process.pid} running API on port ${process.env.PORT}`);
            });
            server.timeout = 600000;

            app.on("error", (error) => {
                console.log("ERR:", error);
                throw error;
            });
        })
        .catch((err) => {
            console.log("❌ MONGO db connection failed in worker !!!", err);
        });
}
