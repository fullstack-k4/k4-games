import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import webpush from "web-push"


const app = express();

const allowedOrigins = [
  process.env.CORS_ORIGIN_1,
  process.env.CORS_ORIGIN_2,
  process.env.CORS_ORIGIN_3
]

const { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_EMAIL } = process.env

webpush.setVapidDetails(
  VAPID_EMAIL,
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
)


const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
};



app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"))
app.use(cookieParser());

// HealthCheck Route
app.get("/", (req, res) => {
  res.send("Api Running");
})

app.post("/save-score", (req, res) => {
  const { score } = req.body;
  console.log(score);
})



// route import
import userRouter from "./routes/user.routes.js"
import gameRouter from "./routes/game.routes.js"
import categoryRouter from "./routes/category.routes.js"
import dashboardRouter from "./routes/dashboard.routes.js"
import moreAppRouter from "./routes/moreapp.routes.js"
import formRouter from "./routes/form.routes.js"
import reportRouter from "./routes/report.routes.js"
import pageRouter from "./routes/page.routes.js"
import voteRouter from "./routes/vote.routes.js"
import adBannerRouter from "./routes/adbanner.routes.js"
import adBannerWebRouter from "./routes/adbannerweb.routes.js"
import gameScoreRouter from "./routes/gamescore.routes.js"
import webpushSubscriptionRouter from "./routes/webpushsubscription.routes.js"
import knifeThrowGameRouter from "./routes/knifethrowgames.routes.js"
import offlinegamesappRouter from "./routes/offlinegamesappgame.routes.js"
import offlinegamesappCategoryRouter from "./routes/offlinegamesappcategory.routes.js"



// route declaration
app.use("/api/v1/users", userRouter);
app.use("/api/v1/games", gameRouter);
app.use("/api/v1/category", categoryRouter);
app.use("/api/v1/dashboard", dashboardRouter);
app.use("/api/v1/moreapp", moreAppRouter);
app.use("/api/v1/form", formRouter);
app.use("/api/v1/report", reportRouter);
app.use("/api/v1/pages", pageRouter);
app.use("/api/v1/vote", voteRouter);
app.use("/api/v1/adbanner", adBannerRouter);
app.use("/api/v1/adbannerweb", adBannerWebRouter)
app.use("/api/v1/gamescore", gameScoreRouter);
app.use("/api/v1/webpushsubscription", webpushSubscriptionRouter);
app.use("/api/v1/knifethrowgame", knifeThrowGameRouter);
app.use("/api/v1/offlinegamesapp", offlinegamesappRouter);
app.use("/api/v1/offlinegamescategory",offlinegamesappCategoryRouter);



export { app };