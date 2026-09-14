import fs from 'fs';
import path from 'path';
import type { Page } from './types';

const DATA_DIR = path.join(process.cwd(), '..', 'data', 'pages');

function readJsonFile(filePath: string): Page | null {
  try {
    if (!fs.existsSync(filePath)) return null;
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw) as Page;
  } catch {
    return null;
  }
}

export function getPageBySlug(slugParts: string[]): Page | null {
  if (slugParts.length === 0) return null;

  const slug = slugParts.join('/');
  const directPath = path.join(DATA_DIR, `${slug}.json`);
  const page = readJsonFile(directPath);
  if (page) return page;

  const indexPath = path.join(DATA_DIR, slug, 'index.json');
  return readJsonFile(indexPath);
}

export function getHomePage(): Page | null {
  return readJsonFile(path.join(DATA_DIR, 'home.json'));
}

export function getAllSlugs(): string[] {
  if (!fs.existsSync(DATA_DIR)) return [];

  const slugs: string[] = [];

  function walk(dir: string, prefix = '') {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        walk(path.join(dir, entry.name), relative);
      } else if (entry.name.endsWith('.json') && entry.name !== 'home.json') {
        const slug = entry.name === 'index.json'
          ? prefix
          : relative.replace(/\.json$/, '');
        if (slug) slugs.push(slug);
      }
    }
  }

  walk(DATA_DIR);
  return slugs;
}

export function getFeaturedProducts(): Page['products'] {
  const home = getHomePage();
  return home?.products ?? [];
}

export function getFeaturedCategories(): Page['categories'] {
  const home = getHomePage();
  return home?.categories ?? [];
}
