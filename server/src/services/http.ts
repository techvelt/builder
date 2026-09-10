import type { HttpResult } from '../types.js';

const HTTP_TIMEOUT_MS = 12000;
const MAX_REDIRECTS = 5;
const MAX_HTML_BYTES = 500_000;

export async function probeWebsite(domain: string): Promise<HttpResult> {
  const result: HttpResult = {
    httpResponds: false,
    httpsResponds: false,
    httpStatus: null,
    finalUrl: null,
    pageTitle: null,
    description: null,
    html: null,
    redirectDomain: null,
    error: null,
  };

  // Try HTTPS first, then HTTP
  for (const scheme of ['https', 'http']) {
    const url = `${scheme}://${domain}`;
    try {
      const probe = await fetchWithRedirects(url);
      if (probe) {
        if (scheme === 'https') result.httpsResponds = true;
        else result.httpResponds = true;

        result.httpStatus = probe.status;
        result.finalUrl = probe.finalUrl;
        result.pageTitle = probe.title;
        result.description = probe.description;
        result.html = probe.html;

        const finalHost = new URL(probe.finalUrl).hostname.replace(/^www\./, '');
        const originalHost = domain.replace(/^www\./, '');
        if (finalHost !== originalHost && !finalHost.endsWith(`.${originalHost}`)) {
          result.redirectDomain = finalHost;
        }

        // If HTTPS worked, we're done
        if (scheme === 'https') break;
      }
    } catch (err) {
      if (!result.error) {
        result.error = err instanceof Error ? err.message : 'Connection failed';
      }
    }
  }

  return result;
}

interface FetchProbe {
  status: number;
  finalUrl: string;
  title: string | null;
  description: string | null;
  html: string;
}

async function fetchWithRedirects(startUrl: string): Promise<FetchProbe | null> {
  let currentUrl = startUrl;
  let redirectCount = 0;

  while (redirectCount <= MAX_REDIRECTS) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), HTTP_TIMEOUT_MS);

    try {
      const response = await fetch(currentUrl, {
        signal: controller.signal,
        redirect: 'manual',
        headers: {
          'User-Agent':
            'Mozilla/5.0 (compatible; ComBuyerProspector/1.0; +https://github.com/com-buyer-prospector)',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      });

      clearTimeout(timeout);

      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get('location');
        if (!location) return null;
        currentUrl = new URL(location, currentUrl).href;
        redirectCount++;
        continue;
      }

      if (response.status >= 200 && response.status < 400) {
        const contentType = response.headers.get('content-type') || '';
        let html = '';

        if (contentType.includes('text/html') || contentType.includes('application/xhtml')) {
          const buffer = await response.arrayBuffer();
          const slice = buffer.byteLength > MAX_HTML_BYTES
            ? buffer.slice(0, MAX_HTML_BYTES)
            : buffer;
          html = new TextDecoder('utf-8', { fatal: false }).decode(slice);
        }

        const { title, description } = parseMeta(html);
        return {
          status: response.status,
          finalUrl: currentUrl,
          title,
          description,
          html,
        };
      }

      // Non-success but server responded
      return {
        status: response.status,
        finalUrl: currentUrl,
        title: null,
        description: null,
        html: '',
      };
    } catch {
      clearTimeout(timeout);
      return null;
    }
  }

  return null;
}

function parseMeta(html: string): { title: string | null; description: string | null } {
  let title: string | null = null;
  let description: string | null = null;

  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  if (titleMatch) {
    title = decodeEntities(titleMatch[1].trim()).slice(0, 300);
  }

  const descMatch =
    html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i) ||
    html.match(/<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i) ||
    html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']*)["']/i);

  if (descMatch) {
    description = decodeEntities(descMatch[1].trim()).slice(0, 500);
  }

  return { title, description };
}

function decodeEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}
