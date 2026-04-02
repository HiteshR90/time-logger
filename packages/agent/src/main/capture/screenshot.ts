import { desktopCapturer, nativeImage, app, screen } from "electron";
import path from "path";
import fs from "fs";
import { apiRequest } from "../api-client";

async function captureScreen(): Promise<Buffer> {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.size;

  const sources = await desktopCapturer.getSources({
    types: ["screen"],
    thumbnailSize: { width, height },
  });

  if (sources.length === 0) {
    throw new Error("No screen source found");
  }

  // Use the primary screen's thumbnail
  const thumbnail = sources[0].thumbnail;
  return Buffer.from(thumbnail.toPNG());
}

export async function captureScreenshot(blurEnabled: boolean = false): Promise<{
  s3Key: string;
  buffer: Buffer;
}> {
  const rawBuffer = await captureScreen();

  // Convert to JPEG using Electron's nativeImage
  const image = nativeImage.createFromBuffer(rawBuffer);
  const resized = image.resize({ width: Math.round(image.getSize().width / 2) });
  const jpegBuffer = Buffer.from(resized.toJPEG(75));

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
    console.log("[screenshot] S3 upload skipped, saved locally:", localPath);
  }

  return { s3Key, buffer: jpegBuffer };
}
