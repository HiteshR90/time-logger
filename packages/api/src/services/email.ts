import nodemailer from "nodemailer";
import { config } from "../config";

// In development, use a test/ethereal SMTP or log to console
const transporter = process.env.SMTP_HOST
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  : null;

const FROM_EMAIL = process.env.SMTP_FROM || "noreply@timetracker.app";
const APP_URL = process.env.APP_URL || "http://localhost:3000";

export async function sendInviteEmail(
  to: string,
  name: string,
  inviteToken: string,
  orgName: string,
) {
  const inviteUrl = `${APP_URL}/invite/${inviteToken}`;

  if (!transporter) {
    // Dev mode: log to console
    console.log("\n========== INVITE EMAIL ==========");
    console.log(`To: ${to}`);
    console.log(`Name: ${name}`);
    console.log(`Org: ${orgName}`);
    console.log(`Accept invite: ${inviteUrl}`);
    console.log("==================================\n");
    return;
  }

  await transporter.sendMail({
    from: `"TimeTracker" <${FROM_EMAIL}>`,
    to,
    subject: `You've been invited to join ${orgName} on TimeTracker`,
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
        <h2>Hi ${name},</h2>
        <p>You've been invited to join <strong>${orgName}</strong> on TimeTracker.</p>
        <p>Click the button below to set up your account:</p>
        <a href="${inviteUrl}" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">Accept Invitation</a>
        <p style="color: #666; margin-top: 20px; font-size: 13px;">This link expires in 7 days. If you didn't expect this, you can ignore it.</p>
      </div>
    `,
  });
}
