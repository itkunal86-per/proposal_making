import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Eye, ArrowRight, Calendar, User, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface ProposalSection {
  id: string;
  title: string;
  content: string;
  layout?: string;
  columnContents?: string[];
  columnStyles?: any[];
  contentStyles?: Record<string, any>;
  titleStyles?: Record<string, any>;
  media?: Array<{ type: string; url: string }>;
  comments?: any[];
  shapes?: any[];
  tables?: any[];
  texts?: any[];
  images?: any[];
  signatureFields?: any[];
  videos?: any[];
}

interface SharedProposalResponse {
  id: string | number;
  title: string;
  client?: string;
  client_id?: string;
  status: string;
  createdBy?: string | null;
  createdAt?: number;
  updatedAt?: number;
  sections: ProposalSection[];
  settings?: Record<string, any>;
  titleStyles?: Record<string, any>;
  signatories?: any[];
}

export default function SharedProposal() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [proposal, setProposal] = useState<SharedProposalResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProposal();
  }, [token]);

  const fetchProposal = async () => {
    if (!token) {
      setError("Invalid share link");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/public/proposal/${token}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.error || "Failed to load proposal");
        setLoading(false);
        return;
      }

      const data: SharedProposalResponse = await response.json();
      setProposal(data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch proposal:", err);
      setError("Failed to load proposal. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-slate-600 font-medium">Loading proposal...</p>
        </div>
      </div>
    );
  }

  if (error || !proposal) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center px-4">
        <div className="rounded-2xl bg-white p-12 shadow-xl max-w-md text-center border border-slate-200">
          <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Proposal Not Found
          </h1>
          <p className="text-slate-600 mb-8">
            {error || "This proposal is no longer available or the link is invalid."}
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Return to Home
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    );
  }

  const statusColor: Record<string, string> = {
    draft: "bg-slate-100 text-slate-700",
    published: "bg-blue-100 text-blue-700",
    sent: "bg-purple-100 text-purple-700",
    accepted: "bg-green-100 text-green-700",
    declined: "bg-red-100 text-red-700",
  };

  const firstImage = proposal.sections
    .flatMap((s) => (s.images || []))
    .find((img) => img.url);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">ProposalAI</h1>
              <p className="text-xs text-slate-500 mt-0.5">Shared Proposal</p>
            </div>
            <a
              href="/"
              className="text-slate-600 hover:text-slate-900 transition-colors font-medium"
            >
              ProposalAI
            </a>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column - Content */}
          <div className="lg:col-span-2">
            {/* Title Section */}
            <div className="mb-12">
              <h2 className="text-5xl font-bold text-slate-900 mb-6 leading-tight">
                {proposal.title}
              </h2>

              {/* Meta Information */}
              <div className="flex flex-wrap gap-6 mb-8">
                {proposal.client && (
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-100 rounded-lg">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">
                        Client
                      </p>
                      <p className="text-slate-900 font-semibold">
                        {proposal.client}
                      </p>
                    </div>
                  </div>
                )}

                {proposal.createdAt && (
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-cyan-100 rounded-lg">
                      <Calendar className="w-5 h-5 text-cyan-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">
                        Created
                      </p>
                      <p className="text-slate-900 font-semibold">
                        {formatDate(proposal.createdAt)}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-purple-100 rounded-lg">
                    <FileText className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">
                      Status
                    </p>
                    <div className={`inline-block px-3 py-1.5 rounded-full text-xs font-semibold ${statusColor[proposal.status] || statusColor.draft}`}>
                      {proposal.status.charAt(0).toUpperCase() +
                        proposal.status.slice(1)}
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={() => navigate(`/share/${token}/preview`)}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-8 py-6 h-auto text-lg font-semibold rounded-lg transition-all hover:shadow-lg"
                >
                  <Eye className="w-5 h-5" />
                  View Full Proposal
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Description Section */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
              <h3 className="text-2xl font-bold text-slate-900 mb-6">
                Overview
              </h3>

              {proposal.sections.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-slate-800 mb-4">
                    {proposal.sections[0].title}
                  </h4>
                  <div className="prose prose-sm max-w-none text-slate-700 mb-6">
                    <div
                      dangerouslySetInnerHTML={{
                        __html: proposal.sections[0].content.substring(0, 500),
                      }}
                      className="line-clamp-4"
                    />
                  </div>

                  {proposal.sections.length > 1 && (
                    <div className="border-t border-slate-200 pt-6 mt-6">
                      <h4 className="text-sm font-semibold text-slate-700 mb-4">
                        Proposal Sections
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {proposal.sections.slice(0, 6).map((section, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 hover:bg-blue-50 transition-colors"
                          >
                            <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold">
                              {idx + 1}
                            </div>
                            <span className="text-sm font-medium text-slate-700">
                              {section.title}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="lg:col-span-1">
            {/* Preview Card */}
            {firstImage && (
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200 mb-8 sticky top-24">
                <img
                  src={firstImage.url}
                  alt="Proposal preview"
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
                <div className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50">
                  <p className="text-sm text-slate-600 mb-4">
                    This proposal contains detailed information about your project, timeline, budget, and deliverables.
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-slate-700">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                      <span>Professional design</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                      <span>Detailed breakdown</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                      <span>Clear deliverables</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Info Box */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <h3 className="font-bold text-slate-900 mb-4">About This Proposal</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-1">
                    Document Type
                  </p>
                  <p className="text-slate-900 font-medium">Business Proposal</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-1">
                    Sections
                  </p>
                  <p className="text-slate-900 font-medium">
                    {proposal.sections.length} sections
                  </p>
                </div>
                {proposal.updatedAt && (
                  <div>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-1">
                      Last Updated
                    </p>
                    <p className="text-slate-900 font-medium">
                      {formatDate(proposal.updatedAt)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-200 bg-white/50 backdrop-blur-sm mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-600">
              This proposal was shared via ProposalAI
            </p>
            <div className="flex items-center gap-6">
              <a href="/privacy" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
                Privacy
              </a>
              <a href="/terms" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
                Terms
              </a>
              <a href="/" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
                Contact
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
