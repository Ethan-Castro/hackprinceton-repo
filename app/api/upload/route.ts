import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

// Cloudinary requires Node.js runtime because it uses server-side secrets.
export const runtime = "nodejs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function fileToBuffer(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Example server-side validation (5MB limit)
    const maxSizeBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return NextResponse.json({ error: "File too large" }, { status: 400 });
    }

    const buffer = await fileToBuffer(file);

    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "uploads", resource_type: "image" },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        },
      );

      uploadStream.end(buffer);
    });

    // @ts-expect-error cloudinary typing does not include secure_url in this context
    const { secure_url: url, public_id: publicId } = uploadResult;

    return NextResponse.json({ url, publicId });
  } catch (error) {
    console.error("[cloudinary-upload] error", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
