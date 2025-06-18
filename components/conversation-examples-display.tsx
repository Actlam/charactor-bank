"use client";

import { Badge } from "@/components/ui/badge";
import { MessageCircle, Bot, Sparkles } from "lucide-react";

interface ConversationExample {
  id: string;
  userMessage: string;
  characterResponse: string;
  scenario?: string;
  isHighlighted?: boolean;
}

interface ConversationExamplesDisplayProps {
  examples: ConversationExample[];
  maxDisplay?: number;
  showScenarios?: boolean;
  className?: string;
}

export function ConversationExamplesDisplay({
  examples,
  maxDisplay,
  showScenarios = true,
  className = "",
}: ConversationExamplesDisplayProps) {
  if (!examples || examples.length === 0) {
    return null;
  }

  const displayExamples = maxDisplay ? examples.slice(0, maxDisplay) : examples;
  const hasMore = maxDisplay && examples.length > maxDisplay;

  return (
    <div className={className}>
      <div className="flex items-center gap-2 mb-4">
        <MessageCircle className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">会話例</h3>
        <Badge variant="secondary" className="text-xs">
          {examples.length}個
        </Badge>
      </div>
      
      <div className="space-y-4">
        {displayExamples.map((example, index) => (
          <div 
            key={example.id} 
            className={`relative rounded-lg border bg-card p-4 ${example.isHighlighted ? 'ring-2 ring-primary/30 border-primary/50' : ''}`}
          >
            {example.isHighlighted && (
              <div className="absolute -top-2 -right-2">
                <Badge className="bg-primary text-primary-foreground text-xs px-2 py-1">
                  <Sparkles className="h-3 w-3 mr-1" />
                  おすすめ
                </Badge>
              </div>
            )}
            
            <div>
              {showScenarios && example.scenario && (
                <Badge variant="outline" className="mb-3 text-xs">
                  {example.scenario}
                </Badge>
              )}
              
              <div className="space-y-3">
                {/* User Message */}
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                    <MessageCircle className="h-4 w-4 text-slate-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="bg-slate-50 rounded-lg px-3 py-2">
                      <p className="text-sm text-slate-900">{example.userMessage}</p>
                    </div>
                  </div>
                </div>
                
                {/* Character Response */}
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="bg-primary/5 border border-primary/20 rounded-lg px-3 py-2">
                      <p className="text-sm text-slate-900">{example.characterResponse}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {hasMore && (
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              他に {examples.length - maxDisplay!} 個の会話例があります
            </p>
          </div>
        )}
      </div>
      
      {examples.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-700">
            💡 これらの会話例を参考に、あなただけの会話を楽しんでください！
          </p>
        </div>
      )}
    </div>
  );
}