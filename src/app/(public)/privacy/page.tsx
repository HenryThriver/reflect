import Link from 'next/link'

export const metadata = {
  title: 'Privacy Policy | Annual Review Vault',
  description: 'How Annual Review Vault collects, uses, and protects your personal information.',
}

export default function PrivacyPage() {
  return (
    <div className="py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
            &larr; Back to home
          </Link>
        </div>

        <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: December 17, 2025</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">1. Introduction</h2>
            <p className="text-muted-foreground mb-4">
              Welcome to Annual Review Vault. We respect your privacy and are committed to protecting your personal data.
              This privacy policy explains how we collect, use, and safeguard your information when you use our service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">2. Information We Collect</h2>
            <p className="text-muted-foreground mb-4">We collect the following types of information:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
              <li><strong className="text-foreground">Account Information:</strong> When you sign in with Google, we receive your email address and display name.</li>
              <li><strong className="text-foreground">Review Content:</strong> The responses you provide when completing annual reviews.</li>
              <li><strong className="text-foreground">Usage Data:</strong> Information about how you interact with our service, including pages visited and features used.</li>
              <li><strong className="text-foreground">Local Storage:</strong> For guest users, review progress is stored locally on your device.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">3. How We Use Your Information</h2>
            <p className="text-muted-foreground mb-4">We use your information to:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
              <li>Provide and maintain our service</li>
              <li>Create and manage your account</li>
              <li>Store and retrieve your annual reviews</li>
              <li>Process subscription payments</li>
              <li>Send important service notifications</li>
              <li>Improve and personalize your experience</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">4. Third-Party Services</h2>
            <p className="text-muted-foreground mb-4">We use the following third-party services to operate Annual Review Vault:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
              <li><strong className="text-foreground">Google OAuth:</strong> For authentication and sign-in</li>
              <li><strong className="text-foreground">Supabase:</strong> For database storage and user authentication</li>
              <li><strong className="text-foreground">Stripe:</strong> For payment processing (we do not store your payment card details)</li>
              <li><strong className="text-foreground">Vercel:</strong> For hosting and serving our application</li>
            </ul>
            <p className="text-muted-foreground mb-4">
              Each of these services has their own privacy policies governing how they handle your data.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">5. Data Storage and Security</h2>
            <p className="text-muted-foreground mb-4">
              We implement appropriate technical and organizational measures to protect your personal data against
              unauthorized access, alteration, disclosure, or destruction. Your data is stored securely using
              industry-standard encryption and security practices.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">6. Your Rights</h2>
            <p className="text-muted-foreground mb-4">You have the right to:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
              <li>Access the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Export your review data</li>
              <li>Withdraw consent for data processing</li>
            </ul>
            <p className="text-muted-foreground mb-4">
              To exercise any of these rights, please contact us at the email address provided below.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">7. Cookies and Local Storage</h2>
            <p className="text-muted-foreground mb-4">
              We use essential cookies for authentication and session management. For guest users,
              we use browser local storage to save your review progress. You can clear this data
              at any time through your browser settings.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">8. Children&apos;s Privacy</h2>
            <p className="text-muted-foreground mb-4">
              Annual Review Vault is not intended for children under 18 years of age. We do not
              knowingly collect personal information from children under 18.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">9. Changes to This Policy</h2>
            <p className="text-muted-foreground mb-4">
              We may update this privacy policy from time to time. We will notify you of any
              material changes by posting the new policy on this page and updating the
              &quot;Last updated&quot; date.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">10. Contact Us</h2>
            <p className="text-muted-foreground mb-4">
              If you have questions about this privacy policy or our data practices,
              please contact us at:
            </p>
            <p className="text-muted-foreground">
              <strong className="text-foreground">Email:</strong> support@thrivinghenry.com
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
