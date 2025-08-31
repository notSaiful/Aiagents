
import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, Package, HelpCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Shipping and Delivery Policy | NotesGPT',
};

export default function ShippingDeliveryPage() {
  return (
    <div className="container mx-auto max-w-3xl py-12 px-4">
      <div className="text-center mb-10">
        <Zap className="mx-auto h-12 w-12 text-primary mb-4" />
        <h1 className="text-4xl font-bold font-serif">Digital Delivery Policy</h1>
        <p className="text-muted-foreground mt-2">Instant access to all your features.</p>
      </div>

      <Card className="shadow-lg">
        <CardContent className="p-8 space-y-8">

          <div>
            <h2 className="text-2xl font-semibold font-serif mb-4 flex items-center">
              <Package className="mr-3 h-6 w-6 text-primary" />
              Instant Digital Access
            </h2>
            <p className="text-muted-foreground">
              NotesGPT is a fully digital application, which means there are no physical products to ship. All your purchased features, subscription benefits, and add-ons are delivered instantly to your account upon successful payment confirmation.
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-1 text-muted-foreground">
              <li>Immediate access to AI summaries.</li>
              <li>Instant generation of flashcards and mind maps.</li>
              <li>Unlock premium game and podcast features right away.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-semibold font-serif mb-4 flex items-center">
              <HelpCircle className="mr-3 h-6 w-6 text-primary" />
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
                <div>
                    <h3 className="font-semibold">What do you mean by "no shipping"?</h3>
                    <p className="text-muted-foreground text-sm">Since our service is 100% digital, there's nothing to mail to your home. Everything you purchase is available inside the app immediately.</p>
                </div>
                 <div>
                    <h3 className="font-semibold">My payment went through but I can't access my features. What do I do?</h3>
                    <p className="text-muted-foreground text-sm">In the rare event of a delay, please first try logging out and logging back in. If the issue persists, contact our support team at <a href="mailto:support@notesgpt.study" className="text-primary hover:underline">support@notesgpt.study</a>, and we'll resolve it for you promptly.</p>
                </div>
            </div>
          </div>
          
        </CardContent>
      </Card>
    </div>
  );
}
