import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import fetch from "node-fetch";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // OSINT Proxy Routes
  app.get("/api/osint/whois", async (req, res) => {
    const { domain } = req.query;
    if (!domain) return res.status(400).json({ error: "Domain required" });
    
    const sources = [
      `https://rdap.org/domain/${domain}`,
      `https://www.rdap.net/domain/${domain}`,
      `https://rdap.terreg.com/domain/${domain}`
    ];

    for (const source of sources) {
      try {
        const resp = await fetch(source, { timeout: 5000 } as any);
        if (resp.ok) {
          const data = await resp.json();
          return res.json(data);
        }
      } catch (e) {
        console.warn(`WHOIS Source ${source} failed:`, e);
      }
    }
    
    res.status(500).json({ error: "All WHOIS sources failed" });
  });

  app.get("/api/osint/dns", async (req, res) => {
    const { domain, type } = req.query;
    if (!domain || !type) return res.status(400).json({ error: "Domain and type required" });
    try {
      const resp = await fetch(`https://dns.google/resolve?name=${domain}&type=${type}`, { timeout: 5000 } as any);
      res.json(await resp.json());
    } catch (error) {
      res.status(500).json({ error: "DNS lookup failed" });
    }
  });

  app.get("/api/osint/tech", async (req, res) => {
    const { domain } = req.query;
    if (!domain) return res.status(400).json({ error: "Domain required" });
    
    const fetchWithTimeout = async (url: string) => {
      return await fetch(url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      } as any);
    };

    try {
      let resp;
      try {
        const url = domain.toString().startsWith('http') ? domain.toString() : `https://${domain}`;
        resp = await fetchWithTimeout(url);
      } catch (e) {
        const url = domain.toString().startsWith('http') ? domain.toString() : `http://${domain}`;
        resp = await fetchWithTimeout(url);
      }

      if (!resp.ok && resp.status !== 404) {
        return res.json([]);
      }

      const headers: Record<string, string> = {};
      resp.headers.forEach((value, key) => headers[key.toLowerCase()] = value);
      
      const text = await resp.text();
      const tech = new Set<string>();

      // Server-side / Infrastructure
      if (headers['server']?.toLowerCase().includes('nginx')) tech.add('Nginx');
      if (headers['server']?.toLowerCase().includes('apache')) tech.add('Apache');
      if (headers['server']?.toLowerCase().includes('cloudflare')) tech.add('Cloudflare');
      if (headers['server']?.toLowerCase().includes('liteSpeed')) tech.add('LiteSpeed');
      if (headers['x-powered-by']?.toLowerCase().includes('php')) tech.add('PHP');
      if (headers['x-powered-by']?.toLowerCase().includes('express')) tech.add('Express');
      if (headers['x-nextjs-cache']) tech.add('Next.js');
      
      // CMS & Frameworks (DOM signatures)
      if (text.includes('_next/static') || text.includes('__NEXT_DATA__')) tech.add('Next.js');
      if (text.includes('wp-content') || text.includes('wp-includes')) tech.add('WordPress');
      if (text.includes('drupal') || text.includes('Drupal')) tech.add('Drupal');
      if (text.includes('joomla') || text.includes('Joomla')) tech.add('Joomla');
      if (text.includes('ghost.org')) tech.add('Ghost');
      
      // Frontend Libraries
      if (text.includes('react') || text.includes('React.createElement')) tech.add('React');
      if (text.includes('svelte') || text.includes('svelte-')) tech.add('Svelte');
      if (text.includes('vue') || text.includes('Vue.js')) tech.add('Vue.js');
      if (text.includes('angular') || text.includes('ng-version')) tech.add('Angular');
      if (text.includes('jquery') || text.includes('jQuery')) tech.add('jQuery');
      
      // Analytics & Tools
      if (text.includes('googletagmanager.com') || text.includes('gtag')) tech.add('Google Analytics');
      if (text.includes('facebook.net/en_US/fbevents.js')) tech.add('FB Pixel');
      
      res.json(Array.from(tech));
    } catch (error) {
      res.json([]);
    }
  });

  app.get("/api/osint/breaches", async (req, res) => {
    const { target, apiKey } = req.query;
    if (!target) return res.status(400).json({ error: "Target required" });
    
    try {
      if (typeof target === 'string' && target.includes('@')) {
        if (!apiKey) return res.json([]);
        const resp = await fetch(`https://haveibeenpwned.com/api/v3/breachedaccount/${target}`, {
          headers: {
            'hibp-api-key': apiKey as string,
            'User-Agent': 'OSINT-Dashboard-App'
          }
        });
        if (resp.status === 404) return res.json([]);
        res.json(await resp.json());
      } else {
        const headers: any = { 'User-Agent': 'OSINT-Dashboard-App' };
        if (apiKey) {
          headers['hibp-api-key'] = apiKey as string;
        }
        
        const resp = await fetch(`https://haveibeenpwned.com/api/v3/breaches?domain=${target}`, { headers });
        if (!resp.ok) return res.json([]);
        res.json(await resp.json());
      }
    } catch (error) {
      res.json([]);
    }
  });

  app.get("/api/osint/headers", async (req, res) => {
    const { domain } = req.query;
    if (!domain) return res.status(400).json({ error: "Domain required" });
    
    try {
      const url = domain.toString().startsWith('http') ? domain.toString() : `https://${domain}`;
      const resp = await fetch(url, { method: 'HEAD', timeout: 5000 } as any);
      const headers: Record<string, string> = {};
      resp.headers.forEach((value, key) => {
        headers[key] = value;
      });
      res.json(headers);
    } catch (error) {
      try {
        const url = `http://${domain}`;
        const resp = await fetch(url, { method: 'HEAD', timeout: 5000 } as any);
        const headers: Record<string, string> = {};
        resp.headers.forEach((value, key) => {
          headers[key] = value;
        });
        res.json(headers);
      } catch (e) {
        res.status(500).json({ error: "Failed to fetch headers" });
      }
    }
  });

  app.get("/api/osint/ipstats", async (req, res) => {
    const { domain } = req.query;
    if (!domain) return res.status(400).json({ error: "Domain required" });
    
    try {
      // 1. Resolve domain to IP first
      let ip: string | null = null;
      try {
        const dnsResp = await fetch(`https://dns.google/resolve?name=${domain}&type=A`, { timeout: 3000 } as any);
        if (dnsResp.ok) {
          const dnsData = await dnsResp.json();
          ip = dnsData.Answer?.[0]?.data || null;
        }
      } catch (e) {
        console.warn(`Primary DNS resolution failed for ${domain}`);
      }
      
      // 2. If IP resolution failed, some providers (like ip-api.com) can take the domain directly
      const target = ip || domain;

      // 3. Try primary IP info provider
      try {
        const resp = await fetch(`https://ipapi.co/${target}/json/`, { timeout: 5000 } as any);
        if (resp.ok) {
          const data = await resp.json();
          if (!data.error) return res.json(data);
        }
      } catch (e) {
        console.warn(`Primary IP API failed for ${target}`);
      }
      
      // 4. Try fallback provider
      try {
        const fallback = await fetch(`http://ip-api.com/json/${target}`, { timeout: 5000 } as any);
        if (fallback.ok) {
          const fallbackData = await fallback.json();
          if (fallbackData.status !== 'fail') return res.json(fallbackData);
        }
      } catch (e) {
        console.warn(`Fallback IP API failed for ${target}`);
      }

      res.status(404).json({ error: "Failed to retrieve IP intelligence" });
    } catch (error) {
      console.error('IP stats endpoint error:', error);
      res.status(500).json({ error: "Internal server error during IP intelligence gathering" });
    }
  });

  app.get("/api/osint/socials", async (req, res) => {
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: "URL required" });
    try {
      const resp = await fetch(url as string, { method: 'GET', headers: { 'User-Agent': 'Mozilla/5.0' } });
      res.json({ status: resp.status });
    } catch (error) {
      res.json({ status: 404 });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
