export const user_states = new Map();
export const all_states = {
	current: {},
	enter_name: {
		step: "name",
		prompt: "Введи свій ПІБ:",
	},
	enter_phone: {
		step: "phone",
		prompt: 'Тепер нажимай "Поділитися контактом"',
	},
	select_shop: {
		step: "shop",
		prompt: "Обери магазин із списку нижче:",
	},
	enter_reciept: {
		step: "photo",
		prompt: "Супер! Тепер надішли фото чеку",
	},
};

export async function change_state(ctx, tgId, newState, option) {
	const prev = user_states.get(tgId);

	const state = {
		step: all_states[newState].step,
		data: prev?.data ?? {},
	};

	user_states.set(tgId, state);

	const prompt = all_states[newState].prompt;
	return prompt ? ctx.reply(prompt, option) : null;
}
