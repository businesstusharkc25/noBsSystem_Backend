import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import dotEnv from "dotenv";
import userRouter from "./routes/userRoutes.js";
import contentRouter from "./routes/contentRoutes.js";
import membershipRouter from "./routes/membershipsRoutes.js";
import channelRouter from "./routes/channelRoutes.js";

dotEnv.config();

const app = express();
app.use(cors({ origin: process.env.LOCAL_CLIENT_URL }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use("/user", userRouter);
app.use("/content", contentRouter);
app.use("/membership", membershipRouter);
app.use("/channel", channelRouter);

const PORT = process.env.PORT || 5000;

mongoose.set("strictQuery", false);

mongoose
  .connect(`${process.env.DB_CONNECTION_STRING}/creator_database`)
  .then(() =>
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
  )
  .catch((error) => console.log(error));
