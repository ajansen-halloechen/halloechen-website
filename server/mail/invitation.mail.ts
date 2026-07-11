import { buildAuthLink } from '#server/utils/auth-link';
import { getSiteEnv } from '#server/utils/env';
import { sendMail } from './mail.service';

export async function sendInvitationEmail(
  email: string,
  token: string,
): Promise<void> {
  const setupUrl = buildAuthLink('/setup', token);

  const subject = 'Einladung zur Hallöchen-Webseite';
  const text = [
    'Hallöchen,',
    '',
    'Du wurdest als Genoss*in zur Hallöchen-Webseite eingeladen.',
    'Richte dein Konto über den folgenden Link ein:',
    '',
    setupUrl,
    '',
    'Der Link ist 7 Tage gültig.',
    '',
    'Viele Grüße,',
    'das Internetz',
  ].join('\n');

  const html = [
    '<p>Hallöchen,</p>',
    '<p>Du wurdest als Genoss*in zur Hallöchen-Webseite eingeladen.</p>',
    '<p>Richte dein Konto über den folgenden Link ein:</p>',
    `<p><a href="${setupUrl}">${setupUrl}</a></p>`,
    '<p>Der Link ist 7 Tage gültig.</p>',
    '<p>Viele Grüße,<br>das Internetz</p>',
  ].join('\n');

  if (getSiteEnv() !== 'production') {
    console.log(`[mail] Invitation setup URL: ${setupUrl}`);
  }

  await sendMail(email, subject, text, html);
}
