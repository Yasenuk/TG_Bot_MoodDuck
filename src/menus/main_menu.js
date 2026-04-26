import { Markup } from "telegraf";
import { change_state, user_states } from "../states/user_states.js";
import { User } from "../models/user.js";
import { Receipt } from "../models/receipt.js";

export class Menu {
	constructor() {}

	async create_receipt(ctx, tgId, state) {
		const user = await User.findOne({ where: { telegram_id: tgId } });

		if (!user) return;

		const receipt = await Receipt.create({
			user_id: user.telegram_id,
			url: state.data.fileUrl
		});
	}

	async create_user(ctx, tgId, state) {
		if (!state.data.name || !state.data.phone) return;

		const user = await User.create({
			telegram_id: tgId,
			name: state.data.name,
			phone: state.data.phone,
			date: new Date(),
		});
	}

	// Головне меню
	showMainMenu() {
		return Markup.keyboard([["Добавити новий чек"]]).resize();
	}

	// Меню запиту номера телефону
	showPhoneRequest() {
		return Markup.keyboard([
			[Markup.button.contactRequest("Поділитися контактом")],
		]).resize();
	}

	async registerUser(tgId, state, ctx) {
		await this.create_user(ctx, tgId, state);
		await this.create_receipt(ctx, tgId, state);

		const user = await User.findOne({ where: { telegram_id: tgId } });

		user_states.delete(tgId);
		show_user_data(ctx, user, Receipt);

		// режим додавання нового чеку
		if (state.data?.mode === "add_receipt") {
			return ctx.reply("Новий чек додано 🔥", this.showMainMenu());
		}

		return ctx.reply(
			"Готово — очікуй результати розіграшу",
			this.showMainMenu(),
		);
	}
}

export const show_user_data = async (ctx, user, Receipt) => {
	const tgId = ctx.from.id.toString();
	const receipts = await Receipt.findAll({ where: { user_id: tgId } });

	const media = receipts.map((r) => ({
		type: "photo",
		media: r.url
	}));

	const caption = `✅ Реєстрація завершена!\n
Твій ПІБ: *${user?.name}*
Твій Номер телефону: *${user?.phone}*
Загальна кількість чеків: *${receipts.length}*`;

	const keyboard = Markup.inlineKeyboard([
		[Markup.button.callback("Додати нове фото чеку", "ADD_RECEIPT")],
	]);

	if (media.length === 1) {
		return ctx.replyWithPhoto(media[0].media, {
			caption,
			parse_mode: "Markdown",
			...keyboard,
		});
	}

	if (media.length > 1 && media) {
		await ctx.replyWithMediaGroup(media);
	}

	return ctx.reply(caption, {
		parse_mode: "Markdown",
		reply_markup: keyboard.reply_markup,
	});
};
