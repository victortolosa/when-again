/**
 * Generate unique, harmonious gradient colors for events
 */

export interface GradientConfig {
  colors: [string, string, string, string];
}

/**
 * Generate a random number seeded by a string (for reproducibility)
 */
function seededRandom(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash) / 2147483647;
}

/**
 * Convert HSL to hex
 */
function hslToHex(h: number, s: number, l: number): string {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

/**
 * Generate a unique gradient based on a seed (timestamp + title)
 * This ensures the same event always gets the same gradient
 */
export function generateUniqueGradient(seed: string): GradientConfig {
  const random = seededRandom(seed);

  // Generate a base hue (0-360)
  const baseHue = Math.floor(random * 360);

  // Generate complementary and analogous hues
  const hue1 = baseHue;
  const hue2 = (baseHue + 30 + Math.floor(random * 60)) % 360; // Analogous
  const hue3 = (baseHue + 180) % 360; // Complementary
  const hue4 = (baseHue + 210 + Math.floor(random * 60)) % 360; // Split complementary

  // Generate colors with varying darkness for depth
  const color1 = hslToHex(hue1, 70 + Math.floor(random * 20), 15 + Math.floor(random * 10));
  const color2 = hslToHex(hue2, 60 + Math.floor(random * 25), 20 + Math.floor(random * 10));
  const color3 = hslToHex(hue3, 65 + Math.floor(random * 20), 10 + Math.floor(random * 10));
  const color4 = hslToHex(hue4, 55 + Math.floor(random * 25), 5 + Math.floor(random * 10));

  return {
    colors: [color1, color2, color3, color4]
  };
}

/**
 * Generate a completely random gradient (for when no seed is provided)
 */
export function generateRandomGradient(): GradientConfig {
  const seed = Date.now().toString() + Math.random().toString();
  return generateUniqueGradient(seed);
}

/**
 * Generate gradient from a base color (legacy support)
 */
export function generateGradientFromColor(baseColor: string): GradientConfig {
  return generateUniqueGradient(baseColor + Date.now().toString());
}
