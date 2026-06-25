import express from "express";
import morgan from "morgan";

import getUserFromToken from "#middleware/getUserFromToken";
import orderRouter from "#api/orders";
import productRouter from "#api/products";
import userRouter from "#api/users";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.use(getUserFromToken);

app.use("/orders", orderRouter);
app.use("/products", productRouter);
app.use("/users", userRouter);

app.use((err, req, res, next) => {
  switch (err.code) {
    case "22P02":
      return res.status(400).send(err.message);
    case "23505":
    case "23503":
      return res.status(400).send(err.detail);
    default:
      next(err);
  }
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send("Sorry! Something went wrong.");
});

export default app;