import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";

const OUTBOX_LOG = path.join(process.cwd(), "data", "outbox.log");

// Helper to log mail locally when SMTP is not configured
function logMailLocally(options: any) {
  try {
    const dir = path.dirname(OUTBOX_LOG);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const logEntry = `[${new Date().toISOString()}] MAIL OUTBOX LOG\n` +
      `FROM: ${options.from}\n` +
      `TO: ${options.to}\n` +
      `SUBJECT: ${options.subject}\n` +
      `BODY: ${options.text || options.html}\n` +
      `-----------------------------------------------------\n`;
    fs.appendFileSync(OUTBOX_LOG, logEntry, "utf8");
    console.log(`[Email Dispatch Logged] Locally written to data/outbox.log for: ${options.to}`);
  } catch (err) {
    console.error("Failed to write to mail outbox log:", err);
  }
}

export async function sendEmail(to: string, subject: string, contentHtml: string) {
  try {
    const host = process.env.SMTP_HOST || "";
    const port = parseInt(process.env.SMTP_PORT || "587");
    const user = process.env.SMTP_USER || "";
    const pass = process.env.SMTP_PASS || "";

    const options = {
      from: `"${process.env.SMTP_FROM_NAME || "SK Studio Pune"}" <${process.env.SMTP_FROM_EMAIL || "skstudiopune@gmail.com"}>`,
      to,
      subject,
      html: contentHtml
    };

    if (host && user && pass) {
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass }
      });

      const info = await transporter.sendMail(options);
      console.log(`[SMTP Dispatch Success] Message ID: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } else {
      // SMTP settings missing: Log mail locally
      logMailLocally(options);
      return { success: true, messageId: "local-log-" + Date.now() };
    }
  } catch (err: any) {
    console.error("Nodemailer transport failed, logging fallback...", err);
    logMailLocally({
      from: "skstudiopune@gmail.com",
      to,
      subject,
      html: contentHtml
    });
    return { success: false, error: err.message };
  }
}
