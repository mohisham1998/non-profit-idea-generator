import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Lightbulb,
  Target,
  FileText,
  Star,
  Zap,
  Package,
  TrendingUp,
  Award,
  Gauge,
  DollarSign,
  Grid3X3,
  Table2,
  Calendar,
  FolderKanban,
  ChevronRight,
  ChevronLeft,
  Eye,
  Crosshair,
  ListChecks,
  AlertTriangle,
  Crown
} from "lucide-react";

interface SidebarProps {
  activeSection?: string;
  onSectionClick: (sectionId: string) => void;
  hasIdea: boolean;
  hasEvaluation?: boolean;
  hasKPIs?: boolean;
  hasBudget?: boolean;
  hasSWOT?: boolean;
  hasLogFrame?: boolean;
  hasTimeline?: boolean;
  hasPMDPro?: boolean;
  hasDesignThinking?: boolean;
}

const sections = [
  { id: "proposedNames", label: "الأسماء المقترحة", icon: Crown, color: "text-amber-500" },
  { id: "vision", label: "الرؤية", icon: Eye, color: "text-blue-500" },
  { id: "generalObjective", label: "الهدف العام", icon: Target, color: "text-green-500" },
  { id: "detailedObjectives", label: "الأهداف التفصيلية", icon: Crosshair, color: "text-teal-500" },
  { id: "idea", label: "فكرة البرنامج", icon: Lightbulb, color: "text-yellow-500" },
  { id: "justifications", label: "المبررات", icon: FileText, color: "text-purple-500" },
  { id: "features", label: "المميزات", icon: Star, color: "text-yellow-600" },
  { id: "strengths", label: "نقاط القوة", icon: Zap, color: "text-green-600" },
  { id: "outputs", label: "المخرجات", icon: Package, color: "text-indigo-500" },
  { id: "expectedResults", label: "النتائج المتوقعة", icon: TrendingUp, color: "text-teal-600" },
  { id: "risks", label: "المخاطر", icon: AlertTriangle, color: "text-red-500" },
];

const additionalSections = [
  { id: "evaluation", label: "التقييم", icon: Award, color: "text-amber-500" },
  { id: "kpis", label: "مؤشرات الأداء", icon: Gauge, color: "text-blue-500" },
  { id: "budget", label: "الميزانية", icon: DollarSign, color: "text-green-500" },
  { id: "swot", label: "تحليل SWOT", icon: Grid3X3, color: "text-purple-500" },
  { id: "logframe", label: "الإطار المنطقي", icon: Table2, color: "text-indigo-500" },
  { id: "timeline", label: "الجدول الزمني", icon: Calendar, color: "text-teal-500" },
  { id: "pmdpro", label: "PMDPro", icon: FolderKanban, color: "text-pink-500" },
  { id: "designThinking", label: "التفكير التصميمي", icon: ListChecks, color: "text-rose-500" },
];

export default function Sidebar({
  activeSection,
  onSectionClick,
  hasIdea,
  hasEvaluation,
  hasKPIs,
  hasBudget,
  hasSWOT,
  hasLogFrame,
  hasTimeline,
  hasPMDPro,
  hasDesignThinking,
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsCollapsed(true);
      }
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (!hasIdea) return null;

  const availableAdditionalSections = additionalSections.filter((section) => {
    switch (section.id) {
      case "evaluation": return hasEvaluation;
      case "kpis": return hasKPIs;
      case "budget": return hasBudget;
      case "swot": return hasSWOT;
      case "logframe": return hasLogFrame;
      case "timeline": return hasTimeline;
      case "pmdpro": return hasPMDPro;
      case "designThinking": return hasDesignThinking;
      default: return false;
    }
  });

  return (
    <div
      className={`fixed right-0 top-20 z-40 h-[calc(100vh-5rem)] transition-all duration-300 ${
        isCollapsed ? "w-12" : "w-56"
      }`}
    >
      <div className="h-full bg-background/95 backdrop-blur-md border-l border-border shadow-lg rounded-l-xl overflow-hidden flex flex-col">
        {/* Toggle Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -left-3 top-4 z-50 h-6 w-6 rounded-full bg-primary text-white shadow-md hover:bg-primary/90 p-0"
        >
          {isCollapsed ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>

        {/* Header */}
        {!isCollapsed && (
          <div className="p-3 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">التنقل السريع</h3>
          </div>
        )}

        {/* Sections */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {/* Main Sections */}
          <div className="space-y-1">
            {!isCollapsed && (
              <p className="text-xs text-muted-foreground px-2 py-1">الأقسام الرئيسية</p>
            )}
            {sections.map((section) => (
              <Button
                key={section.id}
                variant={activeSection === section.id ? "default" : "ghost"}
                size="sm"
                onClick={() => onSectionClick(section.id)}
                className={`w-full justify-start gap-2 ${
                  isCollapsed ? "px-2" : "px-3"
                } ${activeSection === section.id ? "" : "hover:bg-accent"}`}
                title={isCollapsed ? section.label : undefined}
              >
                <section.icon className={`h-4 w-4 ${section.color} flex-shrink-0`} />
                {!isCollapsed && (
                  <span className="truncate text-xs">{section.label}</span>
                )}
              </Button>
            ))}
          </div>

          {/* Additional Sections */}
          {availableAdditionalSections.length > 0 && (
            <div className="space-y-1 pt-2 border-t border-border mt-2">
              {!isCollapsed && (
                <p className="text-xs text-muted-foreground px-2 py-1">الإضافات</p>
              )}
              {availableAdditionalSections.map((section) => (
                <Button
                  key={section.id}
                  variant={activeSection === section.id ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onSectionClick(section.id)}
                  className={`w-full justify-start gap-2 ${
                    isCollapsed ? "px-2" : "px-3"
                  } ${activeSection === section.id ? "" : "hover:bg-accent"}`}
                  title={isCollapsed ? section.label : undefined}
                >
                  <section.icon className={`h-4 w-4 ${section.color} flex-shrink-0`} />
                  {!isCollapsed && (
                    <span className="truncate text-xs">{section.label}</span>
                  )}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
