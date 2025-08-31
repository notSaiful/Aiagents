
'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Lock } from 'lucide-react';

const plans = {
  starter: { name: 'Starter Plan', price: { monthly: '₹199', annually: '₹1499' } },
  pro: { name: 'Pro Plan', price: { monthly: '₹499', annually: '₹3999' } },
};

function PaymentPageContent() {
  const searchParams = useSearchParams();
  const planId = searchParams.get('plan') as keyof typeof plans | null;
  const cycle = searchParams.get('cycle') as 'monthly' | 'annually' | null;

  const selectedPlan = planId && plans[planId] ? plans[planId] : plans.pro;
  const selectedCycle = cycle || 'monthly';
  const price = selectedPlan.price[selectedCycle];

  return (
     <div className="container mx-auto max-w-4xl py-12 px-4">
      {/* Progress Indicator */}
      <div className="mb-12">
        <ol className="flex items-center w-full">
            <li className="flex w-full items-center text-primary after:content-[''] after:w-full after:h-1 after:border-b after:border-primary after:border-4 after:inline-block">
                <span className="flex items-center justify-center w-10 h-10 bg-primary rounded-full lg:h-12 lg:w-12 shrink-0">
                    <CheckCircle className="w-5 h-5 text-primary-foreground lg:w-6 lg:h-6" />
                </span>
            </li>
            <li className="flex w-full items-center after:content-[''] after:w-full after:h-1 after:border-b after:border-gray-200 after:border-4 after:inline-block dark:after:border-gray-700">
                <span className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full lg:h-12 lg:w-12 dark:bg-gray-700 shrink-0">
                    <span className="text-muted-foreground">2</span>
                </span>
            </li>
            <li className="flex items-center">
                <span className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full lg:h-12 lg:w-12 dark:bg-gray-700 shrink-0">
                    <span className="text-muted-foreground">3</span>
                </span>
            </li>
        </ol>
         <div className="flex justify-between text-sm font-medium mt-2">
            <span className="text-foreground">Choose Plan</span>
            <span className="text-muted-foreground">Payment</span>
            <span className="text-muted-foreground">Confirmation</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Left Side: Payment Form */}
        <div>
          <h2 className="text-2xl font-bold font-serif mb-6">Payment Details</h2>
          <Card>
            <CardContent className="p-6">
                <form className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" placeholder="John Doe" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" type="email" placeholder="you@example.com" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="card-details">Card Details</Label>
                        {/* In a real app, this would be a secure Stripe/Razorpay element */}
                        <Input id="card-details" placeholder="Card Number" />
                        <div className="flex gap-2">
                            <Input placeholder="MM/YY" />
                            <Input placeholder="CVC" />
                        </div>
                    </div>
                    <Button type="submit" className="w-full text-lg py-6 bg-accent text-accent-foreground hover:bg-accent/90">
                        Pay {price}
                    </Button>
                </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Order Summary */}
        <div>
           <h2 className="text-2xl font-bold font-serif mb-6">Order Summary</h2>
           <Card className="bg-muted/50">
             <CardHeader>
                <CardTitle>{selectedPlan.name}</CardTitle>
                <CardDescription>Billed {selectedCycle}</CardDescription>
             </CardHeader>
             <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                    <span>Subtotal</span>
                    <span className="font-semibold">{price}</span>
                </div>
                 <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <span>Taxes</span>
                    <span>Calculated at next step</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total</span>
                    <span>{price}</span>
                </div>
             </CardContent>
             <CardFooter className="flex-col items-start gap-4">
                <p className="text-xs text-muted-foreground text-center w-full flex items-center justify-center">
                    <Lock className="w-3 h-3 mr-1.5" /> 100% Secure Payment via Razorpay
                </p>
                <p className="text-xs text-muted-foreground">
                    By confirming your payment, you agree to our Terms of Service and allow NotesGPT to charge your card for this payment.
                </p>
             </CardFooter>
           </Card>
        </div>
      </div>
    </div>
  );
}

export default function PaymentPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <PaymentPageContent />
        </Suspense>
    )
}
