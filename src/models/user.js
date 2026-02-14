import { DataTypes } from "sequelize";
import { sequelize } from "../db.js";

export const User = sequelize.define("Users", {
	telegram_id: { type: DataTypes.STRING, unique: true },
	name: DataTypes.STRING,
	phone: { type: DataTypes.STRING, unique: true },
	date: DataTypes.DATE,
});
