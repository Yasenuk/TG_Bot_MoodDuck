import { user_states } from "../states/user_states.js";

export default function register_actions(bot) {
	bot.action("add_new_receipt", async (ctx) => {
		const tgId = ctx.from.id.toString();
		const menuId = ctx.callbackQuery.message.message_id;

		user_states.set(tgId, {
			step: "add_new_receipt",
			last_bot_message_id: menuId,
		});

		await ctx.answerCbQuery();
		if (menuId) await ctx.deleteMessage(menuId);

		const msg = await ctx.reply("Надішли фото нового чеку");
		user_states.get(tgId).ask_message_id = msg.message_id;
	});

	bot.hears("Добавити новий чек", async (ctx) => {
		const tgId = ctx.from.id.toString();

		if (ctx.message.reply_to_message) {
			try {
				await ctx.deleteMessage(ctx.message.reply_to_message.message_id);
			} catch {
				console.log("err");
				
			}
		}

		user_states.set(tgId, {
			step: "add_new_receipt",
		});

		const msg = await ctx.reply("Надішли фото нового чеку");
		user_states.get(tgId).ask_message_id = msg.message_id;
	});
}
