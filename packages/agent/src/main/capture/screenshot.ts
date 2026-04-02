import screenshot from "screenshot-desktop";
import sharp from "sharp";
import path from "path";
import fs from "fs";
import { app } from "electron";
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

  // Save locally
  const screenshotDir = path.join(app.getPath("userData"), "screenshots");
  if (!fs.existsSync(screenshotDir)) fs.mkdirSync(screenshotDir, { recursive: true });
  const filename = `screenshot-${Date.now()}.jpg`;
  const localPath = path.join(screenshotDir, filename);
  fs.writeFileSync(localPath, jpegBuffer);

  // Try S3 upload, fall back to local-only
  let s3Key = `local://${localPath}`;
  try {
    const { data } = await apiRequest("/screenshots/presigned-url", {
      method: "POST",
      body: JSON.stringify({ filename, contentType: "image/jpeg" }),
    });

    await fetch(data.uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": "image/jpeg" },
      body: jpegBuffer,
    });

    s3Key = data.s3Key;
  } catch (err) {
    console.log("S3 upload skipped (no storage configured), saved locally:", localPath);
  }

  return { s3Key, buffer: jpegBuffer };
}
