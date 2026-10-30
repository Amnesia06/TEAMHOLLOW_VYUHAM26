import React from "react";
import { getProficiencyBadgeClass, cn } from "@/lib/utils";
import { Award } from "lucide-react";

interface SkillBadgeProps {
  name: string;
  proficiency?: string;
  hasEvidence?: boolean;
  className?: string;
}

export const SkillBadge: React.FC<SkillBadgeProps> = ({
  name,
  proficiency = "intermediate",
  hasEvidence = false,
  className,
}) => {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium border transition-colors",
        getProficiencyBadgeClass(proficiency),
        className
      )}
    >
      {hasEvidence && <Award className="w-3.5 h-3.5 text-current shrink-0 opacity-80" />}
      <span>{name}</span>
      <span className="text-[10px] opacity-70 uppercase tracking-wider font-semibold">
        ({proficiency})
      </span>
    </span>
  );
};
