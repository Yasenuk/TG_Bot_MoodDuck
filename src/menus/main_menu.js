import { Markup } from "telegraf";
import { NETWORKS, NETWORKS_PER_PAGE } from "./networks.js";
import { user_states } from "../states/user_states.js";
import { User } from "../models/user.js";
import { Receipt } from "../models/receipt.js";

export class Menu {
	constructor() { }
	
	async create_receipt(ctx, tgId, state) {
		const user = await User.findOne({ where: { telegram_id: tgId } });

		if (!user) return;

		const receipt = await Receipt.create({
			user_id: user.telegram_id,
			url: state.data.fileUrl,
			shop: state.data.network,
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

	// Меню вибору мережі з пагінацією

	getNetworkKeyboard(page = 0) {
		const start = page * NETWORKS_PER_PAGE;
		const end = start + NETWORKS_PER_PAGE;
		const slice = NETWORKS.slice(start, end);

		const rows = [];

		for (let i = 0; i < slice.length; i += 2) {
			const row = [];

			row.push(Markup.button.callback(slice[i], `network_select:${start + i}`));

			if (slice[i + 1]) {
				row.push(
					Markup.button.callback(
						slice[i + 1],
						`network_select:${start + i + 1}`,
					),
				);
			}

			rows.push(row);
		}

		const navigation = [];

		if (page > 0) {
			navigation.push(Markup.button.callback("⬅️", `network_page:${page - 1}`));
		}

		if (end < NETWORKS.length) {
			navigation.push(Markup.button.callback("➡️", `network_page:${page + 1}`));
		}

		if (navigation.length) {
			rows.push(navigation);
		}

		return Markup.inlineKeyboard(rows);
	}

	getNetworkConfirmKeyboard(index) {
		return Markup.inlineKeyboard([
			[
				Markup.button.callback("✅ Підтвердити", `network_confirm:${index}`),
				Markup.button.callback("🔄 Змінити", "network_back"),
			],
		]);
	}

	async showNetworkMenu(ctx, page = 0) {
		return ctx.reply(
			"🏪 Обери магазин в якому робив покупку:",
			this.getNetworkKeyboard(page),
		);
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

	registerNetworkActions(bot) {
		// Листання сторінок
		bot.action(/^network_page:(\d+)$/, async (ctx) => {
			const page = Number(ctx.match[1]);

			await ctx.editMessageReplyMarkup(
				this.getNetworkKeyboard(page).reply_markup,
			);
			await ctx.answerCbQuery();
		});

		// Вибір мережі
		bot.action(/^network_select:(\d+)$/, async (ctx) => {
			const index = Number(ctx.match[1]);
			const network = NETWORKS[index];

			if (!network) {
				return ctx.answerCbQuery("Щось пішло не так...", { show_alert: true });
			}

			await ctx.editMessageText(
				`Ти обрав магазин: *${network}*\n\nПідтвердити вибір?`,
				{
					parse_mode: "Markdown",
					...this.getNetworkConfirmKeyboard(index),
				},
			);

			await ctx.answerCbQuery();
		});

		bot.action(/^network_confirm:(\d+)$/, async (ctx) => {
			const index = Number(ctx.match[1]);
			const network = NETWORKS[index];

			if (!network) {
				return ctx.answerCbQuery("Помилка підтвердження", { show_alert: true });
			}

			const tgId = ctx.from.id.toString();
			const state = user_states.get(tgId);

			state.data.network = network;

			await ctx.editMessageText(`✅ Обрано магазин: *${network}*`, {
				parse_mode: "Markdown",
			});

			
			await ctx.answerCbQuery("Вибір підтверджено");
			await this.registerUser(tgId, state, ctx);
		});

		bot.action("network_back", async (ctx) => {
			await ctx.editMessageText(
				"🏪 Обери магазин в якому робив покупку:",
				this.getNetworkKeyboard(0),
			);

			await ctx.answerCbQuery();
		});
	}
}

export const show_user_data = async (ctx, user, Receipt) => {
	const tgId = ctx.from.id.toString();
	const receipts = await Receipt.findAll({ where: { user_id: tgId } });

	const media = receipts.map((r) => ({
		type: "photo",
		media: r.url,
		network: r.shop
	}));

	const networks = media.filter(item => item.network !== "Не обрана")
  .map(item => item.network).join(" | ");

	const caption = `✅ Реєстрація завершена!\n
Твій ПІБ: *${user.name}*
Твій Номер телефону: *${user.phone}*
Мережі магазинів: *${networks}*
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

	if (media.length > 1) {
		await ctx.replyWithMediaGroup(media);
	}

	return ctx.reply(caption, {
		parse_mode: "Markdown",
		reply_markup: keyboard.reply_markup
	});
};
