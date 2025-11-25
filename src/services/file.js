import axios from "axios";
import { uploadToR2 } from "./storage.js";

export const save_photo = async (ctx) => {
  const fileId = ctx.message.photo.pop().file_id;
  const file = await ctx.telegram.getFile(fileId);

  const url = `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${file.file_path}`;
  const response = await axios.get(url, { responseType: "arraybuffer" });

  const fileName = `tg_${ctx.from.id}_${Date.now()}.jpg`;

  const fileUrl = await uploadToR2(response.data, fileName);

  return fileUrl;
};
