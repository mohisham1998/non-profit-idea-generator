import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Sparkles, Shield, Zap, Star } from "lucide-react";
import { templates, TemplateId, TemplateStyle } from "@/lib/templates";

interface TemplateSelectorProps {
  selectedTemplate: TemplateId;
  onSelectTemplate: (templateId: TemplateId) => void;
}

export default function TemplateSelector({
  selectedTemplate,
  onSelectTemplate,
}: TemplateSelectorProps) {
  const getTemplateIcon = (id: TemplateId) => {
    switch (id) {
      case 'classic':
        return <Crown className="h-6 w-6" />;
      case 'modern':
        return <Sparkles className="h-6 w-6" />;
      case 'formal':
        return <Shield className="h-6 w-6" />;
      case 'creative':
        return <Zap className="h-6 w-6" />;
    }
  };

  const renderTemplatePreview = (template: TemplateStyle) => {
    const baseStyle = {
      background: template.previewGradient || template.colors.gradient,
    };

    return (
      <div
        className="h-28 rounded-xl relative overflow-hidden transition-transform duration-300 group-hover:scale-[1.02]"
        style={baseStyle}
      >
        {/* طبقة التأثيرات البصرية */}
        <div className="absolute inset-0 opacity-30">
          {/* القالب الكلاسيكي - زخارف ذهبية */}
          {template.id === 'classic' && (
            <>
              <div className="absolute top-3 left-3 right-3 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
              <div className="absolute top-3 bottom-3 left-3 w-0.5 bg-gradient-to-b from-transparent via-amber-400 to-transparent" />
              <div className="absolute top-3 bottom-3 right-3 w-0.5 bg-gradient-to-b from-transparent via-amber-400 to-transparent" />
              {/* زخرفة الزوايا */}
              <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-amber-400 rounded-tl-sm" />
              <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-amber-400 rounded-tr-sm" />
              <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-amber-400 rounded-bl-sm" />
              <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-amber-400 rounded-br-sm" />
            </>
          )}

          {/* القالب العصري - دوائر متحركة */}
          {template.id === 'modern' && (
            <>
              <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-white/20 blur-sm" />
              <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-white/15 blur-sm" />
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white/10 blur-sm" />
              {/* نقاط صغيرة */}
              <div className="absolute top-4 left-4 w-2 h-2 rounded-full bg-white" />
              <div className="absolute top-4 left-8 w-1.5 h-1.5 rounded-full bg-white/70" />
              <div className="absolute top-4 left-11 w-1 h-1 rounded-full bg-white/50" />
            </>
          )}

          {/* القالب الرسمي - خطوط رسمية */}
          {template.id === 'formal' && (
            <>
              <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500" />
              <div className="absolute top-0 left-0 right-0 h-1 bg-white/20" />
              {/* شعار رسمي */}
              <div className="absolute top-3 right-3 w-8 h-8 rounded-full border-2 border-white/40 flex items-center justify-center">
                <Star className="h-4 w-4 text-white/60" />
              </div>
            </>
          )}

          {/* القالب الإبداعي - أشكال هندسية */}
          {template.id === 'creative' && (
            <>
              <div className="absolute -top-2 -right-2 w-16 h-16 bg-white/20 rotate-45" />
              <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full bg-cyan-400/30" />
              <div className="absolute top-1/2 right-4 w-8 h-8 bg-white/15 rounded-lg rotate-12" />
              {/* نجوم صغيرة */}
              <div className="absolute top-4 left-6 text-white/50">✦</div>
              <div className="absolute bottom-6 right-8 text-white/40">✧</div>
            </>
          )}
        </div>

        {/* أيقونة القالب في المنتصف */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-3 shadow-lg">
            <div className="text-white drop-shadow-md">
              {getTemplateIcon(template.id)}
            </div>
          </div>
        </div>

        {/* علامة الاختيار */}
        {selectedTemplate === template.id && (
          <div className="absolute top-2 left-2 bg-white rounded-full p-1.5 shadow-lg animate-in zoom-in duration-200">
            <Check className="h-4 w-4 text-green-600" />
          </div>
        )}

        {/* تأثير اللمعان عند التحويم */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-md">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-gray-800 text-lg">اختر قالب التصميم</h3>
          <p className="text-sm text-gray-500">حدد النمط المناسب لمؤسستك</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {templates.map((template) => (
          <Card
            key={template.id}
            className={`group cursor-pointer transition-all duration-300 hover:shadow-xl ${
              selectedTemplate === template.id
                ? 'ring-2 ring-green-500 ring-offset-2 shadow-lg shadow-green-100'
                : 'hover:shadow-lg hover:-translate-y-1'
            }`}
            onClick={() => onSelectTemplate(template.id)}
          >
            <CardContent className="p-4">
              {/* معاينة القالب */}
              {renderTemplatePreview(template)}
              
              {/* معلومات القالب */}
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-800">
                    {template.nameAr}
                  </span>
                  {selectedTemplate === template.id && (
                    <Badge className="bg-green-100 text-green-700 border-green-200 text-xs px-2">
                      ✓ مختار
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  {template.description}
                </p>
              </div>
              
              {/* ألوان القالب */}
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                <span className="text-xs text-gray-400">الألوان:</span>
                <div className="flex gap-1.5">
                  <div
                    className="w-5 h-5 rounded-full shadow-sm ring-1 ring-gray-200 transition-transform hover:scale-110"
                    style={{ backgroundColor: template.colors.primary }}
                    title="اللون الرئيسي"
                  />
                  <div
                    className="w-5 h-5 rounded-full shadow-sm ring-1 ring-gray-200 transition-transform hover:scale-110"
                    style={{ backgroundColor: template.colors.secondary }}
                    title="اللون الثانوي"
                  />
                  <div
                    className="w-5 h-5 rounded-full shadow-sm ring-1 ring-gray-200 transition-transform hover:scale-110"
                    style={{ backgroundColor: template.colors.accent }}
                    title="لون التمييز"
                  />
                  <div
                    className="w-5 h-5 rounded-full shadow-sm ring-1 ring-gray-200 transition-transform hover:scale-110"
                    style={{ backgroundColor: template.colors.highlight || template.colors.background }}
                    title="لون الخلفية"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
