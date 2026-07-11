import { buildAuthLink } from '#server/utils/auth-link';
import { getSiteEnv } from '#server/utils/env';
import { sendMail } from './mail.service';

export async function sendPasswordResetEmail(
  email: string,
  token: string,
): Promise<void> {
  const resetUrl = buildAuthLink('/reset-password', token);

  const subject = 'Passwort zurücksetzen – Hallöchen-Webseite';
  const text = [
    'Hallöchen,',
    '',
    'Du hast eine Anfrage zum Zurücksetzen deines Passworts gestellt.',
    'Setze dein Passwort über den folgenden Link zurück:',
    '',
    resetUrl,
    '',
    'Der Link ist 15 Minuten gültig.',
    '',
    'Falls du diese Anfrage nicht gestellt hast, kannst du diese E-Mail ignorieren.',
    '',
    'Viele Grüße,',
    'das Internetz',
  ].join('\n');

  const html = [
    '<p>Hallöchen,</p>',
    '<p>Du hast eine Anfrage zum Zurücksetzen deines Passworts gestellt.</p>',
    '<p>Setze dein Passwort über den folgenden Link zurück:</p>',
    `<p><a href="${resetUrl}">${resetUrl}</a></p>`,
    '<p>Der Link ist 15 Minuten gültig.</p>',
    '<p>Falls du diese Anfrage nicht gestellt hast, kannst du diese E-Mail ignorieren.</p>',
    '<p>Viele Grüße,<br>das Internetz</p>',
  ].join('\n');

  if (getSiteEnv() !== 'production') {
    console.log(`[mail] Password reset URL: ${resetUrl}`);
  }

  await sendMail(email, subject, text, html);
}
