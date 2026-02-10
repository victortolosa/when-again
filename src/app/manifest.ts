import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'DateKeeper',
    short_name: 'DateKeeper',
    description: 'Track habits, count down to events, and journal your days with beautiful visuals.',
    start_url: '/milestones',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#000000',
    orientation: 'portrait',
    icons: [
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    shortcuts: [
      {
        name: 'Milestones',
        url: '/milestones',
        description: 'View your milestones',
      },
      {
        name: 'Countdowns',
        url: '/countdowns',
        description: 'View your countdowns',
      },
      {
        name: 'Remember',
        url: '/reminders',
        description: 'View your memories and reminders',
      },
    ],
    categories: ['productivity', 'lifestyle'],
  };
}
