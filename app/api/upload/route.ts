import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const type = (formData.get("type") as string) ?? "image";

  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "blck-lottery",
        resource_type: type === "video" ? "video" : "image",
        ...(type === "video" ? { chunk_size: 6_000_000 } : {}),
      },
      (err, res) => {
        if (err || !res) return reject(err ?? new Error("Upload failed"));
        resolve(res as { secure_url: string });
      }
    );
    uploadStream.end(buffer);
  });

  return NextResponse.json({ url: result.secure_url });
}
