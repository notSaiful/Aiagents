

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

export interface Slides {
    downloadUrl: string;
    embedUrl: string;
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

export interface Achievement {
    id: string; 
    name: string;
    description: string;
    icon: string; 
    dateUnlocked: string; 
}

export interface UserStats {
    uid: string;
    displayName: string;
    username: string;
    usernameLower: string;
    email: string;
    photoURL?: string;
    points: number;
    streak: number;
    currentPlan: 'Free' | 'Starter' | 'Pro';
    planRenewalDate?: string;
    achievements: Achievement[];
    lastActivityDate?: any;
    createdAt: any;
    updatedAt: any;
    stats: {
        summariesGenerated: number;
        flashcardsCompleted: number;
        mindmapsCreated: number;
        podcastsListened: number;
        gamesCompleted: number;
    }
}

export interface UserProfileData extends Omit<UserStats, 'lastActivityDate' | 'createdAt' | 'updatedAt' | 'usernameLower'> {}


export interface GenerationHistory {
    id: string;
    title: string;
    featureType: 'Summary' | 'Flashcards' | 'MindMap' | 'Podcast' | 'Quiz' | 'Image' | 'Video' | 'StudySet';
    timestamp: any; // Firestore Timestamp
    content?: string;
    pointsEarned: number;
}

    
