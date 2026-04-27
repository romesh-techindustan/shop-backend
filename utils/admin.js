function getAdminEmails() {
  return new Set(
    (process.env.ADMIN_EMAILS || '')
      .split(',')
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean)
  );
}

export function isAdminUser(user) {
  const email = user?.email?.trim().toLowerCase();

  return Boolean(user?.isAdmin) || (email ? getAdminEmails().has(email) : false);
}
