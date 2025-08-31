
import { Metadata } from 'next';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Shield } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy | NotesGPT',
};

const policies = [
  {
    id: 'introduction',
    title: '1. Introduction',
    content: 'Welcome to NotesGPT! Your privacy is important to us. This policy explains how we collect, use, and protect your data when you use our app.',
  },
  {
    id: 'collection',
    title: '2. Information We Collect',
    content: `
      <ul class="list-disc pl-6 space-y-2">
        <li><strong>Personal Information:</strong> Name, email, and payment information for subscriptions.</li>
        <li><strong>App Usage Data:</strong> Notes you paste, style preferences, learning interactions, podcasts, and games.</li>
        <li><strong>Payment Information:</strong> Processed securely via Razorpay. We do not store card details.</li>
        <li><strong>Technical Data:</strong> Device type, IP address, and analytics for app improvement.</li>
      </ul>
    `,
  },
  {
    id: 'usage',
    title: '3. How We Use Your Information',
    content: `
      <ul class="list-disc pl-6 space-y-2">
        <li>Provide and improve AI features: summaries, flashcards, podcasts, mindmaps.</li>
        <li>Personalize your learning experience.</li>
        <li>Process payments and subscriptions.</li>
        <li>Communicate updates, offers, and support.</li>
      </ul>
    `,
  },
  {
    id: 'sharing',
    title: '4. Data Sharing',
    content: 'We do not sell your data. We may share information with Razorpay for payment processing and analytics providers for app performance.',
  },
  {
    id: 'security',
    title: '5. Data Security',
    content: 'We use industry-standard encryption and Firebase security features to protect your data.',
  },
  {
    id: 'rights',
    title: '6. Your Rights',
    content: `
      <ul class="list-disc pl-6 space-y-2">
        <li>Access, correct, or delete your data anytime.</li>
        <li>Cancel subscriptions anytime.</li>
      </ul>
    `,
  },
  {
    id: 'contact',
    title: '7. Contact Us',
    content: 'For privacy concerns, please contact us at <a href="mailto:support@notesgpt.study" class="text-foreground hover:underline">support@notesgpt.study</a>.',
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto max-w-3xl py-12 px-4">
      <div className="text-center mb-10">
        <Shield className="mx-auto h-12 w-12 text-primary mb-4" />
        <h1 className="text-4xl font-bold font-serif">Privacy Policy</h1>
        <p className="text-muted-foreground mt-2">Your data privacy is our priority.</p>
      </div>
      
      <Card className="shadow-lg">
        <CardContent className="p-8">
          <Accordion type="single" collapsible className="w-full">
            {policies.map(policy => (
              <AccordionItem value={policy.id} key={policy.id}>
                <AccordionTrigger className="text-lg font-semibold">{policy.title}</AccordionTrigger>
                <AccordionContent className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground">
                  <div dangerouslySetInnerHTML={{ __html: policy.content }} />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
