
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms and Conditions | NotesGPT',
};

export default function TermsAndConditionsPage() {
  return (
    <div className="container mx-auto max-w-4xl py-12 px-4">
      <h1 className="text-4xl font-bold font-serif mb-8 text-center">Terms and Conditions</h1>
      <div className="prose max-w-none">
        <h2>1. Acceptance</h2>
        <p>By using NotesGPT, you agree to these terms.</p>

        <h2>2. App Usage</h2>
        <ul>
            <li>NotesGPT is for personal educational purposes.</li>
            <li>Content generated is AI-based; results may vary.</li>
        </ul>

        <h2>3. Subscriptions & Payments</h2>
        <ul>
            <li>Payments handled via Razorpay.</li>
            <li>Prices, billing, and subscription cycles are listed in-app.</li>
            <li>Subscription renewals are automatic unless canceled.</li>
        </ul>

        <h2>4. Intellectual Property</h2>
        <ul>
            <li>All AI-generated content belongs to the user.</li>
            <li>App design, logos, and code are property of NotesGPT.</li>
        </ul>

        <h2>5. User Obligations</h2>
        <ul>
            <li>Do not misuse the app or distribute illegal content.</li>
            <li>Respect other users and community guidelines.</li>
        </ul>
        
        <h2>6. Limitation of Liability</h2>
        <ul>
            <li>NotesGPT is not responsible for study outcomes.</li>
            <li>Use at your own risk.</li>
        </ul>

        <h2>7. Changes to Terms</h2>
        <p>We may update these terms; users will be notified.</p>
      </div>
    </div>
  );
}
