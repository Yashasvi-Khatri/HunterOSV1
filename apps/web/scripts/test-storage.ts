import { db } from "../app/lib/db";
import {
  getSettingsDB,
  saveSettingsDB,
  getConversationsDB,
} from "../app/lib/storage-server";

async function main() {
  const user = await db.user.findFirst();
  if (!user) {
    console.error("No users in database. Sign in with Google first, then re-run.");
    process.exit(1);
  }

  console.log(`Testing storage for user: ${user.email ?? user.id}`);

  await saveSettingsDB(user.id, {
    defaultModel: "openai/gpt-4o",
    theme: "dark",
    systemPrompt: "Test prompt from storage test script",
  });

  const settings = await getSettingsDB(user.id);
  console.log("Settings saved and retrieved:", settings);

  const conversations = await getConversationsDB(user.id);
  console.log(`Conversations loaded: ${conversations.length}`);
}

main()
  .catch((err) => {
    console.error("Storage test failed:", err);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
