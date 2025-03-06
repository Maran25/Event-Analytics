import dotenv from "dotenv";
import express, { Express } from "express";
import { errorHandler } from "./middlewares/errorHandler";
import { rateLimiter } from "./middlewares/rateLimiter";
import routes from "./routes";
import { setupSwagger } from "./swagger";

dotenv.config();

const app: Express = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(rateLimiter);

app.use("/api", routes);

setupSwagger(app);

app.use(errorHandler);

export default app;
