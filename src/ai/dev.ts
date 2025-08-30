
import { config } from 'dotenv';
config();

import '@/ai/flows/transform-notes.ts';
import '@/ai/flows/extract-text-from-image.ts';
import '@/ai/flows/share-generation.ts';
import '@/ai/flows/generate-podcast.ts';
import '@/ai/flows/generate-quiz.ts';
import '@/ai/flows/chat-with-character.ts';
import '@/ai/flows/extract-text-from-video.ts';
import '@/ai/flows/update-user-stats.ts';
import '@/ai/flows/get-leaderboard.ts';
import '@/ai/flows/get-user-profile.ts';
