
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cancellation and Refund Policy | NotesGPT',
};

export default function CancellationRefundPage() {
  return (
    <div className="container mx-auto max-w-4xl py-12 px-4">
      <h1 className="text-4xl font-bold font-serif mb-8 text-center">Cancellation and Refund Policy</h1>
      <div className="prose max-w-none">
        <h2>1. Subscription Cancellation</h2>
        <ul>
          <li>Users can cancel anytime via the app.</li>
          <li>No further payments will be charged after cancellation.</li>
        </ul>

        <h2>2. Refund Eligibility</h2>
        <p>Refunds are granted only if:</p>
        <ul>
          <li>Payment failed or duplicate charges occurred.</li>
          <li>Within 7 days of purchase (digital product limitation).</li>
        </ul>

        <h2>3. Refund Process</h2>
        <ul>
          <li>Contact support at <a href="mailto:support@notesgpt.study">support@notesgpt.study</a></li>
          <li>Razorpay processes refunds within 5–7 business days.</li>
        </ul>
        
        <h2>4. Non-Refundable</h2>
        <ul>
          <li>Completed subscription periods cannot be refunded.</li>
          <li>Access to digital content is granted immediately after payment.</li>
        </ul>
      </div>
    </div>
  );
}
