import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";


const app=express();

const corsOptions = {
    origin: process.env.CORS_ORIGIN,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true, 
    allowedHeaders: ['Content-Type', 'Authorization','x-api-key'],
  };
  
  app.use(cors(corsOptions));




app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(express.static("public"))
app.use(cookieParser());

// HealthCheck Route
app.get("/",(req,res)=>{
    res.send("Api Running");
})




// route import


import userRouter from "./routes/user.routes.js"
import gameRouter from "./routes/game.routes.js"
import categoryRouter from "./routes/category.routes.js"
import dashboardRouter from "./routes/dashboard.routes.js"


// route declaration
app.use("/api/v1/users",userRouter);
app.use("/api/v1/games",gameRouter);
app.use("/api/v1/category",categoryRouter);
app.use("/api/v1/dashboard",dashboardRouter);

export {app};