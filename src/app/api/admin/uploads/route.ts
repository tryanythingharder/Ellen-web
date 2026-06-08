import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const uploadDirectory = path.join(process.cwd(), "public", "uploads");
const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
  "video/quicktime",
]);
const maximumFileSize = 60 * 1024 * 1024;

function sanitizeFilename(name: string) {
  const extension = path.extname(name).toLowerCase();
  const basename = path
    .basename(name, extension)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  return `${basename || "asset"}-${Date.now()}${extension}`;
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "缺少上传文件。" }, { status: 400 });
  }

  if (!allowedMimeTypes.has(file.type)) {
    return NextResponse.json({ error: "不支持的文件类型。" }, { status: 415 });
  }

  if (file.size > maximumFileSize) {
    return NextResponse.json({ error: "文件大小不能超过 60MB。" }, { status: 413 });
  }

  const filename = sanitizeFilename(file.name);
  const bytes = Buffer.from(await file.arrayBuffer());

  await mkdir(uploadDirectory, { recursive: true });
  await writeFile(path.join(uploadDirectory, filename), bytes);

  return NextResponse.json({
    filename,
    url: `/uploads/${filename}`,
  });
}
