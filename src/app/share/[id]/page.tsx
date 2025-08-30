
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import OutputDisplay from '@/components/output-display';
import { notFound } from 'next/navigation';
import type { Flashcard } from '@/types';

interface SharedData {
  shortSummary: string;
  longSummary: string;
  flashcards: Flashcard[];
  mindMap: string;
}

async function getSharedData(id: string): Promise<SharedData | null> {
  try {
    const db = getFirestore(app);
    const docRef = doc(db, 'shared_generations', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      // Ensure flashcards have a difficulty, providing a default if missing from older shares
      const flashcards = (data.flashcards || []).map((fc: any) => ({
          question: fc.question,
          answer: fc.answer,
          difficulty: fc.difficulty || 'Medium',
      }));

      return {
          shortSummary: data.shortSummary,
          longSummary: data.longSummary,
          flashcards: flashcards,
          mindMap: data.mindMap,
      }
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching shared data:", error);
    return null;
  }
}

export default async function SharePage({ params }: { params: { id: string } }) {
  const data = await getSharedData(params.id);

  if (!data) {
    notFound();
  }

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
       <div className="flex flex-col items-center text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-chart-1 via-chart-3 to-chart-5 pt-8 font-serif">
          NotesGPT
        </h1>
        <p className="mt-3 text-lg text-muted-foreground max-w-xl">
          A shared snapshot from NotesGPT
        </p>
      </div>
      <OutputDisplay
        shortSummary={data.shortSummary}
        longSummary={data.longSummary}
        flashcards={data.flashcards}
        mindMap={data.mindMap}
        isShareable={false}
        notes=""
        style="Minimalist"
      />
    </div>
  );
}
