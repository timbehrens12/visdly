import { StaticPageLayout } from '../components/StaticPageLayout';
import { useOS } from '../contexts/OSContext';

export const TermsOfServicePage = () => {
    const { isMac } = useOS();
    return (
        <StaticPageLayout
            title="Terms of Service"
            subtitle="Last updated: January 15, 2026"
        >
            <section className="space-y-4">
                <h2 className="text-xl font-bold text-slate-900">1. Agreement to Terms</h2>
                <p>
                    By accessing or using visdly ("the Service"), you agree to be bound by these Terms of Service. visdly is a live AI study sidekick designed for {isMac ? 'macOS and Windows' : 'Windows and macOS'}.
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-bold text-slate-900">2. Usage and Limits</h2>
                <p>
                    visdly provides access to AI processing features through a subscription and daily message limit system.
                </p>
                <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Daily Limits:</strong> Free accounts have a daily message limit that resets every 24 hours. Subscription plans offer increased or unlimited message capacity.</li>
                    <li><strong>All Purchases Final:</strong> Due to the nature of digital software and AI processing costs, all subscription purchases are final and non-refundable.</li>
                </ul>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-bold text-slate-900">3. Acceptable Use & Overlay Technology</h2>
                <p>
                    visdly's live overlay technology is provided to enhance your study experience.
                </p>
                <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Academic Integrity:</strong> You are solely responsible for ensuring that your use of visdly complies with your educational institution's academic integrity policies. visdly is intended as an educational aid and study tutor.</li>
                    <li><strong>Prohibited Actions:</strong> You may not attempt to reverse engineer the desktop application, bypass usage limitations, or use the service for any illegal activities.</li>
                </ul>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-bold text-slate-900">4. Disclaimer of Warranties</h2>
                <p>
                    visdly is provided on an "as is" and "as available" basis. We do not warrant that the service will be 100% uninterrupted or error-free, although we strive for maximum reliability.
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-bold text-slate-900">5. Limitation of Liability</h2>
                <p>
                    visdly shall not be liable for any academic consequences, including but not limited to failing grades or disciplinary actions, resulting from the use or misuse of the Service.
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-bold text-slate-900">6. Contact</h2>
                <p>
                    For legal inquiries or terms clarification, please contact <a href="mailto:support@visdly.com" className="text-[#0ea5e9] hover:underline">support@visdly.com</a>.
                </p>
            </section>
        </StaticPageLayout>
    );
};
