
export interface Flashcard {
  question: string;
  answer: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface MindMapData {
  mindMap: string;
}

export interface ArtData {
  imageUrl: string;
}

export interface Podcast {
  audioUrl: string;
}

export interface QuizQuestion {
    question: string;
    options: string[];
    answer: string;
    difficulty: number;
}

export interface ChatMessage {
    role: 'user' | 'model';
    content: string;
}

// Gamification Types
export interface Achievement {
    id: string; // e.g., "flashcard-master"
    name: string;
    description: string;
    icon: string; // URL to icon
    dateUnlocked: string; // ISO date string
}

export interface UserStats {
    uid: string;
    displayName: string;
    email: string;
    photoURL?: string;
    points: number;
    streak: number;
    achievements: Achievement[];
    lastActivityDate?: any; // Can be Firestore Timestamp
    stats: {
        summariesGenerated: number;
        flashcardsCompleted: number;
        mindmapsCreated: number;
        podcastsListened: number;
        gamesCompleted: number;
    }
}
