import { Telegraf } from "telegraf";
import { sequelize } from './db.js'

import register_start from "./handlers/start.js";
import register from "./handlers/register.js";
import register_actions from "./handlers/actions.js";
import register_photo from "./handlers/photo.js";

const bot = new Telegraf(process.env.BOT_TOKEN);

register_start(bot);
register(bot);
register_photo(bot);
register_actions(bot);

bot.catch((err, ctx) => {
  console.error("GLOBAL BOT ERROR", err);
});

(async () => {
  try {
    await sequelize.sync();
    console.log("🔥 DB synced");

    await bot.launch();
    console.log("🤖 MoodDuck Bot running...");
  } catch (err) {
    console.error("DB ERROR:", err);
  }
})();
