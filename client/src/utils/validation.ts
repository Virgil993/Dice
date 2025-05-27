export function isValidEmail(email: string): boolean {
  return /\S+@\S+\.\S+/.test(email);
}

export function calculateAge(date: string | Date): number {
  const newDate = new Date(date);
  const nowDate = new Date();
  const ageDifMs = nowDate.getTime() - newDate.getTime();
  const ageDate = new Date(ageDifMs);
  return Math.abs(ageDate.getUTCFullYear() - 1970) - 1;
}
