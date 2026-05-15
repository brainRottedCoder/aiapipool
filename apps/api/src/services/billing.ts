import Stripe from "stripe";
import { env } from "../config/env.js";
import { CONSTANTS } from "../config/constants.js";
import { db } from "../db/client.js";
import { users, usageLedger } from "../db/schema.js";
import { eq, sql } from "drizzle-orm";


export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-02-24.acacia",
  typescript: true,
});

export async function createCheckoutSession(
  userId: string,
  amount: number
): Promise<string> {
  if (amount < CONSTANTS.MIN_TOPUP_AMOUNT) {
    throw new Error(
      `Minimum top-up amount is $${CONSTANTS.MIN_TOPUP_AMOUNT}`
    );
  }

  // Ensure Stripe customer exists for this user
  const userRows = await db.select({ email: users.email, stripe_customer_id: users.stripe_customer_id }).from(users).where(eq(users.id, userId)).limit(1);
  const user = userRows[0];
  if (!user) {
    throw new Error("User not found");
  }

  let customerId = user.stripe_customer_id;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { fluxai_user_id: userId },
    });
    customerId = customer.id;
    await db.update(users).set({ stripe_customer_id: customerId }).where(eq(users.id, userId));
  }

  const idempotencyKey = `topup_${userId}_${Date.now()}`;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer: customerId,
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: { name: "FluxAI Credits" },
          unit_amount: Math.round(amount * 100),
        },
        quantity: 1,
      },
    ],
    metadata: {
      user_id: userId,
      idempotency_key: idempotencyKey,
      amount: String(amount),
    },
    success_url: `${env.NEXTAUTH_URL}/dashboard/billing?success=true`,
    cancel_url: `${env.NEXTAUTH_URL}/dashboard/billing?canceled=true`,
  });

  if (!session.url) {
    throw new Error("Stripe did not return a checkout URL");
  }

  return session.url;
}

export async function handleWebhook(
  rawBody: Buffer,
  signature: string
): Promise<void> {
  const event = stripe.webhooks.constructEvent(
    rawBody,
    signature,
    env.STRIPE_WEBHOOK_SECRET
  );

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.user_id;
    const amountStr = session.metadata?.amount;
    const idempotencyKey = session.metadata?.idempotency_key;

    if (!userId || !amountStr || !idempotencyKey) {
      throw new Error("Missing metadata in checkout session");
    }

    const amount = parseFloat(amountStr);

    await db.transaction(async (trx) => {
      // Check idempotency
      const existing = await trx
        .select()
        .from(usageLedger)
        .where(eq(usageLedger.idempotency_key, idempotencyKey))
        .limit(1);

      if (existing.length > 0) {
        return;
      }

      // Update user balance
      await trx
        .update(users)
        .set({ balance: sql`${users.balance} + ${amount}` })
        .where(eq(users.id, userId));

      // Get updated balance
      const userRows = await trx
        .select({ balance: users.balance })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      const balanceAfter = userRows[0]?.balance ?? "0";

      // Insert ledger entry
      await trx.insert(usageLedger).values({
        user_id: userId,
        amount: String(amount),
        balance_after: String(balanceAfter),
        type: "topup",
        idempotency_key: idempotencyKey,
      });
    });
  }
}
