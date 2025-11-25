import { Markup } from "telegraf";
import { request_phone } from "../menus/main_menu.js";
import { user_states } from "../states/user_states.js";

export default function register(bot) {
	bot.on("text", async (ctx, next) => {
		const tgId = ctx.from.id.toString();
		const state = user_states.get(tgId);

		if (!state) return next();

		const text = ctx.message.text.trim();

		if (state.step === "name") {
			state.name = text;
			state.step = "phone";

			return ctx.reply("Тепер поділися номером телефону", request_phone);
		}

		if (state.step === "phone") {
			return ctx.reply(
				"Поділися номером телефону кнопкою знизу!",
				request_phone
			);
		}
	});

	bot.on("contact", async (ctx, next) => {
		const tgId = ctx.from.id.toString();
		const state = user_states.get(tgId);

		if (!state) return next();

		const phone = ctx.message.contact.phone_number;

		if (state.step === "phone") {
			state.phone = phone;
			state.step = "photo";

			return ctx.reply(
				"Супер! Тепер надішли фото чеку",
				Markup.removeKeyboard()
			);
		}
	});
}
