import { DateTime } from "luxon";
import { User } from "../models/user.js";
import { Mailing } from "../models/mailing.js";

let isRunning = false;

export function startMailingScheduler(bot) {
  setInterval(() => checkMailings(), 5000);

  async function checkMailings() {
    if (isRunning) return;
    isRunning = true;

    try {
      const now = DateTime.now();

      const mails = await Mailing.findAll({
        where: { sent: false }
      });

      for (const mail of mails) {
        const sendAt = DateTime.fromSQL(mail.send_at);

        if (sendAt > now) continue;

        const users = await User.findAll();

        for (const user of users) {
          try {
            await bot.telegram.sendMessage(user.telegram_id, mail.message, {
              parse_mode: "HTML",
              disable_web_page_preview: true
            });

            console.log(
              `MAIL ${mail.id} SENT -> USER ${user.telegram_id} at ${DateTime.now().toISO()}`
            );
          } catch (err) {
            if (err.response?.error_code === 403) {
              console.log(`User ${user.telegram_id} blocked bot`);
            }
          }
        }

        await mail.update({ sent: true });
      }
    } catch (err) {
      console.error("SCHEDULER ERROR:", err);
    } finally {
      isRunning = false;
    }
  }
}
