import { db } from "../app/lib/db";

async function main() {
  await db.$queryRaw`SELECT 1`;
  const userCount = await db.user.count();
  console.log("Prisma client initialized successfully");
  console.log(`Connected — ${userCount} user(s) in database`);
}

main()
  .catch((err) => {
    console.error("Database connection failed:", err);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
