export function resolveAvatarUrl(
  avatar: string | null | undefined,
): string | null {
  if (!avatar) {
    return null;
  }

  if (avatar.startsWith('http') || avatar.startsWith('/')) {
    return avatar;
  }

  return `/api/files/${avatar}`;
}
