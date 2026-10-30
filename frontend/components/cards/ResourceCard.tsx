import React from "react";
import { LearningResource } from "@/lib/types";
import { ExternalLink, Clock, Tag, BookOpen, Video, Code, Terminal } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/utils";

interface ResourceCardProps {
  resource: LearningResource;
}

export const ResourceCard: React.FC<ResourceCardProps> = ({ resource }) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="w-4 h-4 text-purple-600" />;
      case "project":
        return <Code className="w-4 h-4 text-emerald-600" />;
      case "interactive":
        return <Terminal className="w-4 h-4 text-blue-600" />;
      default:
        return <BookOpen className="w-4 h-4 text-primary" />;
    }
  };

  return (
    <Card hoverEffect className="flex flex-col justify-between h-full bg-surface">
      <div>
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-gray-50 border border-border">
              {getTypeIcon(resource.type)}
            </span>
            <span className="text-xs font-semibold text-text-muted">{resource.provider}</span>
          </div>
          <Badge
            variant={resource.cost === 0 ? "success" : "neutral"}
            size="sm"
          >
            {formatCurrency(resource.cost, resource.currency)}
          </Badge>
        </div>

        <h3 className="font-semibold text-sm text-text line-clamp-2 mb-2 hover:text-primary transition-colors">
          <a href={resource.url} target="_blank" rel="noopener noreferrer">
            {resource.title}
          </a>
        </h3>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {resource.skills.slice(0, 3).map((s) => (
            <span
              key={s}
              className="text-[11px] px-2 py-0.5 rounded-md bg-gray-100 text-text-muted font-medium"
            >
              {s}
            </span>
          ))}
        </div>
      </div>

      <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-text-muted">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          <span>{resource.estimated_hours} hours</span>
        </div>

        <a
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-primary hover:text-primary-hover font-medium transition-colors"
        >
          <span>Access</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </Card>
  );
};
