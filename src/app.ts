import dotenv from "dotenv";
import express, { Express } from "express";
import { errorHandler } from "./middlewares/errorHandler";
import { rateLimiter } from "./middlewares/rateLimiter";
import routes from "./routes";

dotenv.config();

const app: Express = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(rateLimiter);

app.use("/api", routes);

app.use(errorHandler);

export default app;
