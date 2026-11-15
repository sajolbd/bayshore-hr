/**
 * Bayshore HR — Avatar Generator
 * Generates fun, professional cartoon avatars using Dicebear Avataaars API
 * for newly onboarded staff and employees.
 */

export function getDefaultCartoonAvatar(seed: string): string {
  const cleanSeed = encodeURIComponent(seed.trim().toLowerCase() || "bayshore-member");
  // Dicebear 9.x Avataaars SVG generator with soft pastel background palette
  return `https://api.dicebear.com/9.x/avataaars/svg?seed=${cleanSeed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
}

export function getRandomCartoonAvatar(): string {
  const randomSeed = `bayshore-${Math.random().toString(36).substring(2, 9)}`;
  return getDefaultCartoonAvatar(randomSeed);
}

