import { user_states } from "../states/user_states.js";

export default function register_actions(bot) {
	bot.action("add_new_receipt", async (ctx) => {
		try {
			await ctx.answerCbQuery("Додаємо новий чек...");

			const tgId = ctx.from.id.toString();
			const menuMessage = ctx.callbackQuery.message;

			user_states.set(tgId, {
				step: "add_new_receipt",
				last_bot_message_id: menuMessage?.message_id,
			});

			if (menuMessage) {
				await ctx.editMessageReplyMarkup(undefined);
			}

			const msg = await ctx.reply("Надішли фото нового чеку");
			user_states.get(tgId).ask_message_id = msg.message_id;
		} catch (err) {
			console.error("add_new_receipt error:", err);
		}
	});

	bot.hears("Добавити новий чек", async (ctx) => {
		try {
			const tgId = ctx.from.id.toString();

			if (ctx.message.reply_to_message) {
				try {
					await ctx.deleteMessage(ctx.message.reply_to_message.message_id);
				} catch {}
			}

			user_states.set(tgId, {
				step: "add_new_receipt",
			});

			const msg = await ctx.reply("Надішли фото нового чеку");
			user_states.get(tgId).ask_message_id = msg.message_id;
		} catch (err) {
			console.error("hears add receipt error:", err);
		}
	});
}
