import Link from 'next/link'

export const metadata = {
  title: 'Terms of Service | Annual Review Vault',
  description: 'Terms and conditions for using Annual Review Vault.',
}

export default function TermsPage() {
  return (
    <div className="py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
            &larr; Back to home
          </Link>
        </div>

        <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
        <p className="text-muted-foreground mb-8">Last updated: December 17, 2025</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground mb-4">
              By accessing or using Annual Review Vault, you agree to be bound by these Terms of Service
              and our Privacy Policy. If you do not agree to these terms, please do not use our service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">2. Description of Service</h2>
            <p className="text-muted-foreground mb-4">
              Annual Review Vault is a digital tool for completing annual personal reviews. Our service includes:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
              <li>Access to curated annual review templates</li>
              <li>A guided question-by-question review experience</li>
              <li>Free download of completed reviews as Markdown files</li>
              <li>Optional paid features including cloud storage, progress saving, and the &quot;Vault&quot; time capsule experience</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">3. Account Registration</h2>
            <p className="text-muted-foreground mb-4">
              Guest users may complete reviews without an account. To access premium features,
              you must create an account using Google Sign-In. You are responsible for maintaining
              the confidentiality of your account and for all activities under your account.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">4. Subscription and Billing</h2>
            <p className="text-muted-foreground mb-4">
              Premium features require a paid subscription. By subscribing, you agree to:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
              <li>Pay the applicable subscription fees (monthly or annual)</li>
              <li>Automatic renewal at the end of each billing period unless cancelled</li>
              <li>Payment processing through Stripe, subject to their terms of service</li>
            </ul>
            <p className="text-muted-foreground mb-4">
              Prices are subject to change with reasonable notice. Current pricing is displayed
              on our pricing page.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">5. Cancellation and Refunds</h2>
            <p className="text-muted-foreground mb-4">
              You may cancel your subscription at any time through your account settings or
              the Stripe customer portal. Upon cancellation:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
              <li>You will retain access until the end of your current billing period</li>
              <li>Your existing vault contents will remain accessible</li>
              <li>No partial refunds are provided for unused time</li>
              <li>You may resubscribe at any time to regain access to premium features</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">6. Acceptable Use</h2>
            <p className="text-muted-foreground mb-4">You agree not to:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
              <li>Use the service for any illegal purpose</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with or disrupt the service</li>
              <li>Share your account credentials with others</li>
              <li>Use automated tools to access the service without permission</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">7. Intellectual Property</h2>
            <p className="text-muted-foreground mb-4">
              Annual Review Vault and its original content, features, and functionality are owned by
              us and are protected by copyright, trademark, and other intellectual property laws.
              The review templates are provided for your personal use in completing reviews.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">8. Your Content</h2>
            <p className="text-muted-foreground mb-4">
              You retain ownership of all content you create through our service, including your
              review responses. By using our service, you grant us a limited license to store
              and display your content solely for the purpose of providing the service to you.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">9. Disclaimer of Warranties</h2>
            <p className="text-muted-foreground mb-4">
              The service is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind,
              either express or implied. We do not guarantee that the service will be uninterrupted,
              secure, or error-free.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">10. Limitation of Liability</h2>
            <p className="text-muted-foreground mb-4">
              To the maximum extent permitted by law, we shall not be liable for any indirect,
              incidental, special, consequential, or punitive damages, or any loss of profits
              or revenues, arising out of your use of the service. Our total liability shall
              not exceed the amount you paid us in the twelve months prior to the event giving
              rise to liability.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">11. Governing Law</h2>
            <p className="text-muted-foreground mb-4">
              These Terms shall be governed by and construed in accordance with the laws of the
              United States, without regard to conflict of law principles.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">12. Changes to Terms</h2>
            <p className="text-muted-foreground mb-4">
              We reserve the right to modify these terms at any time. We will provide notice of
              material changes by updating the &quot;Last updated&quot; date and, for significant changes,
              by email notification. Continued use of the service after changes constitutes
              acceptance of the new terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">13. Contact Information</h2>
            <p className="text-muted-foreground mb-4">
              If you have questions about these Terms of Service, please contact us at:
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
