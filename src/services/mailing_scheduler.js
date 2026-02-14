import { DateTime } from "luxon";
import { User } from "../models/user.js";
import { Mailing } from "../models/mailing.js";

let isRunning = false;

export function startMailingScheduler(bot) {
	setInterval((bot) => {
		checkMailings(bot);
	}, 1000);

	async function checkMailings() {
		if (isRunning) return;
		isRunning = true;

		try {
			const now = DateTime.now().toSQL();

			const mails = await Mailing.findAll({
				where: {
					sent: false,
				},
			});

			for (const mail of mails) {
				if (mail.send_at > now) continue;
				const users = await User.findAll();

				for (const user of users) {
					try {
						await bot.telegram.sendMessage(user.telegram_id, mail.message);
					} catch (err) {
						console.error("SEND ERROR:", err.response?.description);
					}
				}

				mail.sent = true;
				await mail.save();
			}
		} catch (err) {
			console.error("SCHEDULER ERROR:", err);
		} finally {
			isRunning = false;
		}
	}
}
