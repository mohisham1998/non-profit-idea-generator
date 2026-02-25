import { useState, useMemo } from "react";
import { Calendar, ChevronLeft, ChevronRight, Info } from "lucide-react";

interface Activity {
  name: string;
  description: string;
  responsible: string;
  deliverables: string;
  dependencies?: string;
}

interface Phase {
  name: string;
  duration: string;
  startWeek: number;
  endWeek: number;
  activities: Activity[];
}

interface Milestone {
  name: string;
  week: number;
  description: string;
}

interface TimelineData {
  phases: Phase[];
  milestones: Milestone[];
  totalDuration: string;
  criticalPath: string;
  summary: string;
}

interface GanttChartProps {
  data: TimelineData;
}

// ألوان المراحل
const phaseColors = [
  { bg: "bg-blue-500", light: "bg-blue-100", text: "text-blue-800", border: "border-blue-300" },
  { bg: "bg-emerald-500", light: "bg-emerald-100", text: "text-emerald-800", border: "border-emerald-300" },
  { bg: "bg-purple-500", light: "bg-purple-100", text: "text-purple-800", border: "border-purple-300" },
  { bg: "bg-orange-500", light: "bg-orange-100", text: "text-orange-800", border: "border-orange-300" },
  { bg: "bg-pink-500", light: "bg-pink-100", text: "text-pink-800", border: "border-pink-300" },
  { bg: "bg-cyan-500", light: "bg-cyan-100", text: "text-cyan-800", border: "border-cyan-300" },
  { bg: "bg-red-500", light: "bg-red-100", text: "text-red-800", border: "border-red-300" },
  { bg: "bg-indigo-500", light: "bg-indigo-100", text: "text-indigo-800", border: "border-indigo-300" },
];

