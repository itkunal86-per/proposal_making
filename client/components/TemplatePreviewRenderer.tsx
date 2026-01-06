import React from "react";
import { Proposal } from "@/services/proposalsService";
import { SystemTemplate } from "@/services/systemTemplatesService";
import { FileText } from "lucide-react";

interface TemplatePreviewRendererProps {
  template: SystemTemplate | Proposal;
}

export const TemplatePreviewRenderer: React.FC<TemplatePreviewRendererProps> = ({
  template,
}) => {
  // Determine the proposal structure
  const proposal = React.useMemo(() => {
    if ('client' in template) {
      return template as Proposal;
    }
    return template as any as Proposal;
  }, [template]);

  const sectionCount = proposal.sections?.length || 0;

  return (
    <div className="w-full h-full bg-white rounded overflow-hidden flex flex-col">
      {/* Header with template title */}
      <div className="px-4 py-3 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white flex-shrink-0">
        <div className="flex items-start gap-2">
          <FileText className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm text-slate-900 line-clamp-2">
              {proposal.title || 'Untitled Template'}
            </h3>
          </div>
        </div>
      </div>

      {/* Content area showing sections */}
      <div className="px-4 py-3 flex-1 flex flex-col justify-between">
        {/* Sections list */}
        <div className="space-y-2 overflow-y-auto max-h-32">
          {proposal.sections && proposal.sections.length > 0 ? (
            <>
              {proposal.sections.slice(0, 3).map((section, idx) => (
                <div key={section.id || idx} className="text-xs">
                  <div className="font-medium text-slate-700">
                    {idx + 1}. {section.title || `Section ${idx + 1}`}
                  </div>
                  <div className="text-slate-500 text-xs line-clamp-1 mt-0.5">
                    {section.content ? '✓ Has content' : '• No content'}
                    {(section as any).images?.length > 0 && ` • ${(section as any).images.length} image(s)`}
                    {section.tables?.length > 0 && ` • ${section.tables.length} table(s)`}
                  </div>
                </div>
              ))}
              {proposal.sections.length > 3 && (
                <div className="text-xs text-slate-500 pt-1 border-t border-slate-200 mt-1">
                  +{proposal.sections.length - 3} more section{proposal.sections.length - 3 !== 1 ? 's' : ''}
                </div>
              )}
            </>
          ) : (
            <div className="text-xs text-slate-500 italic">No sections yet</div>
          )}
        </div>

        {/* Template info footer */}
        <div className="pt-2 border-t border-slate-200 mt-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600">
              <span className="font-semibold text-slate-900">{sectionCount}</span> section{sectionCount !== 1 ? 's' : ''}
            </span>
            <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium">
              Preview
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
