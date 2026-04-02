import { desktopCapturer, nativeImage, app, screen } from "electron";
import path from "path";
import fs from "fs";
import { apiRequest } from "../api-client";

let s3Enabled: boolean | null = null;

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

  const thumbnail = sources[0].thumbnail;
  return Buffer.from(thumbnail.toPNG());
}

async function checkS3Enabled(): Promise<boolean> {
  if (s3Enabled !== null) return s3Enabled;
  try {
    const { data } = await apiRequest("/organizations/me");
    s3Enabled = data?.settings?.s3?.enabled === true;
    console.log("[screenshot] S3 storage:", s3Enabled ? "enabled" : "disabled (local only)");
  } catch {
    s3Enabled = false;
  }
  return s3Enabled;
}

// Reset cache when config might change
export function resetS3Cache() {
  s3Enabled = null;
}

export async function captureScreenshot(blurEnabled: boolean = false): Promise<{
  s3Key: string;
  buffer: Buffer;
}> {
  const rawBuffer = await captureScreen();

  const image = nativeImage.createFromBuffer(rawBuffer);
  const resized = image.resize({ width: Math.round(image.getSize().width / 2) });
  const jpegBuffer = Buffer.from(resized.toJPEG(75));

  // Always save locally first
  const screenshotDir = path.join(app.getPath("userData"), "screenshots");
  if (!fs.existsSync(screenshotDir)) fs.mkdirSync(screenshotDir, { recursive: true });
  const filename = `screenshot-${Date.now()}.jpg`;
  const localPath = path.join(screenshotDir, filename);
  fs.writeFileSync(localPath, jpegBuffer);

  let s3Key = `local://${localPath}`;

  // Upload to S3 if enabled in org settings
  const useS3 = await checkS3Enabled();
  if (useS3) {
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
      console.log("[screenshot] Uploaded to S3:", s3Key);
    } catch (err) {
      console.log("[screenshot] S3 upload failed, kept locally:", localPath);
    }
  }

  return { s3Key, buffer: jpegBuffer };
}
