import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronRight,
  ChevronLeft,
  Download,
  FileText,
  FileSpreadsheet,
  Presentation,
  X,
  Building2,
  Target,
  Users,
  DollarSign,
  TrendingUp,
  Handshake,
  Calendar,
  Mail,
  Loader2,
} from "lucide-react";
import { TemplateId, getTemplate, TemplateStyle } from "@/lib/templates";
import TemplateSelector from "@/components/TemplateSelector";

interface OrganizationInfo {
  logo?: string | null;
  name?: string | null;
}

interface PreviewData {
  approvedSections: Set<string>;
  marketingContent: any;
  ideaData: any;
  organizationInfo?: OrganizationInfo;
}

interface FilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  format: 'word' | 'pdf' | 'ppt';
  previewData: PreviewData;
  onExport: (templateId: TemplateId) => void;
  isExporting: boolean;
  selectedTemplate?: TemplateId;
  onTemplateChange?: (templateId: TemplateId) => void;
}

export default function FilePreviewModal({
  isOpen,
  onClose,
  format,
  previewData,
  onExport,
  isExporting,
  selectedTemplate = 'classic',
  onTemplateChange,
}: FilePreviewModalProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [localTemplate, setLocalTemplate] = useState<TemplateId>(selectedTemplate);
  const { approvedSections, marketingContent, ideaData, organizationInfo } = previewData;
  
  // الحصول على بيانات القالب الحالي
  const template = getTemplate(localTemplate);
  
  const handleTemplateChange = (templateId: TemplateId) => {
    setLocalTemplate(templateId);
    onTemplateChange?.(templateId);
  };

  const programName = ideaData?.programDescription?.slice(0, 60) || 'البرنامج';
  const orgName = organizationInfo?.name || '';
  const logoUrl = organizationInfo?.logo;

  // إنشاء الصفحات/الشرائح بناءً على الأقسام المعتمدة
  const pages = [];
  
  // الصفحة الأولى - العنوان
  pages.push({
    type: 'title',
    title: programName,
    subtitle: 'مقترح تمويل للجهات المانحة والداعمة',
  });

  // صفحة الملخص
  if (approvedSections.has('summary')) {
    pages.push({
      type: 'content',
      title: 'ملخص البرنامج التنفيذي',
      icon: Target,
      content: marketingContent?.summary || ideaData?.programDescription || '',
    });
  }

  // صفحة الأثر
  if (approvedSections.has('impact')) {
    pages.push({
      type: 'content',
      title: 'الأثر المتوقع والنتائج',
      icon: TrendingUp,
      content: marketingContent?.impact || ideaData?.expectedResults || '',
    });
  }

  // صفحة الميزانية
  if (approvedSections.has('budget')) {
    pages.push({
      type: 'content',
      title: 'الميزانية والتمويل المطلوب',
      icon: DollarSign,
      content: marketingContent?.budget || '',
    });
  }

  // صفحة الشراكات
  if (approvedSections.has('partnerships')) {
    pages.push({
      type: 'content',
      title: 'فرص الشراكة',
      icon: Handshake,
      content: marketingContent?.partnerships || '',
    });
  }

  // صفحة الجدول الزمني
  if (approvedSections.has('timeline')) {
    pages.push({
      type: 'content',
      title: 'الجدول الزمني للتنفيذ',
      icon: Calendar,
      content: marketingContent?.timeline || ideaData?.duration || '',
    });
  }

  // صفحة التواصل
  if (approvedSections.has('contact')) {
    pages.push({
      type: 'content',
      title: 'معلومات التواصل',
      icon: Mail,
      content: marketingContent?.contact || '',
    });
  }

  const totalPages = pages.length;
  const currentPageData = pages[currentPage];

  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const getFormatIcon = () => {
    switch (format) {
      case 'word':
        return <FileText className="h-5 w-5 text-blue-600" />;
      case 'pdf':
        return <FileSpreadsheet className="h-5 w-5 text-red-600" />;
      case 'ppt':
        return <Presentation className="h-5 w-5 text-orange-600" />;
    }
  };

  const getFormatName = () => {
    switch (format) {
      case 'word':
        return 'Word';
      case 'pdf':
        return 'PDF';
      case 'ppt':
        return 'PowerPoint';
    }
  };

  const getFormatColor = () => {
    switch (format) {
      case 'word':
        return 'bg-blue-500';
      case 'pdf':
        return 'bg-red-500';
      case 'ppt':
        return 'bg-orange-500';
    }
  };

  // الحصول على أنماط القالب
  const getTitlePageStyle = () => {
    const baseStyle = "relative h-full flex flex-col items-center justify-center p-8 overflow-hidden";
    switch (localTemplate) {
      case 'classic':
        return `${baseStyle} bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900`;
      case 'modern':
        return `${baseStyle} bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500`;
      case 'formal':
        return `${baseStyle} bg-gradient-to-br from-emerald-900 via-green-800 to-teal-900`;
      case 'creative':
        return `${baseStyle} bg-gradient-to-br from-pink-600 via-rose-500 to-orange-400`;
      default:
        return `${baseStyle} bg-gradient-to-br from-green-600 to-green-800`;
    }
  };

  const getAccentColor = () => {
    switch (localTemplate) {
      case 'classic': return 'text-amber-400';
      case 'modern': return 'text-yellow-300';
      case 'formal': return 'text-amber-500';
      case 'creative': return 'text-cyan-300';
      default: return 'text-green-400';
    }
  };

  const getAccentBgColor = () => {
    switch (localTemplate) {
      case 'classic': return 'bg-amber-400';
      case 'modern': return 'bg-yellow-300';
      case 'formal': return 'bg-amber-500';
      case 'creative': return 'bg-cyan-300';
      default: return 'bg-green-400';
    }
  };

  const renderTitlePage = () => (
    <div className={getTitlePageStyle()}>
      {/* زخارف القالب المحسنة */}
      {localTemplate === 'creative' && (
        <>
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 blur-sm" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-cyan-400/20 blur-sm" />
          <div className="absolute top-1/4 left-4 w-12 h-12 rounded-full bg-cyan-300/30" />
          <div className="absolute bottom-1/4 right-8 w-8 h-8 bg-white/20 rotate-45" />
          <div className="absolute top-8 right-1/4 text-white/30 text-2xl">✦</div>
          <div className="absolute bottom-12 left-1/4 text-white/20 text-xl">✧</div>
        </>
      )}
      {localTemplate === 'modern' && (
        <>
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/15 blur-sm" />
          <div className="absolute -bottom-12 -left-12 w-40 h-40 rounded-full bg-white/10 blur-sm" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-white/5 blur-md" />
          <div className="absolute top-6 left-6 flex gap-2">
            <div className="w-3 h-3 rounded-full bg-white/50" />
            <div className="w-3 h-3 rounded-full bg-white/40" />
            <div className="w-3 h-3 rounded-full bg-white/30" />
          </div>
        </>
      )}
      {localTemplate === 'classic' && (
        <>
          <div className="absolute top-4 left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />
          <div className="absolute top-4 bottom-4 left-4 w-0.5 bg-gradient-to-b from-transparent via-amber-400/40 to-transparent" />
          <div className="absolute top-4 bottom-4 right-4 w-0.5 bg-gradient-to-b from-transparent via-amber-400/40 to-transparent" />
          <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-amber-400/50 rounded-tl-sm" />
          <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-amber-400/50 rounded-tr-sm" />
          <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-amber-400/50 rounded-bl-sm" />
          <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-amber-400/50 rounded-br-sm" />
        </>
      )}
      {localTemplate === 'formal' && (
        <>
          <div className="absolute bottom-0 left-0 right-0 h-3 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500" />
          <div className="absolute top-0 left-0 right-0 h-1 bg-white/20" />
          <div className="absolute top-4 right-4 w-12 h-12 rounded-full border-2 border-white/30 flex items-center justify-center">
            <div className="w-6 h-6 rounded-full border border-white/20" />
          </div>
        </>
      )}
      
      {/* الشعار */}
      {logoUrl && (
        <div className="mb-6 relative z-10">
          <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl shadow-lg">
            <img 
              src={logoUrl} 
              alt="شعار المؤسسة" 
              className="h-16 w-16 object-contain rounded-lg"
            />
          </div>
        </div>
      )}
      
      {/* اسم المؤسسة */}
      {orgName && (
        <p className={`text-lg font-bold mb-4 text-white/90 relative z-10 tracking-wide`}>
          {orgName}
        </p>
      )}
      
      {/* العنوان الرئيسي */}
      <h1 className="text-2xl md:text-3xl font-bold text-center mb-4 text-white relative z-10 drop-shadow-lg">
        {currentPageData.title}
      </h1>
      
      {/* العنوان الفرعي */}
      <p className={`text-lg text-center ${getAccentColor()} relative z-10`}>
        {currentPageData.subtitle}
      </p>
      
      {/* زخرفة سفلية */}
      <div className={`absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-2`}>
        <div className={`w-8 h-1 rounded-full ${getAccentBgColor()} opacity-40`} />
        <div className={`w-16 h-1.5 rounded-full ${getAccentBgColor()} opacity-70`} />
        <div className={`w-8 h-1 rounded-full ${getAccentBgColor()} opacity-40`} />
      </div>
    </div>
  );

  // الحصول على أنماط صفحة المحتوى بناءً على القالب
  const getContentPageStyle = () => {
    switch (localTemplate) {
      case 'classic': return 'bg-gradient-to-br from-stone-50 via-amber-50/20 to-stone-100';
      case 'modern': return 'bg-gradient-to-br from-white via-indigo-50/20 to-purple-50/20';
      case 'formal': return 'bg-gradient-to-br from-white via-emerald-50/10 to-teal-50/10';
      case 'creative': return 'bg-gradient-to-br from-pink-50/50 via-orange-50/30 to-amber-50/50';
      default: return 'bg-white';
    }
  };

  const getIconBgColor = () => {
    switch (localTemplate) {
      case 'classic': return 'bg-gradient-to-br from-slate-100 to-amber-100';
      case 'modern': return 'bg-gradient-to-br from-indigo-100 to-purple-100';
      case 'formal': return 'bg-gradient-to-br from-emerald-100 to-teal-100';
      case 'creative': return 'bg-gradient-to-br from-pink-100 to-orange-100';
      default: return 'bg-green-100';
    }
  };

  const getIconColor = () => {
    switch (localTemplate) {
      case 'classic': return 'text-slate-700';
      case 'modern': return 'text-indigo-600';
      case 'formal': return 'text-green-700';
      case 'creative': return 'text-pink-600';
      default: return 'text-green-600';
    }
  };

  const getBadgeStyle = () => {
    switch (localTemplate) {
      case 'classic': return 'text-slate-600 border-slate-300';
      case 'modern': return 'text-indigo-600 border-indigo-300';
      case 'formal': return 'text-green-700 border-green-400';
      case 'creative': return 'text-pink-600 border-pink-300';
      default: return 'text-green-600 border-green-300';
    }
  };

  const renderContentPage = () => {
    const IconComponent = currentPageData.icon as React.ComponentType<{ className?: string }> | undefined;
    
    return (
      <div className={`h-full flex flex-col p-6 ${getContentPageStyle()}`}>
        {/* الهيدر */}
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
          {/* الشعار الصغير */}
          {logoUrl && (
            <img 
              src={logoUrl} 
              alt="شعار" 
              className="h-8 w-8 object-contain rounded"
            />
          )}
          <div className="flex-1">
            {orgName && (
              <p className="text-xs text-gray-500">{orgName}</p>
            )}
            <p className="text-xs text-gray-400">{programName}</p>
          </div>
          <Badge variant="outline" className={getBadgeStyle()}>
            {currentPage} / {totalPages - 1}
          </Badge>
        </div>
        
        {/* عنوان القسم */}
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-2 rounded-lg ${getIconBgColor()}`}>
            {IconComponent && <IconComponent className={`h-6 w-6 ${getIconColor()}`} />}
          </div>
          <h2 className="text-xl font-bold text-gray-800">{currentPageData.title}</h2>
        </div>
        
        {/* المحتوى */}
        <div className="flex-1 overflow-y-auto">
          <div className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm">
            {currentPageData.content || 'لا يوجد محتوى متاح لهذا القسم.'}
          </div>
        </div>
        
        {/* الفوتر */}
        {format === 'ppt' && (
          <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
            <div className={`w-16 h-1 rounded-full ${getAccentBgColor()}`} />
            <span className="text-xs text-gray-400">مقترح تمويل</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
        {/* الهيدر */}
        <DialogHeader className="px-6 py-4 border-b bg-gradient-to-l from-gray-50 to-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getFormatIcon()}
              <div>
                <DialogTitle className="text-lg">معاينة ملف {getFormatName()}</DialogTitle>
                <DialogDescription className="text-sm">
                  معاينة شكل الملف قبل التصدير
                </DialogDescription>
              </div>
            </div>
            <Badge className={`${getFormatColor()} text-white`}>
              {totalPages} صفحات
            </Badge>
          </div>
        </DialogHeader>

        {/* منطقة المعاينة واختيار القالب */}
        <div className="flex-1 bg-gray-100 p-4 md:p-6 overflow-hidden flex gap-4">
          {/* قسم اختيار القالب */}
          <div className="w-64 bg-white rounded-lg p-4 shadow-lg overflow-y-auto hidden md:block">
            <TemplateSelector
              selectedTemplate={localTemplate}
              onSelectTemplate={handleTemplateChange}
            />
          </div>
          
          {/* منطقة المعاينة */}
          <div className="flex-1 flex items-center justify-center">
            <div className={`shadow-2xl rounded-lg overflow-hidden transition-all duration-300 ${
              format === 'ppt' 
                ? 'aspect-video w-full max-w-2xl' 
                : 'aspect-[3/4] h-full max-h-full w-auto'
            }`}>
              {/* إطار الملف */}
              <div className={`h-full w-full ${format === 'word' ? 'border-4 border-gray-300' : ''}`}>
                {currentPageData.type === 'title' ? renderTitlePage() : renderContentPage()}
              </div>
            </div>
          </div>
        </div>

        {/* شريط التنقل */}
        <div className="px-6 py-4 border-t bg-white flex items-center justify-between">
          {/* أزرار التنقل */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={prevPage}
              disabled={currentPage === 0}
              className="gap-1"
            >
              <ChevronRight className="h-4 w-4" />
              السابق
            </Button>
            
            {/* مؤشر الصفحات */}
            <div className="flex items-center gap-1 px-3">
              {pages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentPage(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentPage 
                      ? 'bg-green-600 w-4' 
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={nextPage}
              disabled={currentPage === totalPages - 1}
              className="gap-1"
            >
              التالي
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>

          {/* معلومات الصفحة */}
          <div className="text-sm text-gray-500">
            صفحة {currentPage + 1} من {totalPages}
          </div>

          {/* زر التصدير */}
          <Button
            onClick={() => onExport(localTemplate)}
            disabled={isExporting}
            className="bg-green-600 hover:bg-green-700 gap-2"
          >
            {isExporting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                جاري التصدير...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                تصدير {getFormatName()}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
