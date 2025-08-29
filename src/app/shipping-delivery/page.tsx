
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shipping and Delivery Policy | NotesGPT',
};

export default function ShippingDeliveryPage() {
  return (
    <div className="container mx-auto max-w-4xl py-12 px-4">
      <h1 className="text-4xl font-bold font-serif mb-8 text-center">Shipping and Delivery Policy</h1>
      <div className="prose max-w-none">
        <p>NotesGPT is a digital app; no physical products.</p>
        <p>All purchased features, subscriptions, and add-ons are delivered instantly upon successful payment.</p>
        <p>Users get immediate access to AI summaries, podcasts, games, and mindmaps.</p>
        <p>Support is available if content delivery fails.</p>
      </div>
    </div>
  );
}
