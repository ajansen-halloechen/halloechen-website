import nodemailer from 'nodemailer';
import { getSiteEnv, getSmtpConfig } from '#server/utils/env';

export async function sendMail(
  to: string,
  subject: string,
  text: string,
  html?: string,
): Promise<void> {
  const smtp = getSmtpConfig();

  if (getSiteEnv() !== 'production') {
    console.log(`[mail] To: ${to}`);
    console.log(`[mail] Subject: ${subject}`);
    console.log(`[mail] Body:\n${text}`);
    return;
  }

  const transporter = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.port === 465,
    auth: {
      user: smtp.user,
      pass: smtp.password,
    },
  });

  try {
    await transporter.sendMail({
      from: smtp.from,
      to,
      subject,
      text,
      html,
    });
  } catch (error) {
    console.error(`[mail] Failed to send email to ${to}:`, error);
    throw error;
  }
}
