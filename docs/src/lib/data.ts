// The YAML files in src/data/ are the source of truth for the nav menu,
// Projects and Publications pages (formerly Jekyll's _data/).
import { parse } from 'yaml';
import navigationYml from '../data/navigation.yml?raw';
import projectsYml from '../data/projects.yml?raw';
import publicationsYml from '../data/publications.yml?raw';

export interface NavItem {
  title: string;
  url: string;
  icon?: string;
}

export interface Project {
  title: string;
  repo: string;
  year: number;
  period?: string;
  role?: string;
  context?: string;
  description: string;
  tags?: string[];
  entries?: { name: string; url: string; summary: string }[];
}

export interface Publication {
  title: string;
  authors: string[];
  venue: string;
  venue_full?: string;
  tier?: string;
  year: number;
  first_author?: boolean;
  tldr?: string;
  project?: string;
  pdf?: string;
  arxiv?: string;
  doi?: string;
  code?: string;
  bibtex?: string;
}

export const navigation = parse(navigationYml) as NavItem[];
export const projects = parse(projectsYml) as Project[];
export const publications = parse(publicationsYml) as Publication[];
