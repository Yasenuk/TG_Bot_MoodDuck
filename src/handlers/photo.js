import { Markup } from "telegraf";
import { User } from "../models/user.js";
import { save_photo } from "../services/file.js";
import { user_states } from "../states/user_states.js";
import { generate_code } from "../utils/code_generate.js";
import main_menu, { show_user_data } from "../menus/main_menu.js";
import { Receipt } from "../models/receipt.js";

export default function register_photo(bot) {
  bot.on("photo", async (ctx, next) => {
    const tgId = ctx.from.id.toString();
    const state = user_states.get(tgId);

    if (!state) return next();

    const fileName = await save_photo(ctx);

    let user = await User.findOne({ where: { telegram_id: tgId } });

    if (!user) {
      const code = generate_code();

      user = await User.create({
        telegram_id: tgId,
        name: state.name,
        phone: state.phone,
        photo: fileName,
        unique_code: code,
			});
			
			await Receipt.create({
        user_id: user.telegram_id,
        photo: fileName,
      });

      user_states.delete(tgId);

			show_user_data(ctx, user, Receipt);

      return ctx.reply("Готово — очікуй результати розіграшу", main_menu);
    }

    if (state.step === "add_new_receipt") {
      await Receipt.create({
        user_id: user.telegram_id,
        photo: fileName,
      });

      user_states.delete(tgId);

			show_user_data(ctx, user, Receipt);
      return ctx.reply("Новий чек додано 🔥", main_menu);
    }

    next();
  });
}