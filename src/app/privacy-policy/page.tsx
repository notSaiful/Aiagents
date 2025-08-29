
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | NotesGPT',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto max-w-4xl py-12 px-4">
      <h1 className="text-4xl font-bold font-serif mb-8 text-center">Privacy Policy</h1>
      <div className="prose max-w-none">
        <h2>1. Introduction</h2>
        <p>Welcome to NotesGPT! Your privacy is important to us. This policy explains how we collect, use, and protect your data when you use our app.</p>

        <h2>2. Information We Collect</h2>
        <ul>
            <li><strong>Personal Information:</strong> Name, email, and payment information for subscriptions.</li>
            <li><strong>App Usage Data:</strong> Notes you paste, style preferences, learning interactions, podcasts, and games.</li>
            <li><strong>Payment Information:</strong> Processed securely via Razorpay. We do not store card details.</li>
            <li><strong>Technical Data:</strong> Device type, IP address, and analytics for app improvement.</li>
        </ul>

        <h2>3. How We Use Your Information</h2>
        <ul>
            <li>Provide and improve AI features: summaries, flashcards, podcasts, mindmaps.</li>
            <li>Personalize your learning experience.</li>
            <li>Process payments and subscriptions.</li>
            <li>Communicate updates, offers, and support.</li>
        </ul>

        <h2>4. Data Sharing</h2>
        <p>We do not sell your data. We may share information with:</p>
        <ul>
            <li>Razorpay for payment processing</li>
            <li>Analytics providers for app performance</li>
        </ul>

        <h2>5. Data Security</h2>
        <p>We use industry-standard encryption and Firebase security features to protect your data.</p>

        <h2>6. Your Rights</h2>
        <ul>
            <li>Access, correct, or delete your data anytime.</li>
            <li>Cancel subscriptions anytime.</li>
        </ul>

        <h2>7. Contact Us</h2>
        <p>For privacy concerns: <a href="mailto:support@notesgpt.study">support@notesgpt.study</a></p>
      </div>
    </div>
  );
}