export default function GanttChart({ data }: GanttChartProps) {
  const [hoveredItem, setHoveredItem] = useState<{ type: string; index: number; activityIndex?: number } | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [scrollOffset, setScrollOffset] = useState(0);

  // حساب إجمالي الأسابيع
  const totalWeeks = useMemo(() => {
    if (!data.phases || data.phases.length === 0) return 12;
    const maxWeek = Math.max(...data.phases.map(p => p.endWeek || 0));
    return Math.max(maxWeek, 12);
  }, [data.phases]);

  // عدد الأسابيع المرئية
  const visibleWeeks = 12;
  const maxScroll = Math.max(0, totalWeeks - visibleWeeks);

  // أرقام الأسابيع المرئية
  const visibleWeekNumbers = useMemo(() => {
    const weeks = [];
    for (let i = scrollOffset; i < Math.min(scrollOffset + visibleWeeks, totalWeeks); i++) {
      weeks.push(i + 1);
    }
    return weeks;
  }, [scrollOffset, totalWeeks]);

  // حساب عرض ونقطة بداية الشريط
  const calculateBarStyle = (startWeek: number, endWeek: number) => {
    const adjustedStart = startWeek - 1 - scrollOffset;
    const adjustedEnd = endWeek - scrollOffset;
    
    const left = Math.max(0, (adjustedStart / visibleWeeks) * 100);
    const right = Math.min(100, (adjustedEnd / visibleWeeks) * 100);
    const width = right - left;
    
    // إخفاء إذا كان خارج النطاق المرئي
    if (adjustedEnd <= 0 || adjustedStart >= visibleWeeks) {
      return { display: 'none' };
    }
    
    return {
      right: `${left}%`,
      width: `${width}%`,
    };
  };

  // حساب موقع المعلم
  const calculateMilestonePosition = (week: number) => {
    const adjustedWeek = week - scrollOffset - 0.5;
    if (adjustedWeek < 0 || adjustedWeek >= visibleWeeks) {
      return { display: 'none' };
    }
    return {
      right: `${(adjustedWeek / visibleWeeks) * 100}%`,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    setTooltipPosition({ x: e.clientX, y: e.clientY });
  };

  const scrollLeft = () => {
    setScrollOffset(Math.max(0, scrollOffset - 4));
  };

  const scrollRight = () => {
    setScrollOffset(Math.min(maxScroll, scrollOffset + 4));
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-l from-indigo-600 to-blue-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            <h3 className="font-semibold">مخطط جانت التفاعلي</h3>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="bg-white/20 rounded px-2 py-1">
              {data.totalDuration}
            </span>
          </div>
        </div>
      </div>

      {/* أزرار التمرير */}
      {totalWeeks > visibleWeeks && (
        <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b">
          <Button
            onClick={scrollRight}
            disabled={scrollOffset >= maxScroll}
            className="p-1 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
          <span className="text-sm text-gray-600">
            الأسابيع {scrollOffset + 1} - {Math.min(scrollOffset + visibleWeeks, totalWeeks)} من {totalWeeks}
          </span>
          <Button
            onClick={scrollLeft}
            disabled={scrollOffset <= 0}
            className="p-1 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </div>
      )}

      {/* المخطط */}
      <div className="p-4" onMouseMove={handleMouseMove}>
        {/* مقياس الأسابيع */}
        <div className="flex mb-4 mr-40">
          <div className="flex-1 flex border-b border-gray-300">
            {visibleWeekNumbers.map((week) => (
              <div
                key={week}
                className="flex-1 text-center text-xs text-gray-600 pb-2 border-l border-gray-200 last:border-l-0"
              >
                أسبوع {week}
              </div>
            ))}
          </div>
        </div>

        {/* المراحل والأنشطة */}
        <div className="space-y-3">
          {data.phases?.map((phase, phaseIndex) => {
            const color = phaseColors[phaseIndex % phaseColors.length];
            return (
              <div key={phaseIndex} className="space-y-2">
                {/* شريط المرحلة */}
                <div className="flex items-center group">
                  <div className="w-40 pl-3 flex-shrink-0">
                    <div className={`text-sm font-semibold ${color.text} truncate`} title={phase.name}>
                      {phase.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      أسبوع {phase.startWeek} - {phase.endWeek}
                    </div>
                  </div>
                  <div className="flex-1 relative h-8">
                    {/* خطوط الشبكة */}
                    <div className="absolute inset-0 flex">
                      {visibleWeekNumbers.map((_, i) => (
                        <div key={i} className="flex-1 border-l border-gray-100 last:border-l-0" />
                      ))}
                    </div>
                    {/* شريط المرحلة */}
                    <div
                      className={`absolute top-1 h-6 ${color.bg} rounded-md shadow-sm cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-y-110`}
                      style={calculateBarStyle(phase.startWeek, phase.endWeek)}
                      onMouseEnter={() => setHoveredItem({ type: 'phase', index: phaseIndex })}
                      onMouseLeave={() => setHoveredItem(null)}
                    >
                      <div className="h-full flex items-center justify-center text-white text-xs font-medium px-2 truncate">
                        {phase.duration}
                      </div>
                    </div>
                  </div>
                </div>

                {/* الأنشطة */}
                {phase.activities?.map((activity, activityIndex) => (
                  <div key={activityIndex} className="flex items-center mr-4">
                    <div className="w-36 pl-3 flex-shrink-0">
                      <div className="text-xs text-gray-700 truncate flex items-center gap-1" title={activity.name}>
                        <span className={`w-2 h-2 rounded-full ${color.bg}`} />
                        {activity.name}
                      </div>
                    </div>
                    <div className="flex-1 relative h-6">
                      {/* خطوط الشبكة */}
                      <div className="absolute inset-0 flex">
                        {visibleWeekNumbers.map((_, i) => (
                          <div key={i} className="flex-1 border-l border-gray-50 last:border-l-0" />
                        ))}
                      </div>
                      {/* شريط النشاط (يأخذ نفس مدة المرحلة الأم) */}
                      <div
                        className={`absolute top-1 h-4 ${color.light} ${color.border} border rounded cursor-pointer transition-all duration-200 hover:shadow-sm`}
                        style={calculateBarStyle(phase.startWeek, phase.endWeek)}
                        onMouseEnter={() => setHoveredItem({ type: 'activity', index: phaseIndex, activityIndex })}
                        onMouseLeave={() => setHoveredItem(null)}
                      >
                        <div className={`h-full flex items-center px-2 text-xs ${color.text} truncate`}>
                          {activity.responsible}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>

        {/* المعالم الرئيسية */}
        {data.milestones && data.milestones.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center mb-3">
              <div className="w-40 pl-3 flex-shrink-0">
                <div className="text-sm font-semibold text-amber-700">المعالم الرئيسية</div>
              </div>
              <div className="flex-1 relative h-8">
                {/* خطوط الشبكة */}
                <div className="absolute inset-0 flex">
                  {visibleWeekNumbers.map((_, i) => (
                    <div key={i} className="flex-1 border-l border-gray-100 last:border-l-0" />
                  ))}
                </div>
                {/* المعالم */}
                {data.milestones.map((milestone, idx) => (
                  <div
                    key={idx}
                    className="absolute top-0 transform translate-x-1/2 cursor-pointer"
                    style={calculateMilestonePosition(milestone.week)}
                    onMouseEnter={() => setHoveredItem({ type: 'milestone', index: idx })}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    <div className="w-6 h-6 bg-amber-500 rotate-45 rounded-sm shadow-md hover:scale-110 transition-transform" />
                    <div className="absolute top-8 right-1/2 transform translate-x-1/2 text-xs text-amber-700 whitespace-nowrap">
                      أ{milestone.week}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tooltip */}
      {hoveredItem && (
        <div
          className="fixed z-50 bg-gray-900 text-white rounded-lg shadow-xl p-3 max-w-xs pointer-events-none"
          style={{
            left: tooltipPosition.x + 10,
            top: tooltipPosition.y + 10,
          }}
        >
          {hoveredItem.type === 'phase' && data.phases[hoveredItem.index] && (
            <div>
              <div className="font-semibold mb-1">{data.phases[hoveredItem.index].name}</div>
              <div className="text-xs text-gray-300 space-y-1">
                <div>المدة: {data.phases[hoveredItem.index].duration}</div>
                <div>الأسبوع: {data.phases[hoveredItem.index].startWeek} - {data.phases[hoveredItem.index].endWeek}</div>
                <div>عدد الأنشطة: {data.phases[hoveredItem.index].activities?.length || 0}</div>
              </div>
            </div>
          )}
          {hoveredItem.type === 'activity' && data.phases[hoveredItem.index]?.activities[hoveredItem.activityIndex!] && (
            <div>
              <div className="font-semibold mb-1">
                {data.phases[hoveredItem.index].activities[hoveredItem.activityIndex!].name}
              </div>
              <div className="text-xs text-gray-300 space-y-1">
                <div>{data.phases[hoveredItem.index].activities[hoveredItem.activityIndex!].description}</div>
                <div className="flex items-center gap-1">
                  <span className="text-gray-400">المسؤول:</span>
                  {data.phases[hoveredItem.index].activities[hoveredItem.activityIndex!].responsible}
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-gray-400">المخرجات:</span>
                  {data.phases[hoveredItem.index].activities[hoveredItem.activityIndex!].deliverables}
                </div>
                {data.phases[hoveredItem.index].activities[hoveredItem.activityIndex!].dependencies && (
                  <div className="flex items-center gap-1">
                    <span className="text-gray-400">يعتمد على:</span>
                    {data.phases[hoveredItem.index].activities[hoveredItem.activityIndex!].dependencies}
                  </div>
                )}
              </div>
            </div>
          )}
          {hoveredItem.type === 'milestone' && data.milestones[hoveredItem.index] && (
            <div>
              <div className="font-semibold mb-1 flex items-center gap-2">
                <div className="w-3 h-3 bg-amber-500 rotate-45 rounded-sm" />
                {data.milestones[hoveredItem.index].name}
              </div>
              <div className="text-xs text-gray-300 space-y-1">
                <div>الأسبوع: {data.milestones[hoveredItem.index].week}</div>
                <div>{data.milestones[hoveredItem.index].description}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600">مرر الماوس على العناصر لعرض التفاصيل</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-3 bg-blue-500 rounded" />
            <span className="text-gray-600">مرحلة</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-3 bg-blue-100 border border-blue-300 rounded" />
            <span className="text-gray-600">نشاط</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-amber-500 rotate-45 rounded-sm" />
            <span className="text-gray-600">معلم رئيسي</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// زر مساعد
function Button({ children, onClick, disabled, className }: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={className}
    >
      {children}
    </button>
  );
}
