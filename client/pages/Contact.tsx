import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { useState } from "react";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the form data to a backend endpoint
    console.log("Form submitted:", formData);
    setSubmitted(true);
    setFormData({ name: "", email: "", subject: "", message: "" });
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(1400px_700px_at_50%_-200px,rgba(99,102,241,0.25),transparent),radial-gradient(900px_450px_at_80%_-150px,rgba(34,211,238,0.25),transparent)]" />

      {/* Header */}
      <section className="container py-16 sm:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="bg-gradient-to-b from-foreground to-foreground/80 bg-clip-text text-4xl font-extrabold leading-tight tracking-tight text-transparent sm:text-5xl">
            Get in Touch
          </h1>
          <p className="mt-5 text-lg text-muted-foreground">
            Have questions about Proposal AI? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="container pb-16">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-cyan-500">
              <Mail className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold">Email</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Send us an email and we'll get back to you within 24 hours.
            </p>
            <a
              href="mailto:support@proposalai.com"
              className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
            >
              support@proposalai.com
            </a>
          </div>

          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-emerald-400">
              <Phone className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold">Phone</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Call us during business hours (Mon-Fri, 9AM-5PM EST).
            </p>
            <a
              href="tel:+1234567890"
              className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
            >
              +1 (234) 567-890
            </a>
          </div>

          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-fuchsia-500 to-primary">
              <MapPin className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold">Office</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Visit us at our headquarters or schedule a meeting.
            </p>
            <p className="mt-4 text-sm font-medium">
              San Francisco, CA
              <br />
              United States
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="container pb-24">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-xl border bg-card/50 p-8 backdrop-blur">
            <h2 className="text-2xl font-bold">Send us a message</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Fill out the form below and we'll get back to you shortly.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="mt-2 w-full rounded-lg border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="mt-2 w-full rounded-lg border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="mt-2 w-full rounded-lg border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="How can we help?"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="mt-2 w-full rounded-lg border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Tell us more about your inquiry..."
                />
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full bg-gradient-to-r from-primary to-cyan-500 text-white shadow-lg hover:opacity-90"
              >
                <Send className="mr-2 h-4 w-4" />
                Send Message
              </Button>

              {submitted && (
                <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
                  ✓ Thank you! Your message has been sent successfully. We'll get back to you soon.
                </div>
              )}
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
