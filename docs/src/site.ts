// Site-wide settings (formerly Jekyll's _config.yml).
export const SITE = {
  name: 'Alessandro Sanvito',
  description: 'Software Engineer at Optiver',
  url: 'https://alexdruso.github.io',
  avatar: '/images/me.jpg',
  goatcounter: 'https://alexdruso.goatcounter.com/count',
  footerLinks: {
    email: 'alessandro.sanvito@gmail.com',
    github: 'Alexdruso',
    linkedin: 'alessandro-sanvito',
    rss: true,
  },
} as const;

/** Absolute URL on the live site for a root-relative path. */
export function absoluteUrl(path: string): string {
  return new URL(path, SITE.url).href;
}
