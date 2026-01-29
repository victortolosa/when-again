/**
 * Migration utility to generate gradients for existing items
 */

import { generateUniqueGradient } from './gradient-generator';
import { Event, Tracker, GradientConfig } from '@/lib/types';

/**
 * Generate a gradient for an existing item based on its ID and title
 * Uses the item's ID as seed to ensure consistency
 */
export function generateGradientForExistingItem(
  id: string,
  title: string
): GradientConfig {
  // Use item ID + title as color seed for consistent harmonious colors
  const colorSeed = id + title;

  // Generate a deterministic mesh seed from the item ID
  let meshSeed = 0;
  for (let i = 0; i < id.length; i++) {
    const char = id.charCodeAt(i);
    meshSeed = ((meshSeed << 5) - meshSeed) + char;
    meshSeed = meshSeed | 0;
  }
  meshSeed = Math.abs(meshSeed);

  return generateUniqueGradient(colorSeed, meshSeed);
}

/**
 * Check if an event needs a gradient and generate one
 */
export function ensureEventHasGradient(event: Event): Event {
  // Check if gradient exists and has both colors and seed
  if (event.gradient_config?.colors && event.gradient_config?.seed !== undefined) {
    return event;
  }

  // If gradient exists but no seed, add a deterministic seed
  if (event.gradient_config?.colors && event.gradient_config?.seed === undefined) {
    let meshSeed = 0;
    for (let i = 0; i < event.id.length; i++) {
      const char = event.id.charCodeAt(i);
      meshSeed = ((meshSeed << 5) - meshSeed) + char;
      meshSeed = meshSeed | 0;
    }
    meshSeed = Math.abs(meshSeed);
    return {
      ...event,
      gradient_config: {
        ...event.gradient_config,
        seed: meshSeed
      }
    };
  }

  return {
    ...event,
    gradient_config: generateGradientForExistingItem(event.id, event.title),
  };
}

/**
 * Check if a tracker needs a gradient and generate one
 */
export function ensureTrackerHasGradient(tracker: Tracker): Tracker {
  // Don't generate gradient if tracker has an image
  if (tracker.image_url) {
    return tracker;
  }

  // Check if gradient exists and has both colors and seed
  if (tracker.gradient_config?.colors && tracker.gradient_config?.seed !== undefined) {
    return tracker;
  }

  // If gradient exists but no seed, add a deterministic seed
  if (tracker.gradient_config?.colors && tracker.gradient_config?.seed === undefined) {
    let meshSeed = 0;
    for (let i = 0; i < tracker.id.length; i++) {
      const char = tracker.id.charCodeAt(i);
      meshSeed = ((meshSeed << 5) - meshSeed) + char;
      meshSeed = meshSeed | 0;
    }
    meshSeed = Math.abs(meshSeed);
    return {
      ...tracker,
      gradient_config: {
        ...tracker.gradient_config,
        seed: meshSeed
      }
    };
  }

  return {
    ...tracker,
    gradient_config: generateGradientForExistingItem(tracker.id, tracker.title),
  };
}
