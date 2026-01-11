import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { generateProposalContent } from "@/services/aiGenerationService";
import { Proposal } from "@/services/proposalsService";
import { Loader2, Send, FileUp, Link as LinkIcon, X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ChatMessage {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface AttachedFile {
  name: string;
  type: "rfp" | "url";
  content: string;
}

interface GenerateProposalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  baseProposal: Proposal;
  onProposalGenerated: (proposal: Proposal) => void;
}

export const GenerateProposalDialog: React.FC<GenerateProposalDialogProps> = ({
  open,
  onOpenChange,
  baseProposal,
  onProposalGenerated,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize with a welcome message
  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          type: "assistant",
          content: "Hi! I'm here to help you generate a proposal. You can describe what you need, attach an RFP document, or provide a URL to crawl. What would you like to create?",
          timestamp: new Date(),
        },
      ]);
    }
  }, [open, messages.length]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF or Word document (.pdf, .doc, .docx)",
        variant: "destructive",
      });
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const fileName = file.name;
        
        setAttachedFiles([
          ...attachedFiles,
          {
            name: fileName,
            type: "rfp",
            content: content,
          },
        ]);

        toast({
          title: "File attached",
          description: `${fileName} has been attached successfully`,
        });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to read the file",
        variant: "destructive",
      });
    }

    // Reset file input
    event.target.value = "";
  };

  const handleAddUrl = () => {
    if (!urlInput.trim()) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL",
        variant: "destructive",
      });
      return;
    }

    // Validate URL
    try {
      new URL(urlInput);
    } catch {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL starting with http:// or https://",
        variant: "destructive",
      });
      return;
    }

    setAttachedFiles([
      ...attachedFiles,
      {
        name: urlInput,
        type: "url",
        content: urlInput,
      },
    ]);

    toast({
      title: "URL added",
      description: "URL has been added for crawling",
    });

    setUrlInput("");
    setShowUrlInput(false);
  };

  const removeAttachment = (index: number) => {
    setAttachedFiles(attachedFiles.filter((_, i) => i !== index));
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) {
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "user",
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      // Prepare the prompt with attachments information
      let enhancedPrompt = inputMessage;

      if (attachedFiles.length > 0) {
        enhancedPrompt += "\n\nAttached resources:\n";
        attachedFiles.forEach((file) => {
          if (file.type === "rfp") {
            enhancedPrompt += `- RFP Document: ${file.name}\n`;
          } else if (file.type === "url") {
            enhancedPrompt += `- URL to crawl: ${file.content}\n`;
          }
        });
      }

      const updated = await generateProposalContent(
        { ...baseProposal, client: baseProposal.client },
        enhancedPrompt
      );

      // Add assistant response
      const assistantMessage: ChatMessage = {
        id: Date.now().toString() + "a",
        type: "assistant",
        content: "Your proposal has been generated successfully! Redirecting you to the editor...",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Small delay before closing to show the success message
      setTimeout(() => {
        onProposalGenerated(updated);
        onOpenChange(false);
        setMessages([]);
        setAttachedFiles([]);
        toast({
          title: "Success",
          description: "Proposal generated successfully!",
        });
      }, 1000);
    } catch (error) {
      console.error("Generation error:", error);
      const errorMessage: ChatMessage = {
        id: Date.now().toString() + "e",
        type: "assistant",
        content: `I encountered an error: ${
          error instanceof Error ? error.message : "Failed to generate proposal"
        }. Please try again or adjust your request.`,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to generate proposal",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col max-w-2xl h-[90vh] p-0 gap-0">
        <DialogHeader className="border-b border-border px-6 py-4 flex-shrink-0">
          <DialogTitle>AI Proposal Generator</DialogTitle>
          <DialogDescription>
            Describe your proposal needs, attach documents, or provide URLs for AI to analyze
          </DialogDescription>
        </DialogHeader>

        {/* Chat Messages Area */}
        <ScrollArea className="flex-1 overflow-hidden">
          <div className="px-6 py-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.type === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                    message.type === "user"
                      ? "bg-primary text-primary-foreground rounded-br-none"
                      : "bg-muted text-muted-foreground rounded-bl-none"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {message.content}
                  </p>
                  <span className="text-xs opacity-70 mt-2 block">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted text-muted-foreground px-4 py-3 rounded-lg rounded-bl-none flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Generating your proposal...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Attachments Display */}
        {attachedFiles.length > 0 && (
          <div className="border-t border-border px-6 py-3 flex-shrink-0">
            <div className="flex flex-wrap gap-2">
              {attachedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-secondary/50 border border-border rounded-full px-3 py-1.5 text-sm"
                >
                  <span className="text-xs font-medium">
                    {file.type === "rfp" ? "📄" : "🔗"} {file.name}
                  </span>
                  <button
                    onClick={() => removeAttachment(index)}
                    className="hover:text-destructive transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* URL Input Field */}
        {showUrlInput && (
          <div className="border-t border-border px-6 py-3 flex-shrink-0 flex gap-2">
            <Input
              placeholder="https://example.com"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleAddUrl();
                }
              }}
              disabled={isLoading}
            />
            <Button
              size="sm"
              onClick={handleAddUrl}
              disabled={isLoading || !urlInput.trim()}
            >
              Add
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setShowUrlInput(false);
                setUrlInput("");
              }}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        )}

        {/* Input Area */}
        <div className="border-t border-border px-6 py-4 flex-shrink-0 space-y-3">
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileUpload}
              className="hidden"
              disabled={isLoading}
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="gap-2"
              title="Attach RFP document"
            >
              <FileUp className="h-4 w-4" />
              <span className="hidden sm:inline">RFP</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowUrlInput(!showUrlInput)}
              disabled={isLoading}
              className="gap-2"
              title="Add URL to crawl"
            >
              <LinkIcon className="h-4 w-4" />
              <span className="hidden sm:inline">URL</span>
            </Button>
          </div>

          <div className="flex gap-2 items-end">
            <textarea
              placeholder="Describe the proposal you need... (Shift+Enter for new line, Enter to send)"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              rows={3}
              className="flex-1 resize-none rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || !inputMessage.trim()}
              size="sm"
              className="gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span className="hidden sm:inline">Send</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
