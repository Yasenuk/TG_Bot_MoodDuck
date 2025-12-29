import { Telegraf } from "telegraf";
import "dotenv/config";

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.catch((err) => {
  console.error("GLOBAL BOT ERROR:", err);
});

(async () => {
  try {
    await bot.launch();
    console.log("🤖 MoodDuck Bot running...");

    await bot.telegram.sendMessage(
      process.env.BOT_START_CHAT_ID,
      `🔔 <b>Увага!</b> Сьогодні о <b>19:00</b> ми проведемо пряму трансляцію в Instagram, де і виберемо переможців розіграшу.

Посилання надішлемо коли трансляція почнеться, тому будьте на звʼязку 🤝

Також радимо підписатись на наші соцмережі — там завжди багато цікавого 🫶

<a href="https://www.instagram.com/moodduck_liquid?igsh=MTZ0aW5ldjVqcnNnZw==">Наш Instagram</a>
<a href="https://vm.tiktok.com/ZMHKwNsf5HuNQ-qA4pl/">Наш TikTok</a>
<a href="https://t.me/MoodDuck_manager">Наш Telegram</a>`,
      {
        parse_mode: "HTML",
        disable_web_page_preview: true
      }
    );

  } catch (err) {
    console.error("STARTUP ERROR:", err);
  }
})();
