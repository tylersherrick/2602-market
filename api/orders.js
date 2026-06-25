import express from "express";
const router = express.Router();

import {
  createOrder,
  getOrderById,
  getOrdersByUserId
} from "#db/queries/orders";

import { createOrderProduct } from "#db/queries/orders_products";
import { getProductById } from "#db/queries/products";

import requireUser from "#middleware/requireUser";
import requireBody from "#middleware/requireBody";

router.use(requireUser);

router.get("/", async (req, res) => {
  const orders = await getOrdersByUserId(req.user.id);
  res.send(orders);
});

router.post("/", requireBody(["date"]), async (req, res) => {
  const { date, note } = req.body;
  const order = await createOrder(date, note, req.user.id);
  res.status(201).send(order);
});

router.param("id", async (req, res, next, id) => {
  const order = await getOrderById(id);

  if (!order) return res.status(404).send("Order not found.");

  if (order.user_id !== req.user.id) {
    return res.status(403).send("No permission to access this order");
  }

  req.order = order;
  next();
});

router.get("/:id", (req, res) => {
  res.send(req.order);
});

router.get("/:id/products", async (req, res) => {
  const { getProductsByOrderId } = await import("#db/queries/products");
  const products = await getProductsByOrderId(req.order.id);
  res.send(products);
});

router.post(
  "/:id/products",
  requireBody(["productId", "quantity"]),
  async (req, res) => {
    const { productId, quantity } = req.body;

    const product = await getProductById(productId);
    if (!product) return res.status(400).send("Invalid productId");

    const orderProduct = await createOrderProduct(
      req.order.id,
      productId,
      quantity
    );

    res.status(201).send(orderProduct);
  }
);

export default router;