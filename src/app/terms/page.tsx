
import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { FileText } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms and Conditions | NotesGPT',
};

const terms = [
    {
        id: 'acceptance',
        title: '1. Acceptance of Terms',
        content: 'By accessing or using the NotesGPT application, you agree to be bound by these Terms and Conditions and our Privacy Policy. If you do not agree, you may not use the app.'
    },
    {
        id: 'usage',
        title: '2. App Usage & License',
        content: 'NotesGPT grants you a limited, non-exclusive, non-transferable, revocable license to use the app for personal, non-commercial educational purposes. You agree not to misuse the service or help anyone else to do so.'
    },
    {
        id: 'subscriptions',
        title: '3. Subscriptions & Payments',
        content: 'Payments are processed via our third-party partner, Razorpay. Subscription plans are billed on a recurring basis (monthly or annually) and will automatically renew unless canceled by you prior to the renewal date. All pricing is listed within the app.'
    },
    {
        id: 'ip',
        title: '4. Intellectual Property',
        content: 'While you own the raw notes you input, the AI-generated content (summaries, flashcards, etc.) is provided to you for your personal use. The NotesGPT name, logo, and the app\'s design and code are the exclusive property of NotesGPT.'
    },
    {
        id: 'obligations',
        title: '5. User Obligations',
        content: 'You are responsible for maintaining the confidentiality of your account information. You agree not to upload or distribute any content that is illegal, harmful, or infringes on the rights of others.'
    },
    {
        id: 'liability',
        title: '6. Limitation of Liability',
        content: 'NotesGPT and its AI-generated content are provided "as is" without warranties of any kind. We are not responsible for the accuracy of the generated content or for any academic or professional outcomes resulting from its use. Use the app at your own risk.'
    },
    {
        id: 'changes',
        title: '7. Changes to Terms',
        content: 'We reserve the right to modify these terms at any time. We will notify users of any significant changes. Continued use of the app after such changes constitutes your acceptance of the new terms.'
    }
];

export default function TermsAndConditionsPage() {
  return (
    <div className="container mx-auto max-w-3xl py-12 px-4">
       <div className="text-center mb-10">
        <FileText className="mx-auto h-12 w-12 text-primary mb-4" />
        <h1 className="text-4xl font-bold font-serif">Terms and Conditions</h1>
        <p className="text-muted-foreground mt-2">The legal framework that governs your use of our app.</p>
      </div>

      <Card className="shadow-lg">
        <CardContent className="p-8">
           <Accordion type="single" collapsible className="w-full">
             {terms.map(term => (
              <AccordionItem value={term.id} key={term.id}>
                <AccordionTrigger className="text-lg font-semibold text-left">{term.title}</AccordionTrigger>
                <AccordionContent className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground">
                  <p>{term.content}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
