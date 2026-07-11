import { createError } from 'h3';

export async function deliverMail(
  send: () => Promise<void>,
  statusMessage: string,
) {
  try {
    await send();
  } catch {
    throw createError({ statusCode: 502, statusMessage });
  }
}
