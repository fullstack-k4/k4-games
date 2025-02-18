import dotenv from "dotenv"
import { app } from "./app.js"
import cluster from "cluster";
import connectDB from "./db/index.js"
import os from "os";

const totalCPUs=os.cpus().length;

dotenv.config({
    path:'./.env'
})

if(cluster.isPrimary){
    for(let i=0;i<totalCPUs;i++){
        cluster.fork();
    }
}
else{
    connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`Server is running at port ${process.env.PORT}`)

    })

    app.on("error",(error)=>{
        console.log("ERR:",error);
        throw error
    })
    
     // Handle worker exit and restart
     cluster.on("exit", (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} exited. Starting a new worker...`);
        cluster.fork(); // Restart the worker
    });
})
.catch((err)=>{
    console.log("MONGO db connection failed !!!",err);
})

}




   


