function normalizeReturnTo(returnTo?: string): string {
  if (!returnTo || returnTo.trim().length === 0) {
    return '/';
  }

  if (!returnTo.startsWith('/') || returnTo.startsWith('//')) {
    return '/';
  }

  return returnTo;
}

export function buildGoogleLoginHref(returnTo?: string): string {
  const normalized = normalizeReturnTo(returnTo);

  if (normalized === '/') {
    return '/api/oauth2/google';
  }

  const params = new URLSearchParams({ returnTo: normalized });
  return `/api/oauth2/google?${params.toString()}`;
}
