
export interface Flashcard {
  question: string;
  answer: string;
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
