import db from "#db/client";
import { createUser } from "#db/queries/users";
import { createProduct } from "#db/queries/products";
import { createOrder } from "#db/queries/orders";
import { createOrderProduct } from "#db/queries/orders_products";

await db.connect();
await seed();
await db.end();

console.log("🌱 Database seeded.");

async function seed() {
  // 1. Create user
  const user = await createUser("testuser", "password123");

  // 2. Create 10 products
  const products = [];

  for (let i = 1; i <= 10; i++) {
    const product = await createProduct(
      `Product ${i}`,
      `Description for product ${i}`,
      (i * 10).toFixed(2)
    );
    products.push(product);
  }

  // 3. Create order for user
  const order = await createOrder(new Date(), "First order", user.id);

  // 4. Attach 5 distinct products to order
  for (let i = 0; i < 5; i++) {
    await createOrderProduct(order.id, products[i].id, i + 1);
  }
}