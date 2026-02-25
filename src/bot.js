import { Markup, Telegraf } from "telegraf";
import { sequelize } from "./db.js";

import "dotenv/config";
import { change_state, user_states } from "./states/user_states.js";
import { User } from "./models/user.js";
import { Menu, show_user_data } from "./menus/main_menu.js";
import { save_photo } from "./services/file.js";
import { startMailingScheduler } from "./services/mailing_scheduler.js";
import { Mailing } from "./models/mailing.js";
import { DateTime } from "luxon";

class MoodDuckBot {
	constructor(token = process.env.BOT_TOKEN) {
		this.bot = new Telegraf(token);
		this.menu = new Menu();
	}

	async init() {
		this.menu.registerNetworkActions(this.bot);
		this.registerHandlers();
		startMailingScheduler(this.bot);

		try {
			await sequelize.sync();

			this.bot.catch((err, ctx) => {
				console.error("Telegraf error:", err);
			});

			process.on("unhandledRejection", (err) => {
				console.error("UNHANDLED REJECTION:", err);
			});

			await this.bot.launch();
			console.log("MoodDuck Bot launched");
		} catch (err) {
			console.error("STARTUP ERROR:", err);
		}
	}

	// Handlers registration (один раз)
	registerHandlers() {
		this.start_handler();
		this.text_handler();
		this.contact_handler();
		this.photo_handler();
		this.admin_mailing_handler();
	}

	admin_mailing_handler() {
		this.bot.command("mail", async (ctx) => {
			const ADMIN_IDS = [process.env.ADMIN_ID];
			const tgId = ctx.from.id.toString();

			if (!ADMIN_IDS.includes(tgId)) {
				return ctx.reply("⛔ Недостатньо прав");
			}

			const text = ctx.message.text.replace("/mail", "").trim();

			// формат: "Текст" 2026-02-15 20:00
			const match = text.match(/"(.+)"\s+([\d-]+\s+[\d:]+)/);

			if (!match) {
				return ctx.reply(
					'Формат:\n/mail "Текст повідомлення" YYYY-MM-DD HH:mm',
				);
			}

			const [, message, datetimeStr] = match;

			ctx.reply(datetimeStr);

			// Luxon правильно парсить у Kyiv timezone
			const dt = DateTime.fromFormat(datetimeStr, "yyyy-MM-dd HH:mm");

			if (!dt.isValid) {
				return ctx.reply("❌ Невірна дата");
			}

			ctx.reply(dt.toSQL()); // Перевірка формату для БД

			// Зберігаємо в UTC для БД
			await Mailing.create({
				message,
				send_at: dt.toSQL(), // Sequelize DATE у UTC
			});
		});
	}

	async start_handler() {
		this.bot.start(async (ctx) => {
			const tgId = ctx.from.id.toString();
			const user = await User.findOne({ where: { telegram_id: tgId } });

			if (user) {
				return ctx.reply("Ти вже зареєстрований", this.menu.showMainMenu());
			}

			change_state(ctx, tgId, "enter_name", Markup.removeKeyboard());
		});
	}

	text_handler() {
		this.bot.on("text", async (ctx, next) => {
			const tgId = ctx.from.id.toString();
			const state = user_states.get(tgId);
			if (!state) return next();

			const text = ctx.message.text.trim();

			if (state.step === "name") {
				if (!/^[А-Яа-яЇїІіЄєҐґ\s'’ʼ]+$/.test(text)) {
					return change_state(ctx, tgId, "enter_name", Markup.removeKeyboard());
				}

				state.data.name = text;
				change_state(ctx, tgId, "enter_phone", this.menu.showPhoneRequest());
			}
		});
	}

	contact_handler() {
		this.bot.on("contact", async (ctx, next) => {
			const tgId = ctx.from.id.toString();
			const state = user_states.get(tgId);
			if (!state) return next();

			if (state.step === "phone") {
				state.data.phone = ctx.message.contact.phone_number;
				change_state(ctx, tgId, "enter_reciept", Markup.removeKeyboard());
			}
		});
	}

	photo_handler() {
		this.bot.on("photo", async (ctx, next) => {
			const tgId = ctx.from.id.toString();
			const state = user_states.get(tgId);
			if (!state) return next();

			if (state.step !== "photo") return;

			state.data.fileUrl = await save_photo(ctx);

			change_state(ctx, tgId, "select_shop", Markup.removeKeyboard());
			this.menu.showNetworkMenu(ctx);
		});

		this.bot.action("ADD_RECEIPT", (ctx) => this.add_receipt_handler(ctx));
		this.bot.hears("Добавити новий чек", (ctx) =>
			this.add_receipt_handler(ctx),
		);
	}

	async add_receipt_handler(ctx) {
		const tgId = ctx.from.id.toString();

		user_states.set(tgId, {
			step: "photo",
			data: {
				mode: "add_receipt",
			},
		});

		await ctx.reply("Надішли фото нового чеку");
	}
}

const bot = new MoodDuckBot();
bot.init();
