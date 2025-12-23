import { Markup } from "telegraf";

export const main_keyboard = Markup.keyboard([["Добавити новий чек"]]).resize();

export const request_phone = Markup.keyboard([
	[Markup.button.contactRequest("Поділитися контактом")],
]).resize();

export const show_user_data = async (ctx, user, Receipt) => {
	const tgId = ctx.from.id.toString();
	const receipts = await Receipt.findAll({ where: { user_id: tgId } });

	const media = receipts.map((r) => ({
		type: "photo",
		media: r.photo,
	}));

	const caption = `✅ Реєстрація завершена!\n
Твій ПІБ: *${user.name}*
Твій Номер телефону: *${user.phone}*
Твій код: *${user.unique_code}*`;

	const keyboard = Markup.inlineKeyboard([
		[Markup.button.callback("Додати нове фото чеку", "add_new_receipt")],
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
		reply_markup: keyboard.reply_markup,
	});
};

export const show_conditions = (ctx) => {
	return ctx.reply(
		`🎉 *Умови розіграшу Mood Duck 🐣*\n
1️⃣ Придбай продукцію MOOD DUCK у офлайн, або онлайн магазинах партнерів\n
2️⃣ Пройди реєстрацію в боті:
Нажимай Старт і бот сам підкаже що робити 😎\n
3️⃣ Підтверди покупку, надіславши фото чеку, або іншим способом (уточнюй у продавця магазину)\n
4️⃣ Чекай результати (*8 переможців*)
    
❗️Важливо:
Кожен куплений набір - це +1 реєстрація, якщо в одному чеку для прикладу 3 набори MOOD DUCK - можеш надсилати його 3 рази та збільшувати свої шанси на виграш!

⛔️ У випадку виявлення накруток ми залишаємо за собою право дискваліфікації, при виборі переможців буде перевірятись чи відповідає кількість покупок кількості реєстрацій`,
		{ parse_mode: "Markdown" }
	);
};
