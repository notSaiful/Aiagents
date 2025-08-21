export interface Flashcard {
  question: string;
  answer: string;
}

export interface MindMapNodeData {
  name: string;
  children?: MindMapNodeData[];
}

export interface DiagramData {
    diagram: string;
}
