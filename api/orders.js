import express from "express";
const router = express.Router();
export default router;

import {
    createOrder,
    getOrderById,
    getOrdersByUserId
} from "#db/queries/orders";
import { createOrderProduct } from "#db/queries/orders_products";
import { getOrdersByProductId } from "#db/queries/orders";
import requireUser from "#middleware/requireUser";
import requireBody from "#middleware/requireBody";

router.use(requireUser);

router.get("/", async(req, res) => {
    const orders = await getOrdersByUserId(req.user.id);
    res.send(orders);
});

router.post("/", requireBody(["date", "note", "user_id"]), async(req, res) => {
    const { date, note, user_id } = req.body;
    const order = await createOrder(date, note, req.user.id);
    res.status(201).send(order);
});

router.param("id", async(req, res, next, id) => {
    const order = await getOrderById(id);
    if(!order) return res.status(404).send("Order not found.");
    if(order.user_id !== req.user.id) return res.status(403).send("No permission to access this order");
    req.order = order;
    next();
});

router.get("/:id", (req, res) => {
    res.send(req.order);
});

router.get("/:id/orders", async(req, res) => {
    const orders= await getOrdersByProductId(req.product.id);
    res.send(orders);
});

router.post("/:id/orders", requireBody(["orderId"]), async(req, res) => {
    const { orderId } = req.body;
    const orderProduct = await createOrderProduct(req.order.id, productId);
    res.status(201).send(orderProduct);
});