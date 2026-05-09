import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const uploadDir = path.join(process.cwd(), "public", "uploads");
const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function saveLocalUpload(file: File) {
  if (!allowedTypes.has(file.type)) {
    throw new Error("Only JPEG, PNG, and WEBP room photos are supported.");
  }

  const extension = file.type.split("/")[1] ?? "png";
  const fileName = `${randomUUID()}.${extension}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, fileName), bytes);

  return {
    fileName,
    url: `/uploads/${fileName}`,
    size: file.size,
    contentType: file.type,
  };
}

