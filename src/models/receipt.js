import { DataTypes } from "sequelize";
import { sequelize } from "../db.js";

export const Receipt = sequelize.define("Receipts", {
	user_id: { type: DataTypes.STRING },
	url: { type: DataTypes.STRING, unique: true },
	shop: { type: DataTypes.STRING, defaultValue: "Не обрана" },
});
