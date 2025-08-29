
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us | NotesGPT',
};

export default function ContactUsPage() {
  return (
    <div className="container mx-auto max-w-4xl py-12 px-4">
      <h1 className="text-4xl font-bold font-serif mb-8 text-center">Contact Us</h1>
      <div className="prose max-w-none text-center">
        <p>Have questions or need support? Reach out anytime:</p>
        <ul>
            <li><strong>Email:</strong> <a href="mailto:support@ainotesapp.com">support@ainotesapp.com</a></li>
            <li><strong>Website:</strong> <a href="https://www.notesgpt.study" target="_blank" rel="noopener noreferrer">www.notesgpt.study</a></li>
            <li><strong>Feedback Form:</strong> In-app “Contact Us” section</li>
        </ul>
        <p><strong>Support Hours:</strong> Mon–Fri, 9 AM – 6 PM IST</p>
        <p>We’re here to help with subscriptions, AI features, or technical issues.</p>
      </div>
    </div>
  );
}
