import morgan from "morgan";

const loggerMiddleware = morgan(process.env.NODE_ENV === "production" ? "combined" : "dev");

export default loggerMiddleware;
