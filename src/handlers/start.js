import { main_keyboard } from "../menus/main_menu.js";
import { User } from "../models/user.js";
import { user_states } from "../states/user_states.js";

export default function register_start(bot) {
	bot.start(async (ctx) => {
		const tgId = ctx.from.id.toString();
		const user = await User.findOne({ where: { telegram_id: tgId } });

		if (user) {
			return await ctx.reply("Ти вже зареєестрований!", main_keyboard);
		}

		user_states.set(tgId, { step: "name" });
		await ctx.reply("Введи свій ПІБ:");
	});
}