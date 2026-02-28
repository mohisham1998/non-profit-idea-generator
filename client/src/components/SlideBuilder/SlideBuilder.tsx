import { useEffect, useState } from 'react';
import { useSlideStore } from '@/stores/slideStore';
import { SlideCard } from './SlideCard';
import { SlideSidebar } from './SlideSidebar';
import { StylePanel } from './StylePanel';
import { ThemePanel } from './ThemePanel';
import { ProposedNamesModal } from './ProposedNamesModal';
import { Button } from '@/components/ui/button';
import { Download, Settings, Play, Gauge, DollarSign, Grid3X3, Table2, Calendar, FolderKanban, Lightbulb, Megaphone, Loader2, X, ArrowLeft, PanelLeftClose, PanelLeftOpen, Sparkles, Palette } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { useLocation } from 'wouter';

interface SlideBuilderProps {
  initialData?: any;
  generatedIdeaId?: number;
}

export function SlideBuilder({ initialData, generatedIdeaId }: SlideBuilderProps) {
  const [, setLocation] = useLocation();
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [stylingCardId, setStylingCardId] = useState<string | null>(null);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [namesModalOpen, setNamesModalOpen] = useState(false);
  const [themePanelOpen, setThemePanelOpen] = useState(false);
  
  const { 
    cards, 
    selectedCardId, 
    selectCard, 
    theme,
    presentationName,
    proposedNames,
    updateCard,
    removeCard,
  } = useSlideStore();
  
  // Handle action buttons
  const handleEdit = (cardId: string) => {
    // Toggle: click Edit again to cancel
    if (editingCardId === cardId) {
      setEditingCardId(null);
    } else {
      setEditingCardId(cardId);
    }
  };

  const handleSave = (cardId: string, newTitle: string, newContent: any) => {
    updateCard(cardId, { title: newTitle, content: newContent });
    setEditingCardId(null);
    toast.success("تم حفظ التغييرات بنجاح!");
  };

  const handleCancelEdit = () => {
    setEditingCardId(null);
  };
  
  const handleStyle = (cardId: string) => {
    setStylingCardId(prev => prev === cardId ? null : cardId);
    // Close edit mode if open
    if (editingCardId) setEditingCardId(null);
  };
  
  const handleAIChat = (cardId: string) => {
    toast.info("ميزة الذكاء الاصطناعي قادمة قريباً!");
  };
  
  const handleGoBack = () => {
    // Clear cards and go back to home
    useSlideStore.getState().clearCards();
    setLocation('/');
    window.location.reload();
  };
  
  // Mutations for generating additional components
  const generateKPIsMutation = trpc.ideas.generateKPIs.useMutation({
    onSuccess: (data) => {
      if (data.kpis) {
        // Add KPIs card to the store
        useSlideStore.getState().addCard({
          type: 'kpis' as const,
          title: 'مؤشرات قياس الأداء (KPIs)',
          content: data.kpis,
          style: {
            backgroundColor: '#ffffff',
            colorTheme: 'blue' as const,
            fullBleed: false,
            contentAlignment: 'top',
            showHeader: false,
            showFooter: false,
            showLogo: true,
          },
        });
        toast.success("تم توليد مؤشرات الأداء بنجاح!");
      }
    },
    onError: (error) => {
      toast.error(error.message || "حدث خطأ أثناء توليد المؤشرات");
    },
  });
  
  const estimateBudgetMutation = trpc.ideas.estimateBudget.useMutation({
    onSuccess: (data) => {
      if (data.budget) {
        useSlideStore.getState().addCard({
          type: 'budget' as const,
          title: 'تقدير الميزانية',
          content: data.budget,
          style: {
            backgroundColor: '#ffffff',
            colorTheme: 'green' as const,
            fullBleed: false,
            contentAlignment: 'top',
            showHeader: false,
            showFooter: false,
            showLogo: true,
          },
        });
        toast.success("تم تقدير الميزانية بنجاح!");
      }
    },
    onError: (error) => {
      toast.error(error.message || "حدث خطأ أثناء تقدير الميزانية");
    },
  });
  
  const generateSWOTMutation = trpc.ideas.generateSWOT.useMutation({
    onSuccess: (data) => {
      if (data.swot) {
        useSlideStore.getState().addCard({
          type: 'swot' as const,
          title: 'تحليل SWOT',
          content: data.swot,
          style: {
            backgroundColor: '#ffffff',
            colorTheme: 'purple' as const,
            fullBleed: false,
            contentAlignment: 'top',
            showHeader: false,
            showFooter: false,
            showLogo: true,
          },
        });
        toast.success("تم توليد تحليل SWOT بنجاح!");
      }
    },
    onError: (error) => {
      toast.error(error.message || "حدث خطأ أثناء توليد تحليل SWOT");
    },
  });
  
  const generateLogFrameMutation = trpc.ideas.generateLogFrame.useMutation({
    onSuccess: (data) => {
      if (data.logFrame) {
        useSlideStore.getState().addCard({
          type: 'logframe' as const,
          title: 'الإطار المنطقي',
          content: data.logFrame,
          style: {
            backgroundColor: '#ffffff',
            colorTheme: 'blue' as const,
            fullBleed: false,
            contentAlignment: 'top',
            showHeader: false,
            showFooter: false,
            showLogo: true,
          },
        });
        toast.success("تم توليد الإطار المنطقي بنجاح!");
      }
    },
    onError: (error) => {
      toast.error(error.message || "حدث خطأ أثناء توليد الإطار المنطقي");
    },
  });
  
  const generateTimelineMutation = trpc.ideas.generateTimeline.useMutation({
    onSuccess: () => {
      toast.success("تم توليد الجدول الزمني بنجاح!");
    },
    onError: (error) => {
      toast.error(error.message || "حدث خطأ أثناء توليد الجدول الزمني");
    },
  });
  
  const generatePMDProMutation = trpc.ideas.generatePMDPro.useMutation({
    onSuccess: () => {
      toast.success("تم توليد خطة PMDPro بنجاح!");
    },
    onError: (error) => {
      toast.error(error.message || "حدث خطأ أثناء توليد خطة PMDPro");
    },
  });
  
  const generateDesignThinkingMutation = trpc.ideas.generateDesignThinking.useMutation({
    onSuccess: () => {
      toast.success("تم توليد التفكير التصميمي بنجاح!");
    },
    onError: (error) => {
      toast.error(error.message || "حدث خطأ أثناء توليد التفكير التصميمي");
    },
  });
  
  const generateMarketingMutation = trpc.ideas.generateMarketing.useMutation({
    onSuccess: () => {
      toast.success("تم توليد المحتوى التسويقي بنجاح!");
    },
    onError: (error) => {
      toast.error(error.message || "حدث خطأ أثناء توليد المحتوى التسويقي");
    },
  });
  
  // Auto-select first card if none selected
  useEffect(() => {
    if (cards.length > 0 && !selectedCardId) {
      selectCard(cards[0].id);
    }
  }, [cards, selectedCardId, selectCard]);
  
  // Scroll to selected card when it changes
  useEffect(() => {
    if (selectedCardId) {
      const element = document.getElementById(`slide-card-${selectedCardId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [selectedCardId]);
  
  if (cards.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">لا توجد شرائح متاحة</p>
          <p className="text-sm text-gray-500">قم بتوليد فكرة أولاً لإنشاء العرض التقديمي</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Top Toolbar */}
      <div className="bg-white border-b border-gray-200 shadow-sm z-10">
        <div className="px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-2"
              onClick={handleGoBack}
            >
              <ArrowLeft className="h-4 w-4" />
              العودة
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              onClick={() => setSidebarVisible(v => !v)}
              title={sidebarVisible ? 'إخفاء الشرائح' : 'إظهار الشرائح'}
            >
              {sidebarVisible
                ? <PanelLeftClose className="h-4 w-4" />
                : <PanelLeftOpen className="h-4 w-4" />
              }
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              onClick={() => setThemePanelOpen(v => !v)}
              title={themePanelOpen ? 'إغلاق إعدادات العرض' : 'إعدادات العرض والغلاف'}
            >
              <Palette className="h-4 w-4" />
              <span className="text-xs hidden sm:inline">الغلاف والشعار</span>
            </Button>
            <button
              onClick={() => setNamesModalOpen(true)}
              className="group flex items-center gap-2 hover:bg-gray-100 rounded-lg px-2 py-1 transition-colors"
              title="اختر اسم المشروع"
            >
              <h1 className="text-lg font-semibold text-gray-900 group-hover:text-violet-700 transition-colors">
                {presentationName || theme.coverSlide.title || 'عرض تقديمي'}
              </h1>
              {proposedNames.length > 0 && (
                <Sparkles className="h-4 w-4 text-violet-400" />
              )}
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Generation Buttons */}
            <div className="flex items-center gap-1 ml-4 border-l pl-4">
              <Button 
                variant="ghost" 
                size="sm" 
                className="gap-1.5 h-8"
                onClick={() => generatedIdeaId && generateKPIsMutation.mutate({ id: generatedIdeaId })}
                disabled={generateKPIsMutation.isPending}
              >
                {generateKPIsMutation.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Gauge className="h-3.5 w-3.5" />
                )}
                <span className="text-xs">KPIs</span>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="gap-1.5 h-8"
                onClick={() => generatedIdeaId && estimateBudgetMutation.mutate({ id: generatedIdeaId })}
                disabled={estimateBudgetMutation.isPending}
              >
                {estimateBudgetMutation.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <DollarSign className="h-3.5 w-3.5" />
                )}
                <span className="text-xs">ميزانية</span>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="gap-1.5 h-8"
                onClick={() => generatedIdeaId && generateSWOTMutation.mutate({ id: generatedIdeaId })}
                disabled={generateSWOTMutation.isPending}
              >
                {generateSWOTMutation.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Grid3X3 className="h-3.5 w-3.5" />
                )}
                <span className="text-xs">SWOT</span>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="gap-1.5 h-8"
                onClick={() => generatedIdeaId && generateLogFrameMutation.mutate({ id: generatedIdeaId })}
                disabled={generateLogFrameMutation.isPending}
              >
                {generateLogFrameMutation.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Table2 className="h-3.5 w-3.5" />
                )}
                <span className="text-xs">إطار منطقي</span>
              </Button>
            </div>
            
            <Button variant="outline" size="sm" className="gap-2">
              <Play className="h-4 w-4" />
              عرض
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Settings className="h-4 w-4" />
              الإعدادات
            </Button>
            <Button variant="default" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              تصدير
            </Button>
          </div>
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Center Content - Vertical Scrolling Cards */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          <div className="max-w-full py-6 px-8">
            <div className="space-y-4">
              {cards.map((card) => (
                <div
                  key={card.id}
                  id={`slide-card-${card.id}`}
                  onClick={() => selectCard(card.id)}
                  className="scroll-mt-8"
                >
                  <SlideCard
                    card={card}
                    isSelected={selectedCardId === card.id}
                    isEditing={editingCardId === card.id}
                    logo={theme.logo}
                    logoPosition={theme.logoPosition}
                    logoSize={theme.logoSize}
                    applyLogoToAllSlides={theme.applyLogoToAllSlides}
                    globalBackgroundColor={theme.globalBackgroundColor}
                    globalBackgroundImage={theme.globalBackgroundImage}
                    applyGlobalBackground={theme.applyGlobalBackground}
                    coverSlide={theme.coverSlide}
                    onEdit={() => handleEdit(card.id)}
                    onStyle={() => handleStyle(card.id)}
                    onAIChat={() => handleAIChat(card.id)}
                    onSave={(newTitle, newContent) => handleSave(card.id, newTitle, newContent)}
                    onCancel={handleCancelEdit}
                  />
                </div>
              ))}
            </div>
            
            {/* Bottom Padding */}
            <div className="h-32" />
          </div>
        </div>
        
        {/* Right Sidebar - Slide Thumbnails */}
        {sidebarVisible && (
          <SlideSidebar onOpenStyle={(cardId) => setStylingCardId(prev => prev === cardId ? null : cardId)} />
        )}

        {/* Style Panel - slides in over the sidebar when active */}
        {stylingCardId && (() => {
          const stylingCard = cards.find(c => c.id === stylingCardId);
          if (!stylingCard) return null;
          return (
            <StylePanel
              cardId={stylingCardId}
              cardType={stylingCard.type}
              currentStyle={stylingCard.style}
              contentKey={stylingCard.type === 'custom' ? (Object.keys(stylingCard.content || {})[0] ?? '') : ''}
              onClose={() => setStylingCardId(null)}
              onDeleteCard={() => {
                removeCard(stylingCardId);
                setStylingCardId(null);
                toast.success("تم حذف البطاقة");
              }}
            />
          );
        })()}

        {/* Theme Panel - cover & logo settings */}
        {themePanelOpen && <ThemePanel onClose={() => setThemePanelOpen(false)} />}
      </div>

      {/* Proposed Names Modal — rendered inside the root div so it's always on top */}
      {namesModalOpen && (
        <ProposedNamesModal onClose={() => setNamesModalOpen(false)} />
      )}
    </div>
  );
}
