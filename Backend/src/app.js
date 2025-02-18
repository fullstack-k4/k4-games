import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";


const app=express();

const corsOptions = {
    origin: process.env.CORS_ORIGIN,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true, 
    allowedHeaders: ['Content-Type', 'Authorization'],
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


// route declaration
app.use("/api/v1/users",userRouter);
app.use("/api/v1/games",gameRouter);



export {app};