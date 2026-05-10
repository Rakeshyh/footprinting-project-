/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface WhoisData {
  registrar?: string;
  createdDate?: string;
  expiryDate?: string;
  registrantCountry?: string;
  nameServers?: string[];
  raw?: any;
}

export interface DnsRecord {
  name: string;
  type: number;
  data: string;
}

export interface DnsData {
  aRecords: DnsRecord[];
  mxRecords: DnsRecord[];
  txtRecords: DnsRecord[];
  nsRecords: DnsRecord[];
}

export interface TechStackData {
  technologies?: string[];
  raw?: any;
}

export interface BreachData {
  Name: string;
  Title: string;
  Domain: string;
  BreachDate: string;
  AddedDate: string;
  ModifiedDate: string;
  PwnCount: number;
  Description: string;
  DataClasses: string[];
  IsVerified: boolean;
  IsFabricated: boolean;
  IsSensitive: boolean;
  IsRetired: boolean;
  IsSpamList: boolean;
  LogoPath: string;
}

export interface IpStats {
  query: string;
  status: string;
  country: string;
  city: string;
  lat: number;
  lon: number;
  isp: string;
  org: string;
  as: string;
}

export interface SocialPresence {
  platform: string;
  url: string;
  exists: 'found' | 'not_found' | 'error' | 'idle';
}

export interface IntelGridData {
  whois: WhoisData | null;
  dns: DnsData | null;
  techStack: TechStackData | null;
  breaches: BreachData[] | null;
  ipStats: IpStats | null;
  socials: SocialPresence[] | null;
  headers?: Record<string, string> | null;
}

export interface AiAnalysis {
  riskScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  attackVectors: string[];
  recommendations: string[];
  summary: string;
}
