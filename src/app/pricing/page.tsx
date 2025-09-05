
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Check, X, TrendingUp, LoaderCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

const plans = [
  {
    name: 'Free',
    planId: 'free',
    price: { monthly: '₹0', annually: '₹0' },
    description: 'For casual learners getting started.',
    features: [
      { text: 'Summaries (5k words/month)', included: true },
      { text: 'Flashcards (up to 20)', included: true },
      { text: 'Mindmaps (1 per month)', included: true },
      { text: 'Slides (1 per month)', included: true },
      { text: 'Podcast Generation (preview only)', included: true },
      { text: 'Games (1 session/day)', included: true },
      { text: 'Talkie (10 queries/day)', included: true },
      { text: 'Export Notes (PDF/Word)', included: false },
      { text: 'Premium Themes & Priority Support', included: false },
      { text: 'No Ads', included: false },
    ],
    buttonText: 'Current Plan',
    variant: 'outline',
  },
  {
    name: 'Starter',
    planId: 'starter',
    price: { monthly: '₹199', annually: '₹1499' },
    description: 'For dedicated students and lifelong learners.',
    features: [
      { text: 'Unlimited Summaries', included: true },
      { text: 'Unlimited Flashcards (basic templates)', included: true },
      { text: 'Mindmaps (up to 5/month)', included: true },
      { text: 'Slides (5 per month)', included: true },
      { text: 'Podcast Generation (1/week)', included: true },
      { text: 'Games (3 sessions/day)', included: true },
      { text: 'Talkie (50 queries/day)', included: true },
      { text: 'Export Notes (PDF/Word)', included: false },
      { text: 'Premium Themes & Priority Support', included: false },
      { text: 'No Ads', included: true },
    ],
    buttonText: 'Get Started',
    variant: 'default',
  },
  {
    name: 'Pro',
    planId: 'pro',
    price: { monthly: '₹499', annually: '₹3999' },
    description: 'For power users and professionals.',
    features: [
      { text: 'Unlimited Summaries', included: true },
      { text: 'Unlimited Flashcards', included: true },
      { text: 'Unlimited Mindmaps', included: true },
      { text: 'Unlimited Slides & Exports (PDF/Word)', included: true },
      { text: 'Unlimited Podcast Generation', included: true },
      { text: 'Unlimited Games', included: true },
      { text: 'Unlimited Talkie', included: true },
      { text: 'Premium Themes & Priority Support', included: true },
      { text: 'No Ads', included: true },
    ],
    buttonText: 'Go Pro',
    variant: 'default',
    isPopular: true,
  },
];

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(false);
  const { user, loading } = useAuth();
  const router = useRouter();

  const handlePlanSelection = (planId: string) => {
    if (loading) return; // Prevent action while auth state is loading
    
    const cycle = isAnnual ? 'annually' : 'monthly';
    const paymentUrl = `/payment?plan=${planId}&cycle=${cycle}`;

    if (!user) {
      // If user is not logged in, redirect to login with a redirectUrl
      const loginUrl = `/login?redirectUrl=${encodeURIComponent(paymentUrl)}`;
      router.push(loginUrl);
    } else {
      // If user is logged in, proceed to payment
      router.push(paymentUrl);
    }
  };

  return (
    <div className="container mx-auto max-w-6xl py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold font-serif">Find the perfect plan</h1>
        <p className="text-lg text-muted-foreground mt-3 max-w-2xl mx-auto">
          Start for free, then unlock more power and productivity with a Pro plan.
        </p>
      </div>

      <div className="flex items-center justify-center space-x-3 mb-10">
        <Label htmlFor="billing-cycle">Monthly</Label>
        <Switch
          id="billing-cycle"
          checked={isAnnual}
          onCheckedChange={setIsAnnual}
        />
        <Label htmlFor="billing-cycle" className="flex items-center">
            Annual 
            <span className="ml-2 text-xs bg-accent text-accent-foreground rounded-full px-2 py-0.5">2 months free</span>
        </Label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={cn(
                "flex flex-col",
                plan.isPopular ? 'border-2 border-primary' : ''
            )}
          >
            {plan.isPopular && (
              <div className="absolute -top-3.5 w-full flex justify-center">
                  <div className="bg-primary text-primary-foreground text-xs font-semibold px-4 py-1 rounded-full flex items-center">
                      <TrendingUp className="w-4 h-4 mr-1"/>
                      Most Popular
                  </div>
              </div>
            )}
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="text-center mb-6">
                <span className="text-4xl font-extrabold">
                  {isAnnual ? plan.price.annually : plan.price.monthly}
                </span>
                <span className="text-muted-foreground">
                  /{isAnnual ? 'year' : 'month'}
                </span>
              </div>
              <ul className="space-y-4">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    {feature.included ? (
                      <Check className="w-5 h-5 text-green-500" />
                    ) : (
                      <X className="w-5 h-5 text-muted-foreground" />
                    )}
                    <span className={cn(!feature.included && "text-muted-foreground")}>
                      {feature.text}
                    </span>
                  </li>
                ))}
                 <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500" />
                    <span>Unlimited Device Support</span>
                 </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                variant={plan.variant as any} 
                disabled={plan.name === 'Free' || loading}
                onClick={() => plan.name !== 'Free' && handlePlanSelection(plan.planId)}
              >
                {loading && plan.name !== 'Free' ? <LoaderCircle className="h-4 w-4 animate-spin" /> : plan.buttonText}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
