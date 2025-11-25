import { DataTypes } from "sequelize";
import { sequelize } from "../db.js";

export const Receipt = sequelize.define("Receipts", {
	user_id: { type: DataTypes.STRING },
	photo: DataTypes.STRING
});
