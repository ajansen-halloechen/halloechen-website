import { getPublicSiteUrl } from '#server/utils/env';

export function buildAuthLink(path: string, token: string) {
  return `${getPublicSiteUrl()}${path}?token=${encodeURIComponent(token)}`;
}
