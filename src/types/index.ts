

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
    username?: string;
    usernameLower?: string;
    email: string;
    photoURL?: string;
    points: number;
    streak: number;
    currentPlan?: 'Free' | 'Starter' | 'Pro';
    planRenewalDate?: string; // ISO date string
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

export interface GenerationHistory {
    id: string;
    title: string;
    featureType: 'Summary' | 'Flashcards' | 'MindMap' | 'Podcast' | 'Quiz' | 'Image' | 'Video' | 'StudySet';
    timestamp: any; // Firestore Timestamp
    content?: string;
    pointsEarned: number;
}

    