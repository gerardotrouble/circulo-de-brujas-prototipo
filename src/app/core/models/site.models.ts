export const SITE_ICONS = [
  'astrologia',
  'tarot',
  'herbolaria',
  'alquimia',
  'simbolos',
  'mitologia',
  'ciclos',
  'herramientas'
] as const;

export type IconName = (typeof SITE_ICONS)[number];

export interface NavLink {
  label: string;
  route: string;
  fragment?: string;
}

export interface KnowledgePath {
  id: string;
  icon: IconName;
  title: string;
  description: string;
}

export interface SiteContent {
  name: string;
  founder: string;
  city: string;
  since: number;
  tagline: string;
  eyebrow: string;
  heroTitleLines: string[];
  heroIntro: string;
  stripText: string;
  aboutEyebrow: string;
  aboutTitle: string;
  aboutText: string;
  nav: NavLink[];
  paths: KnowledgePath[];
}
