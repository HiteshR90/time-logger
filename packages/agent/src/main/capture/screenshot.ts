import screenshot from "screenshot-desktop";
import sharp from "sharp";
import { apiRequest } from "../api-client";

export async function captureScreenshot(blurEnabled: boolean = false): Promise<{
  s3Key: string;
  buffer: Buffer;
}> {
  // Capture screen as PNG buffer
  const rawBuffer = await screenshot({ format: "png" });

  // Compress to JPEG (optionally blur)
  let pipeline = sharp(rawBuffer).jpeg({ quality: 75 });
  if (blurEnabled) {
    pipeline = pipeline.blur(20);
  }
  const jpegBuffer = await pipeline.toBuffer();

  // Get presigned upload URL
  const { data } = await apiRequest("/screenshots/presigned-url", {
    method: "POST",
    body: JSON.stringify({
      filename: `screenshot-${Date.now()}.jpg`,
      contentType: "image/jpeg",
    }),
  });

  // Upload to S3
  await fetch(data.uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": "image/jpeg" },
    body: jpegBuffer,
  });

  return { s3Key: data.s3Key, buffer: jpegBuffer };
}
