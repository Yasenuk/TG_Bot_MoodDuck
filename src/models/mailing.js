import { DataTypes } from "sequelize";
import { sequelize } from "../db.js";

export const Mailing = sequelize.define("Mailing", {
	id: {
		type: DataTypes.INTEGER,
		autoIncrement: true,
		primaryKey: true,
	},
	message: {
		type: DataTypes.TEXT,
		allowNull: false,
	},
	send_at: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	sent: {
		type: DataTypes.BOOLEAN,
		defaultValue: false,
	},
});
