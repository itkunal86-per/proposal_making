import Footer from "@/components/layout/Footer";

export default function Privacy() {
  return (
    <div className="relative flex min-h-screen flex-col">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(1400px_700px_at_50%_-200px,rgba(99,102,241,0.15),transparent)]" />

      <section className="container py-16 sm:py-24">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Privacy Policy
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Last updated: December 2024
          </p>

          <div className="prose prose-invert mt-12 max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold">1. Introduction</h2>
              <p className="mt-4 text-muted-foreground">
                Proposal AI ("Company", "we", "our", or "us") operates the Proposal AI
                application. This page informs you of our policies regarding the collection,
                use, and disclosure of personal data when you use our service and the choices
                you have associated with that data.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold">2. Information Collection and Use</h2>
              <p className="mt-4 text-muted-foreground">
                We collect several different types of information for various purposes to
                provide and improve our service to you.
              </p>
              <h3 className="mt-6 text-xl font-semibold">Types of Data Collected</h3>
              <ul className="mt-3 list-inside list-disc space-y-2 text-muted-foreground">
                <li>
                  <strong>Personal Data:</strong> While using our service, we may ask you to
                  provide us with certain personally identifiable information that can be used
                  to contact or identify you ("Personal Data"). This may include:
                  <ul className="mt-2 list-inside list-circle space-y-1 pl-6">
                    <li>Email address</li>
                    <li>First name and last name</li>
                    <li>Phone number</li>
                    <li>Address, State, Province, ZIP/Postal code, City</li>
                    <li>Cookies and Usage Data</li>
                  </ul>
                </li>
                <li>
                  <strong>Usage Data:</strong> We may also collect information on how the
                  service is accessed and used ("Usage Data"). This may include information
                  such as your computer's Internet Protocol address (e.g. IP address),
                  browser type, browser version, the pages you visit, the time and date of
                  your visit, the time spent on those pages, and other diagnostic data.
                </li>
                <li>
                  <strong>Tracking & Cookies Data:</strong> We use cookies and similar tracking
                  technologies to track activity on our service and hold certain information.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold">3. Use of Data</h2>
              <p className="mt-4 text-muted-foreground">
                Proposal AI uses the collected data for various purposes:
              </p>
              <ul className="mt-3 list-inside list-disc space-y-2 text-muted-foreground">
                <li>To provide and maintain our service</li>
                <li>To notify you about changes to our service</li>
                <li>
                  To allow you to participate in interactive features of our service when
                  you choose to do so
                </li>
                <li>To provide customer support</li>
                <li>
                  To gather analysis or valuable information so that we can improve our
                  service
                </li>
                <li>To monitor the usage of our service</li>
                <li>To detect, prevent and address technical and security issues</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold">4. Security of Data</h2>
              <p className="mt-4 text-muted-foreground">
                The security of your data is important to us, but remember that no method
                of transmission over the Internet or method of electronic storage is 100%
                secure. While we strive to use commercially acceptable means to protect your
                Personal Data, we cannot guarantee its absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold">5. Changes to This Privacy Policy</h2>
              <p className="mt-4 text-muted-foreground">
                We may update our Privacy Policy from time to time. We will notify you of
                any changes by posting the new Privacy Policy on this page and updating the
                "effective date" at the top of this Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold">6. Contact Us</h2>
              <p className="mt-4 text-muted-foreground">
                If you have any questions about this Privacy Policy, please contact us at:
              </p>
              <ul className="mt-3 list-inside list-disc space-y-2 text-muted-foreground">
                <li>
                  By email: <span className="text-foreground">privacy@proposalai.com</span>
                </li>
                <li>
                  By visiting this page on our website:{" "}
                  <span className="text-foreground">www.proposalai.com/contact</span>
                </li>
              </ul>
            </section>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
