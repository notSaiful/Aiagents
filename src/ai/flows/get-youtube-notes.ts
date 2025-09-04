'use server';

/**
 * @fileOverview A Genkit flow for fetching a YouTube transcript and summarizing it.
 * This file is server-only and should not be imported into client components.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import fetch from 'node-fetch';

const GetYoutubeNotesInputSchema = z.object({
  url: z.string(),
  language: z.string().optional(),
});
export type GetYoutubeNotesInput = z.infer<typeof GetYoutubeNotesInputSchema>;

const GetYoutubeNotesOutputSchema = z.object({
  videoId: z.string().optional(),
  transcript: z.string().optional(),
  notes: z.string().optional(),
  error: z.string().optional(),
  message: z.string().optional(),
});
export type GetYoutubeNotesOutput = z.infer<typeof GetYoutubeNotesOutputSchema>;

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

/**
 * Extracts a YouTube video ID from various URL formats.
 */
function extractYouTubeId(input: string): string | null {
    if (!input) return null;
    try {
        const url = new URL(input.trim());
        const host = url.hostname.replace('www.', '');

        if (host.includes('youtube.com')) {
            if (url.pathname.startsWith('/shorts/')) {
                return url.pathname.split('/')[2] || null;
            }
            if (url.pathname.startsWith('/embed/')) {
                return url.pathname.split('/')[2] || null;
            }
            return url.searchParams.get('v');
        }
        if (host === 'youtu.be') {
            return url.pathname.split('/')[1] || null;
        }
        return null;
    } catch (e) {
        // Handle cases where input is not a valid URL
        const match = input.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
        return match ? match[1] : null;
    }
}


/**
 * Fetches timed text (captions) from YouTube's public endpoint.
 */
async function fetchTimedText(videoId: string, lang: string, auto = false): Promise<string | null> {
  const base = 'https://video.google.com/timedtext';
  const u = new URL(base);
  u.searchParams.set('v', videoId);
  u.searchParams.set('lang', lang);
  if (auto) u.searchParams.set('kind', 'asr');

  try {
    const res = await fetch(u.toString(), {
      method: 'GET',
      headers: { 'Accept': 'application/xml,text/xml' },
      cache: 'no-store',
    });

    if (!res.ok) return null;

    const xml = await res.text();
    if (!xml || xml.trim().length === 0) return null;

    const matches = [...xml.matchAll(/<text[^>]*>([\s\S]*?)<\/text>/g)];
    if (matches.length === 0) return null;
    
    const decode = (s: string) =>
        s.replace(/&amp;/g, '&')
         .replace(/&lt;/g, '<')
         .replace(/&gt;/g, '>')
         .replace(/&#39;/g, "'")
         .replace(/&quot;/g, '"');

    const lines = matches.map(m => decode(m[1]).replace(/\s+/g, ' ').trim()).filter(Boolean);
    if (lines.length === 0) return null;

    return lines.join(' ');
  } catch (error) {
    console.error(`Failed to fetch timed text for ${videoId} (${lang}, auto=${auto}):`, error);
    return null;
  }
}

/**
 * Tries to get a transcript for a video, checking manual and auto-captions
 * across a list of preferred languages.
 */
async function getTranscript(videoId: string, preferredLang?: string): Promise<string | null> {
  const langs = Array.from(new Set([preferredLang, 'en', 'en-US', 'en-GB'].filter(Boolean))) as string[];

  // 1. Try manual captions first
  for (const lang of langs) {
    const t = await fetchTimedText(videoId, lang, false);
    if (t) return t;
  }
  // 2. Fallback to auto-captions
  for (const lang of langs) {
    const t = await fetchTimedText(videoId, lang, true);
    if (t) return t;
  }
  return null;
}

export const getYoutubeNotesV2 = ai.defineFlow(
  {
    name: 'getYoutubeNotesV2',
    inputSchema: GetYoutubeNotesInputSchema,
    outputSchema: GetYoutubeNotesOutputSchema,
  },
  async ({ url, language }) => {
    const videoId = extractYouTubeId(url);
    if (!videoId) {
      return { error: 'INVALID_URL', message: 'Please provide a valid YouTube link.' };
    }

    const transcript = await getTranscript(videoId, language);
    if (!transcript) {
      return {
        videoId,
        error: 'NO_CAPTIONS',
        message: 'Sorry, captions are not available for this video.',
      };
    }

    // Truncate transcript to stay within a reasonable token limit
    const maxLen = 15000;
    const trimmedTranscript = transcript.length > maxLen ? transcript.slice(0, maxLen) : transcript;

    const prompt = `
        You are an expert at creating study notes. Based on the following video transcript,
        generate clear, structured notes. The notes should have:
        - A main title
        - Concise headings for different topics
        - Bullet points summarizing key information
        - A "Key Takeaways" section at the end
        - Any important definitions or formulas should be highlighted.
        
        Transcript:
        ---
        ${trimmedTranscript}
        ---
    `;

    try {
        const { text } = await ai.generate({ 
            prompt,
            model: `googleai/${GEMINI_MODEL}`,
        });
        
        return {
            videoId,
            transcript: trimmedTranscript,
            notes: text,
        };

    } catch(error) {
        console.error("AI summarization failed:", error);
        return {
            videoId,
            transcript: trimmedTranscript,
            error: 'AI_ERROR',
            message: 'Failed to generate notes from the transcript.'
        }
    }
  }
);
