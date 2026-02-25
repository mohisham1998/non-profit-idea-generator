import { useState, useEffect, useCallback } from "react";
import { List, ChevronUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface TOCSection {
  id: string;
  title: string;
  icon: LucideIcon;
  color: string;
}

interface SideTableOfContentsProps {
  sections: TOCSection[];
  visible: boolean;
}

export function SideTableOfContents({ sections, visible }: SideTableOfContentsProps) {
  const [activeSection, setActiveSection] = useState<string>("");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // تتبع القسم النشط أثناء التمرير
  const handleScroll = useCallback(() => {
    const scrollY = window.scrollY;
    setShowScrollTop(scrollY > 400);

    let currentSection = "";
    for (const section of sections) {
      const element = document.getElementById(section.id);
      if (element) {
        const rect = element.getBoundingClientRect();
        // القسم يكون نشطاً إذا كان أعلاه قريباً من أعلى الشاشة
        if (rect.top <= 200) {
          currentSection = section.id;
        }
      }
    }
    setActiveSection(currentSection);
  }, [sections]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // تشغيل أولي
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100; // مسافة من الأعلى
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - offset,
        behavior: "smooth",
      });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!visible) return null;

  return (
    <div className="fixed left-6 top-1/2 -translate-y-1/2 z-40 hidden xl:block">
      <div className="relative">
        {/* زر طي/فتح الفهرس */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -top-10 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center hover:bg-indigo-50 hover:border-indigo-300 transition-all duration-200 group"
          title={isCollapsed ? "فتح الفهرس" : "طي الفهرس"}
        >
          <List className="h-4 w-4 text-gray-500 group-hover:text-indigo-600 transition-colors" />
        </button>

        {/* الفهرس الجانبي */}
        <div
          className={`bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100 overflow-hidden transition-all duration-300 ${
            isCollapsed ? "w-12 p-2" : "w-56 p-4"
          }`}
        >
          {/* العنوان */}
          {!isCollapsed && (
            <div className="mb-3 pb-3 border-b border-gray-100">
              <h3 className="text-xs font-bold text-gray-500 tracking-wide">فهرس المحتوى</h3>
            </div>
          )}

          {/* قائمة الأقسام */}
          <div className="space-y-1">
            {sections.map((section, index) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;

              return (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={`w-full flex items-center gap-2.5 rounded-xl transition-all duration-200 group ${
                    isCollapsed ? "p-1.5 justify-center" : "px-3 py-2 text-right"
                  } ${
                    isActive
                      ? "bg-gradient-to-l from-indigo-50 to-purple-50 shadow-sm"
                      : "hover:bg-gray-50"
                  }`}
                  title={isCollapsed ? section.title : undefined}
                >
                  {/* أيقونة القسم */}
                  <div
                    className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 ${
                      isActive
                        ? `bg-gradient-to-br ${section.color} shadow-sm`
                        : "bg-gray-100 group-hover:bg-gray-200"
                    }`}
                  >
                    <Icon
                      className={`h-3.5 w-3.5 transition-colors ${
                        isActive ? "text-white" : "text-gray-400 group-hover:text-gray-600"
                      }`}
                    />
                  </div>

                  {/* عنوان القسم */}
                  {!isCollapsed && (
                    <div className="flex-1 min-w-0">
                      <span
                        className={`text-xs font-medium block truncate transition-colors ${
                          isActive ? "text-indigo-700" : "text-gray-600 group-hover:text-gray-800"
                        }`}
                      >
                        {section.title}
                      </span>
                    </div>
                  )}

                  {/* مؤشر القسم النشط */}
                  {!isCollapsed && isActive && (
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0"></div>
                  )}
                </button>
              );
            })}
          </div>

          {/* خط فاصل */}
          <div className={`border-t border-gray-100 ${isCollapsed ? "my-2" : "my-3"}`}></div>

          {/* زر العودة للأعلى */}
          {showScrollTop && (
            <button
              onClick={scrollToTop}
              className={`w-full flex items-center gap-2 rounded-xl transition-all duration-200 hover:bg-indigo-50 group ${
                isCollapsed ? "p-1.5 justify-center" : "px-3 py-2"
              }`}
              title="العودة للأعلى"
            >
              <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                <ChevronUp className="h-3.5 w-3.5 text-indigo-500" />
              </div>
              {!isCollapsed && (
                <span className="text-xs font-medium text-indigo-600">العودة للأعلى</span>
              )}
            </button>
          )}
        </div>

        {/* شريط التقدم العمودي */}
        {!isCollapsed && (
          <div className="absolute -right-3 top-12 bottom-12 w-0.5 bg-gray-100 rounded-full">
            <div
              className="w-full bg-gradient-to-b from-indigo-400 to-purple-500 rounded-full transition-all duration-300"
              style={{
                height: `${
                  sections.length > 0
                    ? ((sections.findIndex((s) => s.id === activeSection) + 1) / sections.length) * 100
                    : 0
                }%`,
              }}
            ></div>
          </div>
        )}
      </div>
    </div>
  );
}
