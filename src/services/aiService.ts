/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Type } from "@google/genai";
import { IntelGridData, AiAnalysis } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export const aiService = {
  async analyzeIntel(data: IntelGridData, target: string): Promise<AiAnalysis> {
    const prompt = `
      You are a senior cybersecurity analyst. Analyze this OSINT reconnaissance data for the target: ${target}.
      
      OSINT DATA:
      ${JSON.stringify(data, null, 2)}
      
      Provide:
      1. Overall Risk Score (0–100) with reasoning.
      2. Top 3 critical attack vectors an adversary could exploit.
      3. Immediate remediation recommendations.
      4. Executive summary in 3 sentences.
      
      Be specific, technical, and actionable.
    `;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              riskScore: { type: Type.NUMBER },
              riskLevel: { type: Type.STRING, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
              attackVectors: { type: Type.ARRAY, items: { type: Type.STRING } },
              recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
              summary: { type: Type.STRING }
            },
            required: ['riskScore', 'riskLevel', 'attackVectors', 'recommendations', 'summary']
          }
        }
      });

      if (!response.text) {
        throw new Error('AI analysis returned no text');
      }

      return JSON.parse(response.text) as AiAnalysis;
    } catch (error) {
      console.error('AI Analysis Error:', error);
      // Fallback analysis if AI fails
      return {
        riskScore: 50,
        riskLevel: 'MEDIUM',
        attackVectors: ['General information exposure', 'DNS configuration audit needed', 'Social footprints discovered'],
        recommendations: ['Enable multi-factor authentication', 'Review public DNS records', 'Secure social media privacy settings'],
        summary: 'AI Analysis engine was unable to provide a detailed report. However, initial OSINT data suggests moderate exposure.'
      };
    }
  }
};
