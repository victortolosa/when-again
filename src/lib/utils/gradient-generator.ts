/**
 * Generate unique, harmonious gradient colors for events
 */

import { GradientConfig } from '@/lib/types';

/**
 * Generate a random number seeded by a string (for reproducibility)
 */
function seededRandom(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash | 0;
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
 * Generate a unique gradient based on a seed
 * Creates harmonious colors using color theory (analogous and complementary)
 */
export function generateUniqueGradient(colorSeed: string, meshSeed?: number): GradientConfig {
  const random = seededRandom(colorSeed);

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
    colors: [color1, color2, color3, color4],
    seed: meshSeed ?? Math.floor(Math.random() * 1000000)
  };
}

/**
 * Generate a gradient with a new random seed (for regenerating)
 */
export function generateRandomGradient(): GradientConfig {
  // Generate random color seed and mesh seed
  const colorSeed = Date.now().toString() + Math.random().toString();
  const meshSeed = Math.floor(Math.random() * 1000000);
  return generateUniqueGradient(colorSeed, meshSeed);
}
