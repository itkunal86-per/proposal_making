import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const faqs = [
  {
    category: "Getting Started",
    questions: [
      {
        q: "What is Proposal AI?",
        a: "Proposal AI is an AI-powered proposal management system that helps you create, customize, and send professional proposals faster. It uses Retrieval-Augmented Generation (RAG) technology to generate tailored content based on your knowledge base and past proposals.",
      },
      {
        q: "How do I get started?",
        a: "Simply sign up for a free account, set up your knowledge base, create your first template, and start writing proposals. We provide guided onboarding to help you get up and running in minutes.",
      },
      {
        q: "Do you offer a free trial?",
        a: "Yes! We offer a 14-day free trial with full access to all features. No credit card required to get started.",
      },
      {
        q: "What if I need help getting set up?",
        a: "We offer dedicated onboarding support, video tutorials, and documentation. Our support team is also available via email and chat to assist with any questions.",
      },
    ],
  },
  {
    category: "Features & Capabilities",
    questions: [
      {
        q: "What is RAG and how does it work?",
        a: "RAG (Retrieval-Augmented Generation) combines AI with your knowledge base to generate proposals. The AI retrieves relevant information from your documents, CRM data, and past proposals, then uses that information to draft proposal sections with citations.",
      },
      {
        q: "Can I customize proposal templates?",
        a: "Absolutely! You can create unlimited custom templates with your branding, pricing structures, and content blocks. Templates are reusable and can be customized per proposal.",
      },
      {
        q: "How does the analytics work?",
        a: "Our analytics track opens, clicks, time spent on each section, and engagement patterns. You'll see real-time notifications when prospects view your proposal and which sections they spend the most time on.",
      },
      {
        q: "Is e-signature really legally binding?",
        a: "Yes, our e-signature feature uses legally compliant technology that creates binding digital signatures. We comply with eIDAS, ESIGN, and other international electronic signature standards.",
      },
    ],
  },
  {
    category: "Integrations & Data",
    questions: [
      {
        q: "What integrations do you support?",
        a: "We integrate with popular CRM systems, document management tools, and communication platforms. You can also connect your own data sources via our API.",
      },
      {
        q: "Is my data secure?",
        a: "Security is our top priority. We use enterprise-grade encryption, comply with GDPR and CCPA, and undergo regular security audits. Your data is stored securely and never used to train AI models without your permission.",
      },
      {
        q: "Can I import existing proposals?",
        a: "Yes! You can import your existing proposals to build your template library. Our system will analyze them to suggest templates and content blocks.",
      },
      {
        q: "How do I export proposals?",
        a: "Proposals can be exported as PDF, Word documents, or HTML. You can also integrate directly with your CRM or document management system.",
      },
    ],
  },
  {
    category: "Pricing & Billing",
    questions: [
      {
        q: "What are the pricing plans?",
        a: "We offer flexible plans starting from $99/month for individuals up to enterprise solutions with custom pricing. Each plan includes different numbers of users, proposals, and templates.",
      },
      {
        q: "Can I change plans anytime?",
        a: "Yes, you can upgrade or downgrade your plan anytime. Changes take effect at your next billing cycle.",
      },
      {
        q: "Do you offer discounts for annual billing?",
        a: "Yes! We offer 20% discount when you pay annually instead of monthly. We also have special pricing for nonprofits and educational institutions.",
      },
      {
        q: "What's included in each plan?",
        a: "Each plan includes a different number of team members, proposals, templates, and support tier. Check our pricing page for detailed plan comparisons.",
      },
    ],
  },
  {
    category: "Support & Account",
    questions: [
      {
        q: "What support options are available?",
        a: "We offer email support, live chat, and phone support for enterprise customers. All plans include access to our knowledge base and video tutorials.",
      },
      {
        q: "How quickly will I get support?",
        a: "We aim to respond to support requests within 2 hours during business hours. Enterprise customers get priority support with guaranteed response times.",
      },
      {
        q: "Can I delete my account?",
        a: "Yes, you can delete your account anytime. Your data will be securely deleted within 30 days. You can also export your data before deletion.",
      },
      {
        q: "Do you have a knowledge base or documentation?",
        a: "Yes! We have comprehensive documentation, video tutorials, and a community forum where you can find answers and share best practices.",
      },
    ],
  },
];

export default function FAQ() {
  const { user, status } = useAuth();
  const [expandedIndex, setExpandedIndex] = useState<string | null>(null);

  const getStartedHref = () => {
    if (status === "ready" && user) {
      return user.role === "admin" ? "/dashboard" : "/my/proposals";
    }
    return "/login";
  };

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(1400px_700px_at_50%_-200px,rgba(99,102,241,0.25),transparent),radial-gradient(900px_450px_at_80%_-150px,rgba(34,211,238,0.25),transparent)]" />

      {/* Header */}
      <section className="container py-16 sm:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="bg-gradient-to-b from-foreground to-foreground/80 bg-clip-text text-4xl font-extrabold leading-tight tracking-tight text-transparent sm:text-5xl">
            Frequently Asked Questions
          </h1>
          <p className="mt-5 text-lg text-muted-foreground">
            Find answers to common questions about Proposal AI. Can't find what you're looking for? Contact our support team.
          </p>
        </div>
      </section>

      {/* FAQ Sections */}
      <section className="container pb-24">
        <div className="mx-auto max-w-3xl space-y-8">
          {faqs.map((section, sectionIdx) => (
            <div key={sectionIdx}>
              <h2 className="mb-6 text-2xl font-bold">{section.category}</h2>
              <div className="space-y-4">
                {section.questions.map((faq, qIdx) => {
                  const itemId = `${sectionIdx}-${qIdx}`;
                  const isExpanded = expandedIndex === itemId;

                  return (
                    <div
                      key={itemId}
                      className="rounded-lg border bg-card transition-all"
                    >
                      <button
                        onClick={() =>
                          setExpandedIndex(isExpanded ? null : itemId)
                        }
                        className="w-full px-6 py-4 text-left hover:bg-muted/50 transition-colors flex items-center justify-between"
                      >
                        <h3 className="font-semibold text-foreground">
                          {faq.q}
                        </h3>
                        <ChevronDown
                          className={`h-5 w-5 text-muted-foreground shrink-0 transition-transform ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                      {isExpanded && (
                        <div className="border-t px-6 py-4">
                          <p className="text-muted-foreground">{faq.a}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact CTA */}
      <section className="container pb-24">
        <div className="mx-auto max-w-2xl rounded-2xl border bg-card/50 p-8 backdrop-blur">
          <div className="text-center">
            <h2 className="text-2xl font-bold">Still have questions?</h2>
            <p className="mt-3 text-muted-foreground">
              Our support team is here to help. Reach out to us and we'll get back to you within 24 hours.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <a href="/contact">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  Contact Support
                </Button>
              </a>
              <a href={getStartedHref()}>
                <Button className="w-full sm:w-auto bg-gradient-to-r from-primary to-cyan-500 text-white shadow-lg hover:opacity-90">
                  Get Started
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
