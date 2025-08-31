
import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { RefreshCw, Clock, HelpCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Cancellation & Refund Policy | NotesGPT',
};

export default function CancellationRefundPage() {
  return (
    <div className="container mx-auto max-w-3xl py-12 px-4">
      <div className="text-center mb-10">
        <RefreshCw className="mx-auto h-12 w-12 text-primary mb-4" />
        <h1 className="text-4xl font-bold font-serif">Cancellation & Refund Policy</h1>
        <p className="text-muted-foreground mt-2">Clear and simple policies for your subscription.</p>
      </div>
      
      <Card className="shadow-lg">
        <CardContent className="p-8 space-y-8">

          <div>
            <h2 className="text-2xl font-semibold font-serif mb-4 flex items-center">
              <Clock className="mr-3 h-6 w-6 text-primary" />
              Subscription Cancellation
            </h2>
            <p className="text-muted-foreground">
              You are in full control of your subscription. You can cancel your plan at any time through your account settings in the app. Once you cancel, you will retain access to your plan's features until the end of the current billing period, and you will not be charged again.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold font-serif mb-4 flex items-center">
              <HelpCircle className="mr-3 h-6 w-6 text-primary" />
              Refund Eligibility
            </h2>
            <Alert>
              <AlertTitle className="font-semibold">7-Day Refund Window</AlertTitle>
              <AlertDescription>
                As our product is digital and content is accessed instantly, we offer refunds only within 7 days of your initial purchase, provided there are technical issues preventing you from using the service. Refunds are also granted for accidental duplicate charges.
              </AlertDescription>
            </Alert>
            <p className="text-muted-foreground mt-4">
              We do not offer refunds for subscription renewals or for periods of inactivity. If you wish to avoid future charges, please be sure to cancel your subscription before your renewal date.
            </p>
          </div>
          
        </CardContent>
      </Card>
    </div>
  );
}
