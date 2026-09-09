/**
 * One-time Firestore seed. Populates `categories` and `products` with the
 * starter content in seed-data.ts.
 *
 * Setup:
 *   1. Firebase console -> Project settings -> Service accounts ->
 *      "Generate new private key". Save it as ./serviceAccountKey.json
 *      (git-ignored), OR set GOOGLE_APPLICATION_CREDENTIALS to its path.
 *   2. npm run seed
 *
 * Idempotent: category docs are keyed by slug and product docs by slug, so
 * re-running overwrites the seed rows (and would discard later edits to them).
 */
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { applicationDefault, cert, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { SEED_CATEGORIES, SEED_PRODUCTS } from './seed-data';

const keyPath = fileURLToPath(new URL('../serviceAccountKey.json', import.meta.url));

initializeApp({
  credential:
    existsSync(keyPath) && !process.env.GOOGLE_APPLICATION_CREDENTIALS
      ? cert(keyPath)
      : applicationDefault(),
});

const db = getFirestore();

async function run() {
  const now = Date.now();
  const batch = db.batch();

  for (const { key, ...category } of SEED_CATEGORIES) {
    batch.set(db.collection('categories').doc(key), category);
  }

  for (const { categoryKey, ...product } of SEED_PRODUCTS) {
    const category = SEED_CATEGORIES.find((c) => c.key === categoryKey);
    if (!category) throw new Error(`Unknown categoryKey: ${categoryKey}`);
    batch.set(db.collection('products').doc(product.slug), {
      ...product,
      categoryId: category.key,
      categoryName: category.name,
      createdAt: now,
      updatedAt: now,
    });
  }

  await batch.commit();
  // eslint-disable-next-line no-console
  console.log(
    `Seeded ${SEED_CATEGORIES.length} categories and ${SEED_PRODUCTS.length} products.`,
  );
}

run().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
