import fs from "fs";
import path from "path";

export async function save_photo(ctx) {
	const fileId = ctx.message.photo.pop().file_id;
	const link = await ctx.telegram.getFileLink(fileId);

	const fileName = `tg_${ctx.from.id}_${Date.now()}.jpg`;

	const uploadsDir = "uploads";

	if (!fs.existsSync(uploadsDir)) {
		fs.mkdirSync(uploadsDir, { recursive: true });
		console.log("📁 Created uploads folder");
	}

	const filePath = path.resolve(uploadsDir, fileName);

	const res = await fetch(link.href);
	const buffer = Buffer.from(await res.arrayBuffer());

	fs.writeFileSync(filePath, buffer);

	return fileName;
}
