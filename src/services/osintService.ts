/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { WhoisData, DnsData, TechStackData, BreachData, IpStats, SocialPresence, IntelGridData } from '../types';

export const osintService = {
  async fetchWhois(domain: string): Promise<WhoisData> {
    try {
      const response = await fetch(`/api/osint/whois?domain=${domain}`);
      if (!response.ok) return {};
      const data = await response.json();
      
      const events = data.events || [];
      const created = events.find((e: any) => e.eventAction === 'registration')?.eventDate;
      const expiry = events.find((e: any) => e.eventAction === 'expiration')?.eventDate;
      
      return {
        registrar: data.entities?.[0]?.vcard?.[1]?.find((i: any) => i[0] === 'fn')?.[3],
        createdDate: created,
        expiryDate: expiry,
        registrantCountry: data.country,
        nameServers: data.nameservers?.map((ns: any) => ns.ldhName),
        raw: data
      };
    } catch (error) {
      console.error('WHOIS Error:', error);
      return {};
    }
  },

  async fetchDns(domain: string): Promise<DnsData> {
    const fetchRecord = async (type: string) => {
      try {
        const resp = await fetch(`/api/osint/dns?domain=${domain}&type=${type}`);
        if (!resp.ok) return [];
        const data = await resp.json();
        return data.Answer || [];
      } catch (err) {
        return [];
      }
    };

    try {
      const [a, mx, txt, ns] = await Promise.all([
        fetchRecord('A'),
        fetchRecord('MX'),
        fetchRecord('TXT'),
        fetchRecord('NS')
      ]);

      return {
        aRecords: a,
        mxRecords: mx,
        txtRecords: txt,
        nsRecords: ns
      };
    } catch (error) {
      return { aRecords: [], mxRecords: [], txtRecords: [], nsRecords: [] };
    }
  },

  async fetchTechStack(domain: string): Promise<TechStackData> {
    try {
      const response = await fetch(`/api/osint/tech?domain=${domain}`);
      if (!response.ok) return { technologies: [] };
      const technologies = await response.json();
      return { technologies };
    } catch (error) {
      return { technologies: [] };
    }
  },

  async fetchBreaches(target: string, apiKey?: string): Promise<BreachData[]> {
    try {
      const url = `/api/osint/breaches?target=${encodeURIComponent(target)}${apiKey ? `&apiKey=${apiKey}` : ''}`;
      const response = await fetch(url);
      if (!response.ok) return [];
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      return [];
    }
  },

  async fetchIpStats(domain: string): Promise<IpStats | undefined> {
    try {
      const response = await fetch(`/api/osint/ipstats?domain=${domain}`);
      if (!response.ok) {
        // If the server returns 404 or 500, we handle it quietly
        return undefined;
      };
      
      const data = await response.json();
      if (!data || data.error || data.status === 'fail') return undefined;
      
      return {
        query: data.ip || data.query,
        status: 'success',
        country: data.country_name || data.country,
        city: data.city,
        lat: data.latitude || data.lat,
        lon: data.longitude || data.lon,
        isp: data.org || data.isp,
        org: data.org,
        as: data.asn || data.as
      };
    } catch (error) {
      // Gracefully handle fetch failures
      return undefined;
    }
  },

  async checkSocials(username: string): Promise<SocialPresence[]> {
    const cleanUsername = username.includes('.') ? username.split('.')[0] : username;
    
    const platforms = [
      { name: 'GitHub', url: `https://github.com/${cleanUsername}` },
      { name: 'Twitter', url: `https://twitter.com/${cleanUsername}` },
      { name: 'Instagram', url: `https://instagram.com/${cleanUsername}` },
      { name: 'LinkedIn', url: `https://linkedin.com/in/${cleanUsername}` },
      { name: 'Reddit', url: `https://reddit.com/user/${cleanUsername}` }
    ];

    const results = await Promise.all(platforms.map(async (p) => {
      try {
        const resp = await fetch(`/api/osint/socials?url=${encodeURIComponent(p.url)}`);
        const data = await resp.json();
        return {
          platform: p.name,
          url: p.url,
          exists: data.status === 200 ? 'found' : data.status === 404 ? 'not_found' : 'error'
        } as SocialPresence;
      } catch {
        return { platform: p.name, url: p.url, exists: 'not_found' } as SocialPresence;
      }
    }));

    return results;
  },

  async fetchHeaders(domain: string): Promise<Record<string, string> | null> {
    try {
      const response = await fetch(`/api/osint/headers?domain=${domain}`);
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      return null;
    }
  }
};


export const getMockData = (target: string): IntelGridData => {
  return {
    whois: {
      registrar: 'MarkMonitor Inc.',
      createdDate: '1997-09-15T04:00:00Z',
      expiryDate: '2028-09-14T04:00:00Z',
      registrantCountry: 'US',
      nameServers: ['ns1.google.com', 'ns2.google.com']
    },
    dns: {
      aRecords: [{ name: target, type: 1, data: '142.250.190.46' }],
      mxRecords: [{ name: target, type: 15, data: 'smtp.google.com' }],
      txtRecords: [{ name: target, type: 16, data: 'v=spf1 include:_spf.google.com ~all' }],
      nsRecords: [{ name: target, type: 2, data: 'ns1.google.com' }]
    },
    techStack: {
      technologies: ['React', 'Nginx', 'Cloudflare', 'Next.js']
    },
    breaches: [
      {
        Name: 'Adobe',
        Title: 'Adobe',
        Domain: 'adobe.com',
        BreachDate: '2013-10-04',
        AddedDate: '2013-12-04',
        ModifiedDate: '2013-12-04',
        PwnCount: 152445165,
        Description: '[DEMO MODE] Adobe suffered a massive data breach...',
        DataClasses: ['Email', 'Password', 'Username'],
        IsVerified: true,
        IsFabricated: false,
        IsSensitive: false,
        IsRetired: false,
        IsSpamList: false,
        LogoPath: ''
      }
    ],
    ipStats: {
      query: '142.250.190.46',
      status: 'success',
      country: 'United States',
      city: 'Mountain View',
      lat: 37.422,
      lon: -122.084,
      isp: 'Google LLC',
      org: 'Google LLC',
      as: 'AS15169'
    },
    socials: [
      { platform: 'GitHub', url: 'https://github.com/google', exists: 'found' },
      { platform: 'Twitter', url: 'https://twitter.com/google', exists: 'found' },
      { platform: 'Instagram', url: 'https://instagram.com/google', exists: 'found' },
      { platform: 'LinkedIn', url: 'https://linkedin.com/in/google', exists: 'found' },
      { platform: 'Reddit', url: 'https://reddit.com/user/google', exists: 'error' }
    ],
    headers: {
      'content-type': 'text/html; charset=UTF-8',
      'server': 'gws',
      'x-xss-protection': '0',
      'x-frame-options': 'SAMEORIGIN',
      'strict-transport-security': 'max-age=31536000'
    }
  };
};
