import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import Background3D from "@/components/Background3D";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { 
  Lightbulb, 
  Target, 
  FileText, 
  Star, 
  Zap, 
  Package, 
  TrendingUp,
  Copy,
  Download,
  History,
  Loader2,
  CheckCircle,
  Sparkles,
  FileDown,
  Users,
  Hash,
  Clock,
  RefreshCw,
  Edit3,
  Save,
  X,
  Bell,
  Layers,
  Award,
  ChevronLeft,
  ChevronRight,
  ThumbsUp,
  AlertCircle,
  TrendingDown,
  BarChart3,
  Gauge,
  Activity,
  Calendar,
  ClipboardList,
  DollarSign,
  PiggyBank,
  Wallet,
  Receipt,
  Banknote,
  AlertTriangle,
  Eye,
  Crosshair,
  ListChecks,
  MessageCircle,
  Grid3X3,
  Table2,
  ArrowUpDown,
  Compass,
  Briefcase,
  FolderKanban,
  BarChart2,
  Shield,
  Megaphone,
  ArrowLeft,
  Check,
  Crown,
  AlignLeft,
  Menu,
  PanelLeftClose,
  PanelLeft
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Link } from "wouter";
import { generateIdeaPDF } from "@/lib/pdfGenerator";
import { AIChatBox, Message } from "@/components/AIChatBox";
import GanttChart from "@/components/GanttChart";
import { ExportPDFButton } from "@/components/ExportPDFButton";
import Navbar from "@/components/Navbar";
import MarketingContent from "@/components/MarketingContent";
import { ValueAddAnalysis } from "@/components/ValueAddAnalysis";
import Sidebar from "@/components/Sidebar";
import { ProgressIndicator } from "@/components/ProgressIndicator";
import { EditableKPIs } from "@/components/EditableKPIs";
import { EditableBudget } from "@/components/EditableBudget";
import { EditableSWOT } from "@/components/EditableSWOT";
import { EditableJSONSection } from "@/components/EditableJSONSection";
import { JSONEditorModal } from "@/components/JSONEditorModal";
import { SlideBuilder } from "@/components/SlideBuilder/SlideBuilder";
import { useSlideStore } from "@/stores/slideStore";
import { convertExistingDataToSlides } from "@/lib/convertToSlides";

interface GeneratedIdea {
  id: number;
  programDescription: string;
  targetAudience?: string | null;
  targetCount?: string | null;
  duration?: string | null;
  proposedNames?: string | string[] | null;
  selectedName?: string | null;
  vision?: string | null;
  generalObjective?: string | null;
  detailedObjectives?: string | null;
  idea: string;
  objective: string;
  justifications: string;
  features: string;
  strengths: string;
  outputs: string;
  expectedResults: string;
  risks?: string | null;
  isApproved?: boolean | null;
  createdAt: Date;
}

export default function Home() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  // إعادة توجيه المستخدمين المعلقين إلى صفحة الانتظار
  useEffect(() => {
    if (!authLoading && user && user.status === 'pending') {
      setLocation('/pending');
    }
  }, [user, authLoading, setLocation]);
  const [programDescription, setProgramDescription] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [targetCount, setTargetCount] = useState("");
  const [duration, setDuration] = useState("");
  const [generatedIdea, setGeneratedIdea] = useState<GeneratedIdea | null>(null);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [regeneratingSection, setRegeneratingSection] = useState<string | null>(null);
  
  // حالات التوليد المتعدد
  const [showMultipleMode, setShowMultipleMode] = useState(false);
  const [multipleVersions, setMultipleVersions] = useState<any[] | null>(null);
  const [selectedVersionIndex, setSelectedVersionIndex] = useState(0);
  const [multipleGenerationContext, setMultipleGenerationContext] = useState<any>(null);
  
  // حالات التقييم
  const [showEvaluation, setShowEvaluation] = useState(false);
  const [evaluation, setEvaluation] = useState<any>(null);
  
  // حالات مؤشرات KPIs
  const [showKPIs, setShowKPIs] = useState(false);
  const [kpisData, setKpisData] = useState<any>(null);
  
  // حالات تقدير الميزانية
  const [showBudget, setShowBudget] = useState(false);
  const [budgetData, setBudgetData] = useState<any>(null);
  
  // حالات تحليل SWOT
  const [showSWOT, setShowSWOT] = useState(false);
  const [swotData, setSwotData] = useState<any>(null);
  
  // حالات الإطار المنطقي
  const [showLogFrame, setShowLogFrame] = useState(false);
  const [logFrameData, setLogFrameData] = useState<any>(null);
  const [editingLogFrame, setEditingLogFrame] = useState(false);
  const [editingLogFrameSection, setEditingLogFrameSection] = useState<string | null>(null);
  const [editingLogFrameIndex, setEditingLogFrameIndex] = useState<number | null>(null);
  const [logFrameEditData, setLogFrameEditData] = useState<any>(null);
  
  // حالات الجدول الزمني
  const [showTimeline, setShowTimeline] = useState(false);
  const [timelineData, setTimelineData] = useState<any>(null);
  const [showGanttChart, setShowGanttChart] = useState(false);
  
  // حالات تحسين الفكرة
  const [showImprovements, setShowImprovements] = useState(false);
  const [improvementsData, setImprovementsData] = useState<any>(null);
  
  // حالات PMDPro
  const [showPMDPro, setShowPMDPro] = useState(false);
  const [pmdproData, setPmdproData] = useState<any>(null);
  
  // حالات التفكير التصميمي
  const [showDesignThinking, setShowDesignThinking] = useState(false);
  const [designThinkingData, setDesignThinkingData] = useState<any>(null);
  
  // حالات المحادثة التفاعلية
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null);
  const [chatSuggestions, setChatSuggestions] = useState<string[]>([]);
  
  // حالات المحتوى التسويقي
  const [showMarketing, setShowMarketing] = useState(false);
  const [marketingData, setMarketingData] = useState<any>(null);
  
  // حالات القيمة المضافة
  const [showValueAdd, setShowValueAdd] = useState(false);
  const [valueAddData, setValueAddData] = useState<any>(null);
  
  // حالة التبديل بين المحتوى التفصيلي والمختصر
  const [isDetailedView, setIsDetailedView] = useState(true);
  
  // حالة نوع المخرجات (كمية/نوعية)
  const [outputsType, setOutputsType] = useState<'quantitative' | 'qualitative'>('quantitative');
  
  // حالة الشريط الجانبي
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // حالة محرر JSON
  const [jsonEditorOpen, setJsonEditorOpen] = useState(false);
  const [jsonEditorTitle, setJsonEditorTitle] = useState("");
  const [jsonEditorData, setJsonEditorData] = useState<any>(null);
  const [jsonEditorSaveHandler, setJsonEditorSaveHandler] = useState<((data: any) => void) | null>(null);

  // Function to convert data and load into slide store
  const convertAndLoadSlides = (idea?: GeneratedIdea) => {
    const currentIdea = idea || generatedIdea;
    if (!currentIdea) return;
    
    const slideData = {
      generatedIdea: currentIdea,
      showKPIs,
      kpisData,
      showBudget,
      budgetData,
      showSWOT,
      swotData,
      showLogFrame,
      logFrameData,
      showTimeline,
      timelineData,
      showPMDPro,
      pmdproData,
      showDesignThinking,
      designThinkingData,
      showMarketing,
      marketingData,
    };
    
    const slides = convertExistingDataToSlides(slideData);
    useSlideStore.getState().setCards(slides);

    // Store proposed names and seed the presentation name from the first name
    if (currentIdea.proposedNames) {
      const raw = currentIdea.proposedNames;
      let names: string[] = [];
      if (Array.isArray(raw)) names = raw.map(String);
      else if (typeof raw === 'string') {
        try { names = JSON.parse(raw); } catch { names = [raw]; }
      }
      useSlideStore.getState().setProposedNames(names.filter(Boolean));
      if (names.length > 0 && names[0]) {
        useSlideStore.getState().setPresentationName(names[0]);
      }
    }
  };

  const generateMutation = trpc.ideas.generate.useMutation({
    onSuccess: (data) => {
      if (data.idea) {
        setGeneratedIdea(data.idea as GeneratedIdea);
        toast.success("تم توليد الفكرة بنجاح!");
        
        // Convert to slides
        convertAndLoadSlides(data.idea as GeneratedIdea);
      }
    },
    onError: (error) => {
      toast.error(error.message || "حدث خطأ أثناء توليد الفكرة");
    },
  });

  const updateMutation = trpc.ideas.update.useMutation({
    onSuccess: (data) => {
      if (data.idea) {
        setGeneratedIdea(data.idea as GeneratedIdea);
        setEditingSection(null);
        setEditContent("");
        toast.success("تم حفظ التعديلات بنجاح!");
      }
    },
    onError: (error) => {
      toast.error(error.message || "حدث خطأ أثناء حفظ التعديلات");
    },
  });

  const regenerateMutation = trpc.ideas.regenerateSection.useMutation({
    onSuccess: (data) => {
      if (data.idea) {
        setGeneratedIdea(data.idea as GeneratedIdea);
        setRegeneratingSection(null);
        toast.success("تم إعادة توليد القسم بنجاح!");
      }
    },
    onError: (error) => {
      setRegeneratingSection(null);
      toast.error(error.message || "حدث خطأ أثناء إعادة التوليد");
    },
  });

  // اختيار الاسم الرسمي
  const selectNameMutation = trpc.ideas.selectName.useMutation({
    onSuccess: (data) => {
      if (data.idea) {
        setGeneratedIdea(data.idea as GeneratedIdea);
        toast.success("تم اختيار الاسم الرسمي بنجاح!");
      }
    },
    onError: (error) => {
      toast.error(error.message || "حدث خطأ أثناء اختيار الاسم");
    },
  });

  // إلغاء اختيار الاسم الرسمي
  const clearSelectedNameMutation = trpc.ideas.clearSelectedName.useMutation({
    onSuccess: (data) => {
      if (data.idea) {
        setGeneratedIdea(data.idea as GeneratedIdea);
        toast.success("تم إلغاء اختيار الاسم الرسمي");
      }
    },
    onError: (error) => {
      toast.error(error.message || "حدث خطأ أثناء إلغاء الاختيار");
    },
  });

  // التوليد المتعدد
  const generateMultipleMutation = trpc.ideas.generateMultiple.useMutation({
    onSuccess: (data) => {
      if (data.versions) {
        setMultipleVersions(data.versions);
        setSelectedVersionIndex(0);
        setMultipleGenerationContext({
          programDescription: data.programDescription,
          targetAudience: data.targetAudience,
          targetCount: data.targetCount,
          duration: data.duration,
        });
        setShowMultipleMode(true);
        toast.success("تم توليد 3 نسخ مختلفة بنجاح!");
      }
    },
    onError: (error) => {
      toast.error(error.message || "حدث خطأ أثناء التوليد المتعدد");
    },
  });

  // حفظ النسخة المختارة
  const saveVersionMutation = trpc.ideas.saveVersion.useMutation({
    onSuccess: (data) => {
      if (data.idea) {
        setGeneratedIdea(data.idea as GeneratedIdea);
        setShowMultipleMode(false);
        setMultipleVersions(null);
        toast.success("تم حفظ النسخة بنجاح!");
      }
    },
    onError: (error) => {
      toast.error(error.message || "حدث خطأ أثناء حفظ النسخة");
    },
  });

  // تقييم الفكرة
  const evaluateMutation = trpc.ideas.evaluate.useMutation({
    onSuccess: (data) => {
      if (data.evaluation) {
        setEvaluation(data.evaluation);
        setShowEvaluation(true);
        toast.success("تم تقييم الفكرة بنجاح!");
      }
    },
    onError: (error) => {
      toast.error(error.message || "حدث خطأ أثناء تقييم الفكرة");
    },
  });

  // توليد مؤشرات KPIs
  const generateKPIsMutation = trpc.ideas.generateKPIs.useMutation({
    onSuccess: (data) => {
      if (data.kpis) {
        setKpisData(data.kpis);
        setShowKPIs(true);
        toast.success("تم توليد مؤشرات الأداء بنجاح!");
      }
    },
    onError: (error) => {
      toast.error(error.message || "حدث خطأ أثناء توليد المؤشرات");
    },
  });

  // تقدير الميزانية
  const estimateBudgetMutation = trpc.ideas.estimateBudget.useMutation({
    onSuccess: (data) => {
      if (data.budget) {
        setBudgetData(data.budget);
        setShowBudget(true);
        toast.success("تم تقدير الميزانية بنجاح!");
        
        // Re-convert to slides
        convertAndLoadSlides();
      }
    },
    onError: (error) => {
      toast.error(error.message || "حدث خطأ أثناء تقدير الميزانية");
    },
  });

  // تحليل SWOT
  const generateSWOTMutation = trpc.ideas.generateSWOT.useMutation({
    onSuccess: (data) => {
      if (data.swot) {
        setSwotData(data.swot);
        setShowSWOT(true);
        toast.success("تم توليد تحليل SWOT بنجاح!");
        
        // Re-convert to slides
        convertAndLoadSlides();
      }
    },
    onError: (error) => {
      toast.error(error.message || "حدث خطأ أثناء توليد تحليل SWOT");
    },
  });

  // الإطار المنطقي
  const generateLogFrameMutation = trpc.ideas.generateLogFrame.useMutation({
    onSuccess: (data) => {
      if (data.logFrame) {
        setLogFrameData(data.logFrame);
        setLogFrameEditData(JSON.parse(JSON.stringify(data.logFrame)));
        setShowLogFrame(true);
        toast.success("تم توليد الإطار المنطقي بنجاح!");
      }
    },
    onError: (error) => {
      toast.error(error.message || "حدث خطأ أثناء توليد الإطار المنطقي");
    },
  });

  // تحديث الإطار المنطقي
  const updateLogFrameMutation = trpc.ideas.updateLogFrame.useMutation({
    onSuccess: (data) => {
      if (data.logFrame) {
        setLogFrameData(data.logFrame);
        setLogFrameEditData(JSON.parse(JSON.stringify(data.logFrame)));
        setEditingLogFrame(false);
        setEditingLogFrameSection(null);
        setEditingLogFrameIndex(null);
        toast.success("تم حفظ التعديلات بنجاح!");
      }
    },
    onError: (error) => {
      toast.error(error.message || "حدث خطأ أثناء حفظ التعديلات");
    },
  });

  // توليد الجدول الزمني
  const generateTimelineMutation = trpc.ideas.generateTimeline.useMutation({
    onSuccess: (data) => {
      if (data.timeline) {
        setTimelineData(data.timeline);
        setShowTimeline(true);
        toast.success("تم توليد الجدول الزمني بنجاح!");
      }
    },
    onError: (error) => {
      toast.error(error.message || "حدث خطأ أثناء توليد الجدول الزمني");
    },
  });

  // تحسين الفكرة
  const improveIdeaMutation = trpc.ideas.improveIdea.useMutation({
    onSuccess: (data) => {
      if (data.improvements) {
        setImprovementsData(data.improvements);
        setShowImprovements(true);
        toast.success("تم تحليل وتحسين الفكرة بنجاح!");
      }
    },
    onError: (error) => {
      toast.error(error.message || "حدث خطأ أثناء تحسين الفكرة");
    },
  });

  // تطبيق التحسينات على الفكرة الأصلية
  const applyImprovementsMutation = trpc.ideas.applyImprovements.useMutation({
    onSuccess: (data) => {
      if (data.idea && generatedIdea) {
        // تحديث الفكرة المعروضة بالقيم المحسنة
        setGeneratedIdea({
          ...generatedIdea,
          vision: improvementsData?.improvedVision || generatedIdea.vision,
          detailedObjectives: improvementsData?.improvedObjectives || generatedIdea.detailedObjectives,
        });
        setShowImprovements(false);
        toast.success("تم تطبيق التحسينات بنجاح! تم تحديث الرؤية والأهداف.");
      }
    },
    onError: (error) => {
      toast.error(error.message || "حدث خطأ أثناء تطبيق التحسينات");
    },
  });

  // mutation PMDPro
  const generatePMDProMutation = trpc.ideas.generatePMDPro.useMutation({
    onSuccess: (data) => {
      if (data.pmdpro) {
        setPmdproData(data.pmdpro);
        setShowPMDPro(true);
        toast.success("تم توليد خطة PMDPro بنجاح!");
      }
    },
    onError: (error) => {
      toast.error(error.message || "حدث خطأ أثناء توليد خطة PMDPro");
    },
  });

  // mutation التفكير التصميمي
  const generateDesignThinkingMutation = trpc.ideas.generateDesignThinking.useMutation({
    onSuccess: (data) => {
      if (data.designThinking) {
        setDesignThinkingData(data.designThinking);
        setShowDesignThinking(true);
        toast.success("تم توليد خطة التفكير التصميمي بنجاح!");
      }
    },
    onError: (error) => {
      toast.error(error.message || "حدث خطأ أثناء توليد خطة التفكير التصميمي");
    },
  });

  // mutation المحتوى التسويقي
  const generateMarketingMutation = trpc.marketing.generateContent.useMutation({
    onSuccess: (data) => {
      if (data.content) {
        setMarketingData(data);
        setShowMarketing(true);
        toast.success("تم توليد المحتوى التسويقي بنجاح!");
      }
    },
    onError: (error) => {
      toast.error(error.message || "حدث خطأ أثناء توليد المحتوى التسويقي");
    },
  });

  // mutation القيمة المضافة
  const generateValueAddMutation = trpc.marketing.generateValueAdd.useMutation({
    onSuccess: (data) => {
      if (data.analysis) {
        setValueAddData(data);
        setShowValueAdd(true);
        toast.success("تم تحليل القيمة المضافة بنجاح!");
      }
    },
    onError: (error) => {
      toast.error(error.message || "حدث خطأ أثناء تحليل القيمة المضافة");
    },
  });

  // mutation اعتماد المشروع
  const approveMutation = trpc.ideas.approve.useMutation({
    onSuccess: (data) => {
      if (data.idea) {
        setGeneratedIdea(data.idea as GeneratedIdea);
        toast.success("تم اعتماد المشروع بنجاح! يمكنك الآن الوصول إلى خبير الاستدامة والدراسة البحثية");
      }
    },
    onError: (error) => {
      toast.error(error.message || "حدث خطأ أثناء اعتماد المشروع");
    },
  });

  // mutations المحادثة التفاعلية
  const startConversationMutation = trpc.conversations.start.useMutation({
    onSuccess: (data) => {
      if (data.conversation) {
        setCurrentConversationId(data.conversation.id);
        setChatMessages([{ role: "assistant", content: data.welcomeMessage }]);
        setShowChat(true);
        toast.success("تم بدء المحادثة!");
      }
    },
    onError: (error) => {
      toast.error(error.message || "حدث خطأ أثناء بدء المحادثة");
    },
  });

  const sendMessageMutation = trpc.conversations.sendMessage.useMutation({
    onSuccess: (data) => {
      if (data.message) {
        setChatMessages(prev => [...prev, { role: "assistant", content: data.message }]);
      }
    },
    onError: (error) => {
      toast.error(error.message || "حدث خطأ أثناء إرسال الرسالة");
    },
  });

  const suggestionsQuery = trpc.conversations.getSuggestions.useQuery(
    { ideaId: generatedIdea?.id || 0 },
    { 
      enabled: showChat && !!generatedIdea?.id,
    }
  );

  const handleSendChatMessage = (content: string) => {
    if (!currentConversationId) return;
    setChatMessages(prev => [...prev, { role: "user", content }]);
    sendMessageMutation.mutate({
      conversationId: currentConversationId,
      message: content,
    });
  };

  const handleStartChat = () => {
    if (!generatedIdea) return;
    startConversationMutation.mutate({ ideaId: generatedIdea.id });
  };

  const handleCloseChat = () => {
    setShowChat(false);
    setChatMessages([]);
    setCurrentConversationId(null);
  };

  // دوال تعديل الإطار المنطقي
  const startEditingLogFrame = () => {
    setLogFrameEditData(JSON.parse(JSON.stringify(logFrameData)));
    setEditingLogFrame(true);
  };

  const cancelEditingLogFrame = () => {
    setLogFrameEditData(JSON.parse(JSON.stringify(logFrameData)));
    setEditingLogFrame(false);
    setEditingLogFrameSection(null);
    setEditingLogFrameIndex(null);
  };

  const saveLogFrameChanges = () => {
    if (!generatedIdea || !logFrameEditData) return;
    updateLogFrameMutation.mutate({
      id: generatedIdea.id,
      logFrame: logFrameEditData,
    });
  };

  const updateLogFrameField = (section: string, field: string, value: any, index?: number) => {
    if (!logFrameEditData) return;
    const newData = JSON.parse(JSON.stringify(logFrameEditData));
    
    if (section === 'goal' || section === 'purpose') {
      if (field === 'narrative') {
        newData[section].narrative = value;
      } else {
        newData[section][field] = value;
      }
    } else if (section === 'outputs' && index !== undefined) {
      if (field === 'narrative') {
        newData.outputs[index].narrative = value;
      } else {
        newData.outputs[index][field] = value;
      }
    } else if (section === 'activities' && index !== undefined) {
      if (field === 'narrative' || field === 'timeframe' || field === 'responsible') {
        newData.activities[index][field] = value;
      } else if (field === 'inputs') {
        newData.activities[index].inputs = value;
      }
    } else if (section === 'summary') {
      newData.summary = value;
    }
    
    setLogFrameEditData(newData);
  };

  const updateArrayItem = (section: string, field: string, itemIndex: number, value: string, outputIndex?: number) => {
    if (!logFrameEditData) return;
    const newData = JSON.parse(JSON.stringify(logFrameEditData));
    
    if (section === 'goal' || section === 'purpose') {
      newData[section][field][itemIndex] = value;
    } else if (section === 'outputs' && outputIndex !== undefined) {
      newData.outputs[outputIndex][field][itemIndex] = value;
    } else if (section === 'activities' && outputIndex !== undefined) {
      newData.activities[outputIndex][field][itemIndex] = value;
    }
    
    setLogFrameEditData(newData);
  };

  const addArrayItem = (section: string, field: string, outputIndex?: number) => {
    if (!logFrameEditData) return;
    const newData = JSON.parse(JSON.stringify(logFrameEditData));
    
    if (section === 'goal' || section === 'purpose') {
      newData[section][field].push('');
    } else if (section === 'outputs' && outputIndex !== undefined) {
      newData.outputs[outputIndex][field].push('');
    } else if (section === 'activities' && outputIndex !== undefined) {
      newData.activities[outputIndex][field].push('');
    }
    
    setLogFrameEditData(newData);
  };

  const removeArrayItem = (section: string, field: string, itemIndex: number, outputIndex?: number) => {
    if (!logFrameEditData) return;
    const newData = JSON.parse(JSON.stringify(logFrameEditData));
    
    if (section === 'goal' || section === 'purpose') {
      newData[section][field].splice(itemIndex, 1);
    } else if (section === 'outputs' && outputIndex !== undefined) {
      newData.outputs[outputIndex][field].splice(itemIndex, 1);
    } else if (section === 'activities' && outputIndex !== undefined) {
      newData.activities[outputIndex][field].splice(itemIndex, 1);
    }
    
    setLogFrameEditData(newData);
  };

  const handleGenerate = () => {
    if (!programDescription.trim()) {
      toast.error("يرجى إدخال وصف البرنامج أو المبادرة");
      return;
    }
    if (programDescription.trim().length < 10) {
      toast.error("يجب أن يكون الوصف 10 أحرف على الأقل");
      return;
    }
    // إعادة تعيين الحالات
    setShowMultipleMode(false);
    setMultipleVersions(null);
    setShowEvaluation(false);
    setEvaluation(null);
    
    generateMutation.mutate({ 
      programDescription: programDescription.trim(),
      targetAudience: targetAudience.trim() || undefined,
      targetCount: targetCount.trim() || undefined,
      duration: duration.trim() || undefined,
    });
  };

  const handleGenerateMultiple = () => {
    if (!programDescription.trim()) {
      toast.error("يرجى إدخال وصف البرنامج أو المبادرة");
      return;
    }
    if (programDescription.trim().length < 10) {
      toast.error("يجب أن يكون الوصف 10 أحرف على الأقل");
      return;
    }
    // إعادة تعيين الحالات
    setGeneratedIdea(null);
    setShowEvaluation(false);
    setEvaluation(null);
    
    generateMultipleMutation.mutate({ 
      programDescription: programDescription.trim(),
      targetAudience: targetAudience.trim() || undefined,
      targetCount: targetCount.trim() || undefined,
      duration: duration.trim() || undefined,
    });
  };

  const handleSaveSelectedVersion = () => {
    if (!multipleVersions || !multipleGenerationContext) return;
    const selectedVersion = multipleVersions[selectedVersionIndex];
    
    saveVersionMutation.mutate({
      programDescription: multipleGenerationContext.programDescription,
      targetAudience: multipleGenerationContext.targetAudience,
      targetCount: multipleGenerationContext.targetCount,
      duration: multipleGenerationContext.duration,
      ...selectedVersion,
    });
  };

  const handleEvaluate = () => {
    if (!generatedIdea) return;
    evaluateMutation.mutate({ id: generatedIdea.id });
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`تم نسخ ${label}`);
  };

  const copyAllContent = () => {
    if (!generatedIdea) return;
    const content = `
الفكرة:
${generatedIdea.idea}

الهدف:
${generatedIdea.objective}

مبررات البرنامج:
${generatedIdea.justifications}

المميزات:
${generatedIdea.features}

نقاط القوة:
${generatedIdea.strengths}

المخرجات:
${generatedIdea.outputs}

النتائج المتوقعة:
${generatedIdea.expectedResults}
    `.trim();
    navigator.clipboard.writeText(content);
    toast.success("تم نسخ جميع المحتوى");
  };

  const downloadAsPDF = async () => {
    if (!generatedIdea) return;
    setIsExportingPDF(true);
    try {
      await generateIdeaPDF(generatedIdea);
      toast.success("تم تصدير الملف بنجاح");
    } catch (error) {
      toast.error("حدث خطأ أثناء تصدير PDF");
    } finally {
      setIsExportingPDF(false);
    }
  };

  const downloadAsText = () => {
    if (!generatedIdea) return;
    const content = `
وصف البرنامج/المبادرة:
${generatedIdea.programDescription}

═══════════════════════════════════════

الفكرة:
${generatedIdea.idea}

═══════════════════════════════════════

الهدف:
${generatedIdea.objective}

═══════════════════════════════════════

مبررات البرنامج:
${generatedIdea.justifications}

═══════════════════════════════════════

المميزات:
${generatedIdea.features}

═══════════════════════════════════════

نقاط القوة:
${generatedIdea.strengths}

═══════════════════════════════════════

المخرجات:
${generatedIdea.outputs}

═══════════════════════════════════════

النتائج المتوقعة:
${generatedIdea.expectedResults}
    `.trim();

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `فكرة-برنامج-${new Date().toLocaleDateString("ar-SA")}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("تم تحميل الملف");
  };

  const sections = generatedIdea ? [
    { icon: Sparkles, title: "المسميات المقترحة", content: generatedIdea.proposedNames ? (typeof generatedIdea.proposedNames === 'string' ? generatedIdea.proposedNames : JSON.stringify(generatedIdea.proposedNames)) : "", color: "text-purple-600", key: "proposedNames" as const },
    { icon: Eye, title: "الرؤية", content: generatedIdea.vision || "", color: "text-cyan-600", key: "vision" as const },
    { icon: Crosshair, title: "الهدف العام", content: generatedIdea.generalObjective || "", color: "text-rose-600", key: "generalObjective" as const },
    { icon: ListChecks, title: "الأهداف التفصيلية", content: generatedIdea.detailedObjectives || "", color: "text-orange-600", key: "detailedObjectives" as const },
    { icon: Lightbulb, title: "الفكرة", content: generatedIdea.idea, color: "text-amber-600", key: "idea" as const },
    { icon: FileText, title: "مبررات البرنامج", content: generatedIdea.justifications, color: "text-purple-600", key: "justifications" as const },
    { icon: Star, title: "المميزات", content: generatedIdea.features, color: "text-yellow-600", key: "features" as const },
    { icon: Zap, title: "نقاط القوة", content: generatedIdea.strengths, color: "text-green-600", key: "strengths" as const },
    { icon: Package, title: "المخرجات", content: generatedIdea.outputs, color: "text-indigo-600", key: "outputs" as const, hasTypeToggle: true },
    { icon: TrendingUp, title: "النتائج المتوقعة", content: generatedIdea.expectedResults, color: "text-teal-600", key: "expectedResults" as const },
    { icon: AlertTriangle, title: "المخاطر", content: generatedIdea.risks || "", color: "text-red-600", key: "risks" as const },
  ] : [];

  const handleStartEdit = (sectionKey: string, content: string) => {
    setEditingSection(sectionKey);
    setEditContent(content);
  };

  const handleCancelEdit = () => {
    setEditingSection(null);
    setEditContent("");
  };

  const handleSaveEdit = (sectionKey: string) => {
    if (!generatedIdea || !editContent.trim()) return;
    updateMutation.mutate({
      id: generatedIdea.id,
      [sectionKey]: editContent.trim(),
    });
  };

  const handleRegenerate = (sectionKey: 'proposedNames' | 'vision' | 'generalObjective' | 'detailedObjectives' | 'idea' | 'objective' | 'justifications' | 'features' | 'strengths' | 'outputs' | 'expectedResults' | 'risks') => {
    if (!generatedIdea) return;
    setRegeneratingSection(sectionKey);
    regenerateMutation.mutate({
      id: generatedIdea.id,
      section: sectionKey,
    });
  };

  const openJSONEditor = (title: string, data: any, saveHandler: (data: any) => void) => {
    setJsonEditorTitle(title);
    setJsonEditorData(data);
    setJsonEditorSaveHandler(() => saveHandler);
    setJsonEditorOpen(true);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If there's a generated idea, show the SlideBuilder full-screen
  if (generatedIdea) {
    return <SlideBuilder generatedIdeaId={generatedIdea.id} />;
  }

  return (
    <div className="min-h-screen relative">
      {/* خلفية 3D متحركة */}
      <Background3D />
      
      {/* Header */}
      <Navbar />

      {/* الشريط الجانبي للتنقل السريع */}
      <Sidebar
        hasIdea={!!generatedIdea}
        hasEvaluation={showEvaluation && !!evaluation}
        hasKPIs={showKPIs && !!kpisData}
        hasBudget={showBudget && !!budgetData}
        hasSWOT={showSWOT && !!swotData}
        hasLogFrame={showLogFrame && !!logFrameData}
        hasTimeline={showTimeline && !!timelineData}
        hasPMDPro={showPMDPro && !!pmdproData}
        hasDesignThinking={showDesignThinking && !!designThinkingData}
        onSectionClick={(sectionId) => {
          const element = document.getElementById(`section-${sectionId}`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }}
      />

      {/* Hero Section */}
      <section className="py-10 md:py-16 lg:py-24 gradient-subtle">
        <div className="container px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
{/* إطار زجاجي يجمع العناصر */}
            <div className="inline-block px-6 md:px-8 py-3 md:py-4 mb-6 md:mb-8 rounded-2xl backdrop-blur-md bg-gradient-to-r from-orange-100/60 via-amber-50/60 to-orange-100/60 border border-orange-200/50 shadow-lg animate-scale-in opacity-0" style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>
              <div className="flex items-center justify-center gap-2 text-xs md:text-sm text-gray-600 mb-2">
                <Sparkles className="h-3 w-3 md:h-4 md:w-4 animate-pulse-soft text-primary" />
                مدعوم بالذكاء الاصطناعي
              </div>
              <p className="text-base md:text-lg lg:text-xl font-semibold bg-gradient-to-r from-orange-600 via-amber-500 to-orange-600 bg-clip-text text-transparent">
                وداعاً للأفكار المكررة.. مرحباً بالابتكار
              </p>
            </div>
            
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 md:mb-6 leading-tight animate-slide-up opacity-0" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
              حوّل أفكارك إلى برامج
              <br />
              <span className="text-primary">ومبادرات متكاملة</span>
            </h2>
            <p className="text-sm md:text-base lg:text-lg text-muted-foreground mb-6 md:mb-8 leading-relaxed px-2 animate-slide-up opacity-0" style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}>
              أداة ذكية تساعد المنظمات غير الربحية على تطوير أفكار البرامج والمبادرات
              بشكل احترافي ومتكامل، من الفكرة إلى النتائج المتوقعة.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8 md:py-12 lg:py-16">
        <div className="container px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            {/* Input Card */}
            <Card className="mb-6 md:mb-8 shadow-lg border-0 glass glass-card-enhanced card-3d animate-slide-up opacity-0" style={{ animationDelay: '0.5s', animationFillMode: 'forwards' }}>
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="text-lg md:text-xl flex items-center gap-2">
                  <FileText className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                  وصف البرنامج أو المبادرة
                </CardTitle>
                <CardDescription className="text-xs md:text-sm">
                  اكتب وصفاً موجزاً للبرنامج أو المبادرة التي تريد تطويرها
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 p-4 md:p-6 pt-0 md:pt-0">
                <Textarea
                  placeholder="مثال: برنامج تدريبي لتأهيل الشباب في مجال ريادة الأعمال الاجتماعية..."
                  value={programDescription}
                  onChange={(e) => setProgramDescription(e.target.value)}
                  className="min-h-[100px] md:min-h-[120px] text-sm md:text-base resize-none"
                  dir="rtl"
                />
                
                {/* حقول إضافية */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 pt-2">
                  <div className="space-y-1.5 md:space-y-2">
                    <label className="text-xs md:text-sm font-medium flex items-center gap-1.5 md:gap-2 text-muted-foreground">
                      <Users className="h-3.5 w-3.5 md:h-4 md:w-4" />
                      الفئة المستهدفة
                    </label>
                    <Input
                      placeholder="مثال: الشباب من 18-30 سنة"
                      value={targetAudience}
                      onChange={(e) => setTargetAudience(e.target.value)}
                      dir="rtl"
                      className="text-sm"
                    />
                  </div>
                  <div className="space-y-1.5 md:space-y-2">
                    <label className="text-xs md:text-sm font-medium flex items-center gap-1.5 md:gap-2 text-muted-foreground">
                      <Hash className="h-3.5 w-3.5 md:h-4 md:w-4" />
                      العدد المستهدف
                    </label>
                    <Input
                      placeholder="مثال: 100 مستفيد"
                      value={targetCount}
                      onChange={(e) => setTargetCount(e.target.value)}
                      dir="rtl"
                      className="text-sm"
                    />
                  </div>
                  <div className="space-y-1.5 md:space-y-2 sm:col-span-2 lg:col-span-1">
                    <label className="text-xs md:text-sm font-medium flex items-center gap-1.5 md:gap-2 text-muted-foreground">
                      <Clock className="h-3.5 w-3.5 md:h-4 md:w-4" />
                      المدة الزمنية
                    </label>
                    <Input
                      placeholder="مثال: 6 أشهر"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      dir="rtl"
                      className="text-sm"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
                  <span className="text-xs md:text-sm text-muted-foreground text-center sm:text-right">
                    {programDescription.length} حرف
                  </span>
                  {isAuthenticated ? (
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <Button
                        onClick={handleGenerateMultiple}
                        disabled={generateMultipleMutation.isPending || generateMutation.isPending || programDescription.trim().length < 10}
                        variant="outline"
                        size="sm"
                        className="gap-2 text-xs md:text-sm"
                      >
                        {generateMultipleMutation.isPending ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 md:h-4 md:w-4 animate-spin" />
                            <span className="hidden sm:inline">جاري التوليد...</span>
                            <span className="sm:hidden">جاري...</span>
                          </>
                        ) : (
                          <>
                            <Layers className="h-3.5 w-3.5 md:h-4 md:w-4" />
                            <span className="hidden sm:inline">توليد متعدد (3 نسخ)</span>
                            <span className="sm:hidden">3 نسخ</span>
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={handleGenerate}
                        disabled={generateMutation.isPending || generateMultipleMutation.isPending || programDescription.trim().length < 10}
                        size="sm"
                        className="gradient-primary border-0 gap-2 px-4 md:px-6 text-xs md:text-sm btn-animated"
                      >
                        {generateMutation.isPending ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 md:h-4 md:w-4 animate-spin" />
                            جاري التوليد...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-3.5 w-3.5 md:h-4 md:w-4" />
                            توليد الفكرة
                          </>
                        )}
                      </Button>
                    </div>
                  ) : (
                    <Button asChild size="sm" className="gradient-primary border-0 gap-2 px-4 md:px-6 text-xs md:text-sm btn-animated">
                      <a href={getLoginUrl()}>
                        <Sparkles className="h-3.5 w-3.5 md:h-4 md:w-4" />
                        سجل الدخول للتوليد
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Progress Indicator for Idea Generation */}
            {(generateMutation.isPending || generateMultipleMutation.isPending) && (
              <ProgressIndicator
                isGenerating={true}
                title="جاري توليد المشروع"
                icon={<Lightbulb className="h-5 w-5 text-white" />}
                stages={[
                  { label: "تحليل وصف البرنامج", duration: 3000 },
                  { label: "توليد الأفكار الإبداعية", duration: 4000 },
                  { label: "صياغة الأهداف والرؤية", duration: 3500 },
                  { label: "تحديد المخرجات والنتائج", duration: 3000 },
                  { label: "اقتراح الأسماء المناسبة", duration: 2500 },
                  { label: "المراجعة النهائية", duration: 2000 }
                ]}
              />
            )}

            {/* Results - This section is now handled by the full-screen SlideBuilder above */}
            {generatedIdea && (
              <div className="space-y-4 md:space-y-6 animate-scale-in" style={{ display: 'none' }}>
                {/* Actions Bar - Hidden, SlideBuilder takes over the entire page */}
                <div className="flex flex-col gap-3 p-3 md:p-4 bg-accent/30 rounded-xl glass-card">
                  {/* الصف الأول: رسالة النجاح وأزرار التبديل */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-primary">
                      <CheckCircle className="h-4 w-4 md:h-5 md:w-5" />
                      <span className="font-medium text-sm md:text-base">تم توليد الفكرة بنجاح</span>
                    </div>
                    {/* زر التبديل بين المحتوى التفصيلي والمختصر */}
                    <div className="flex items-center gap-1 bg-background/80 rounded-lg p-1 border border-border/50">
                      <Button
                        variant={isDetailedView ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setIsDetailedView(true)}
                        className="text-xs h-8 px-3 gap-1"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        تفصيلي
                      </Button>
                      <Button
                        variant={!isDetailedView ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setIsDetailedView(false)}
                        className="text-xs h-8 px-3 gap-1"
                      >
                        <AlignLeft className="h-3.5 w-3.5" />
                        مختصر
                      </Button>
                    </div>
                  </div>
                  {/* الصف الثاني: أزرار الإجراءات */}
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleEvaluate}
                      disabled={evaluateMutation.isPending}
                      className="gap-1 text-xs px-2"
                    >
                      {evaluateMutation.isPending ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Award className="h-3.5 w-3.5" />
                      )}
                      <span className="hidden sm:inline">تقييم</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => generatedIdea && generateKPIsMutation.mutate({ id: generatedIdea.id })}
                      disabled={generateKPIsMutation.isPending}
                      className="gap-1 text-xs px-2"
                    >
                      {generateKPIsMutation.isPending ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Gauge className="h-3.5 w-3.5" />
                      )}
                      <span className="hidden sm:inline">KPIs</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => generatedIdea && estimateBudgetMutation.mutate({ id: generatedIdea.id })}
                      disabled={estimateBudgetMutation.isPending}
                      className="gap-1 text-xs px-2"
                    >
                      {estimateBudgetMutation.isPending ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <DollarSign className="h-3.5 w-3.5" />
                      )}
                      <span className="hidden sm:inline">ميزانية</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => generatedIdea && generateSWOTMutation.mutate({ id: generatedIdea.id })}
                      disabled={generateSWOTMutation.isPending}
                      className="gap-1 text-xs px-2"
                    >
                      {generateSWOTMutation.isPending ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Grid3X3 className="h-3.5 w-3.5" />
                      )}
                      <span className="hidden sm:inline">SWOT</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => generatedIdea && generateLogFrameMutation.mutate({ id: generatedIdea.id })}
                      disabled={generateLogFrameMutation.isPending}
                      className="gap-1 text-xs px-2"
                    >
                      {generateLogFrameMutation.isPending ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Table2 className="h-3.5 w-3.5" />
                      )}
                      <span className="hidden sm:inline">إطار منطقي</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => generatedIdea && generateTimelineMutation.mutate({ id: generatedIdea.id })}
                      disabled={generateTimelineMutation.isPending}
                      className="gap-1 text-xs px-2"
                    >
                      {generateTimelineMutation.isPending ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Calendar className="h-3.5 w-3.5" />
                      )}
                      <span className="hidden sm:inline">جدول زمني</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => generatedIdea && improveIdeaMutation.mutate({ id: generatedIdea.id })}
                      disabled={improveIdeaMutation.isPending}
                      className="gap-1 text-xs px-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 hover:from-purple-500/20 hover:to-pink-500/20 border-purple-300"
                    >
                      {improveIdeaMutation.isPending ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Sparkles className="h-3.5 w-3.5 text-purple-500" />
                      )}
                      <span className="hidden sm:inline">تحسين</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => generatedIdea && generatePMDProMutation.mutate({ id: generatedIdea.id })}
                      disabled={generatePMDProMutation.isPending}
                      className="gap-1 text-xs px-2 bg-gradient-to-r from-indigo-500/10 to-violet-500/10 hover:from-indigo-500/20 hover:to-violet-500/20 border-indigo-300"
                    >
                      {generatePMDProMutation.isPending ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <FolderKanban className="h-3.5 w-3.5 text-indigo-500" />
                      )}
                      <span className="hidden sm:inline">PMDPro</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => generatedIdea && generateDesignThinkingMutation.mutate({ id: generatedIdea.id })}
                      disabled={generateDesignThinkingMutation.isPending}
                      className="gap-1 text-xs px-2 bg-gradient-to-r from-pink-500/10 to-rose-500/10 hover:from-pink-500/20 hover:to-rose-500/20 border-pink-300"
                    >
                      {generateDesignThinkingMutation.isPending ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Lightbulb className="h-3.5 w-3.5 text-pink-500" />
                      )}
                      <span className="hidden sm:inline">تفكير تصميمي</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleStartChat}
                      disabled={startConversationMutation.isPending}
                      className="gap-1 text-xs px-2 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 hover:from-blue-500/20 hover:to-cyan-500/20 border-blue-300"
                    >
                      {startConversationMutation.isPending ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <MessageCircle className="h-3.5 w-3.5 text-blue-500" />
                      )}
                      <span className="hidden sm:inline">محادثة</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => generatedIdea && generateMarketingMutation.mutate({ ideaId: generatedIdea.id })}
                      disabled={generateMarketingMutation.isPending}
                      className="gap-1 text-xs px-2 bg-gradient-to-r from-orange-500/10 to-amber-500/10 hover:from-orange-500/20 hover:to-amber-500/20 border-orange-300"
                    >
                      {generateMarketingMutation.isPending ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Megaphone className="h-3.5 w-3.5 text-orange-500" />
                      )}
                      <span className="hidden sm:inline">تسويق</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => generatedIdea && generateValueAddMutation.mutate({ ideaId: generatedIdea.id })}
                      disabled={generateValueAddMutation.isPending}
                      className="gap-1 text-xs px-2 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 hover:from-emerald-500/20 hover:to-teal-500/20 border-emerald-300"
                    >
                      {generateValueAddMutation.isPending ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
                      )}
                      <span className="hidden sm:inline">القيمة المضافة</span>
                    </Button>
                    <Button variant="outline" size="sm" onClick={copyAllContent} className="gap-1 text-xs px-2">
                      <Copy className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">نسخ</span>
                    </Button>
                    <Button variant="outline" size="sm" onClick={downloadAsText} className="gap-1 text-xs px-2">
                      <Download className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">TXT</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={downloadAsPDF} 
                      disabled={isExportingPDF}
                      className="gap-1 text-xs px-2"
                    >
                      {isExportingPDF ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <FileDown className="h-3.5 w-3.5" />
                      )}
                      <span className="hidden sm:inline">PDF</span>
                    </Button>

                  </div>
                </div>

                {/* Content Sections */}
                <div className="grid gap-4">
                  {sections.map((section, index) => (
                    <Card 
                      key={section.key}
                      id={`section-${section.key}`}
                      className="card-hover border-0 shadow-md overflow-hidden glass glass-shine glass-glow scroll-mt-24"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <section.icon className={`h-5 w-5 ${section.color}`} />
                            {section.title}
                          </CardTitle>
                          <div className="flex items-center gap-1">
                            {/* زر تبديل نوع المخرجات (كمية/نوعية) */}
                            {section.key === 'outputs' && (
                              <div className="flex items-center gap-1 ml-2 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
                                <Button
                                  variant={outputsType === 'quantitative' ? 'default' : 'ghost'}
                                  size="sm"
                                  onClick={() => setOutputsType('quantitative')}
                                  className={`h-7 px-2 text-xs ${outputsType === 'quantitative' ? 'gradient-primary border-0' : ''}`}
                                >
                                  كمية
                                </Button>
                                <Button
                                  variant={outputsType === 'qualitative' ? 'default' : 'ghost'}
                                  size="sm"
                                  onClick={() => setOutputsType('qualitative')}
                                  className={`h-7 px-2 text-xs ${outputsType === 'qualitative' ? 'gradient-primary border-0' : ''}`}
                                >
                                  نوعية
                                </Button>
                              </div>
                            )}
                            {editingSection !== section.key && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleStartEdit(section.key, section.content)}
                                  className="h-8 w-8 p-0"
                                  title="تعديل"
                                >
                                  <Edit3 className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRegenerate(section.key)}
                                  disabled={regeneratingSection === section.key}
                                  className="h-8 w-8 p-0"
                                  title="إعادة توليد"
                                >
                                  {regeneratingSection === section.key ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <RefreshCw className="h-4 w-4" />
                                  )}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyToClipboard(section.content, section.title)}
                                  className="h-8 w-8 p-0"
                                  title="نسخ"
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {editingSection === section.key ? (
                          <div className="space-y-3">
                            <Textarea
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                              className="min-h-[150px] text-base resize-none"
                              dir="rtl"
                            />
                            <div className="flex items-center gap-2 justify-end">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={handleCancelEdit}
                                className="gap-2"
                              >
                                <X className="h-4 w-4" />
                                إلغاء
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleSaveEdit(section.key)}
                                disabled={updateMutation.isPending}
                                className="gap-2 gradient-primary border-0"
                              >
                                {updateMutation.isPending ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Save className="h-4 w-4" />
                                )}
                                حفظ
                              </Button>
                            </div>
                          </div>
                        ) : section.key === 'proposedNames' && generatedIdea.proposedNames ? (
                          <div className="space-y-4">
                            {/* عرض الاسم الرسمي المختار إن وجد */}
                            {generatedIdea.selectedName && (
                              <div className="p-4 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30 rounded-xl border-2 border-amber-400 dark:border-amber-600 shadow-md">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-full">
                                      <Crown className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                    </div>
                                    <div>
                                      <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">الاسم الرسمي للمبادرة</p>
                                      <p className="text-lg font-bold text-amber-900 dark:text-amber-100">{generatedIdea.selectedName}</p>
                                    </div>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => clearSelectedNameMutation.mutate({ id: generatedIdea.id })}
                                    disabled={clearSelectedNameMutation.isPending}
                                    className="text-amber-600 hover:text-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/30"
                                  >
                                    {clearSelectedNameMutation.isPending ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <X className="h-4 w-4" />
                                    )}
                                  </Button>
                                </div>
                              </div>
                            )}
                            
                            {/* عرض الأسماء المقترحة */}
                            <div className="grid grid-cols-1 gap-2">
                              {(() => {
                                const names = typeof generatedIdea.proposedNames === 'string' 
                                  ? JSON.parse(generatedIdea.proposedNames) 
                                  : generatedIdea.proposedNames;
                                return (names as string[]).map((name: string, idx: number) => {
                                  const isSelected = generatedIdea.selectedName === name;
                                  return (
                                    <div 
                                      key={idx} 
                                      className={`p-3 rounded-lg border transition-all cursor-pointer group ${
                                        isSelected 
                                          ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-400 dark:border-green-600 shadow-md' 
                                          : 'bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border-purple-200 dark:border-purple-800 hover:border-purple-400 dark:hover:border-purple-600 hover:shadow-sm'
                                      }`}
                                      onClick={() => {
                                        if (!isSelected && !selectNameMutation.isPending) {
                                          selectNameMutation.mutate({ id: generatedIdea.id, selectedName: name });
                                        }
                                      }}
                                    >
                                      <div className="flex items-center justify-between">
                                        <p className={`text-sm font-medium ${
                                          isSelected 
                                            ? 'text-green-900 dark:text-green-100' 
                                            : 'text-purple-900 dark:text-purple-100'
                                        }`}>{name}</p>
                                        <div className="flex items-center gap-2">
                                          {isSelected ? (
                                            <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-medium">
                                              <Check className="h-4 w-4" />
                                              مختار
                                            </span>
                                          ) : (
                                            <span className="text-xs text-purple-500 dark:text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                              انقر للاختيار
                                            </span>
                                          )}
                                        </div>
      </div>

      {/* JSON Editor Modal */}
      <JSONEditorModal
        isOpen={jsonEditorOpen}
        onClose={() => setJsonEditorOpen(false)}
        title={jsonEditorTitle}
        data={jsonEditorData}
        onSave={(updatedData) => {
          if (jsonEditorSaveHandler) {
            jsonEditorSaveHandler(updatedData);
          }
        }}
      />
    </div>
  );
});
                              })()}
                            </div>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRegenerate('proposedNames')}
                              disabled={regeneratingSection === 'proposedNames'}
                              className="w-full gap-2 border-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/20"
                            >
                              {regeneratingSection === 'proposedNames' ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Sparkles className="h-4 w-4" />
                              )}
                              اقتراح المزيد
                            </Button>
                          </div>
                        ) : (
                          <p className="text-foreground leading-relaxed whitespace-pre-line">
                            {isDetailedView 
                              ? section.content 
                              : section.content.split('\n').slice(0, 3).join('\n') + (section.content.split('\n').length > 3 ? '...' : '')
                            }
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* عرض التقييم - منهجية احترافية */}
                {showEvaluation && evaluation && (
                  <Card className="border-0 shadow-lg overflow-hidden card-3d glass glass-card-enhanced">
                    <CardHeader className="bg-gradient-to-l from-amber-500 to-yellow-500 text-white">
                      <CardTitle className="flex items-center gap-2">
                        <Award className="h-5 w-5" />
                        {evaluation.methodology || 'تقييم جودة الفكرة'}
                      </CardTitle>
                      <CardDescription className="text-white/80">
                        تقييم شامل وفق معايير SMART + تحليل الجدوى + الأثر الاجتماعي
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                      {/* التقييم العام والتقدير */}
                      <div className="text-center space-y-3">
                        <div className="inline-flex items-center justify-center w-28 h-28 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 mb-3 relative">
                          <span className="text-4xl font-bold text-primary">{evaluation.overallScore}</span>
                          <span className="absolute -bottom-1 text-xs bg-primary text-white px-2 py-0.5 rounded-full">
                            {evaluation.grade || 'جيد'}
                          </span>
                        </div>
                        <p className="text-lg font-medium">التقييم العام</p>
                        <p className="text-sm text-muted-foreground">من 100 نقطة</p>
                        {evaluation.readinessLevel && (
                          <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                            evaluation.readinessLevel === 'جاهز' ? 'bg-green-100 text-green-700' :
                            evaluation.readinessLevel === 'يحتاج تعديلات بسيطة' ? 'bg-blue-100 text-blue-700' :
                            evaluation.readinessLevel === 'يحتاج مراجعة' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            <Activity className="h-3 w-3" />
                            {evaluation.readinessLevel}
                          </div>
                        )}
                      </div>

                      {/* فئات التقييم الخمس */}
                      {evaluation.categories && evaluation.categories.length > 0 && (
                        <div className="space-y-4">
                          <h4 className="font-semibold flex items-center gap-2">
                            <BarChart3 className="h-4 w-4" />
                            فئات التقييم
                          </h4>
                          {evaluation.categories.map((category: any, catIdx: number) => (
                            <div key={catIdx} className="bg-accent/20 rounded-lg p-4 space-y-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold">{category.name}</span>
                                  <span className="text-xs bg-muted px-2 py-0.5 rounded">وزن: {category.weight}%</span>
                                </div>
                                <span className={`font-bold text-lg ${category.score >= 70 ? 'text-green-600' : category.score >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                                  {category.score}/100
                                </span>
                              </div>
                              <div className="w-full bg-muted rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full transition-all ${category.score >= 70 ? 'bg-green-500' : category.score >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                  style={{ width: `${category.score}%` }}
                                />
                              </div>
                              {/* المعايير الفرعية */}
                              {category.criteria && category.criteria.length > 0 && (
                                <div className="grid gap-2 mt-2 pr-4">
                                  {category.criteria.map((criterion: any, critIdx: number) => (
                                    <div key={critIdx} className="bg-background/50 rounded p-2">
                                      <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm">{criterion.name}</span>
                                        <span className={`text-sm font-medium ${criterion.score >= 70 ? 'text-green-600' : criterion.score >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                                          {criterion.score}%
                                        </span>
                                      </div>
                                      <p className="text-xs text-muted-foreground">{criterion.feedback}</p>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* المعايير القديمة (للتوافق مع البيانات السابقة) */}
                      {evaluation.criteria && !evaluation.categories && (
                        <div className="grid gap-3">
                          <h4 className="font-semibold flex items-center gap-2">
                            <BarChart3 className="h-4 w-4" />
                            معايير التقييم
                          </h4>
                          {evaluation.criteria.map((criterion: any, idx: number) => (
                            <div key={idx} className="bg-accent/30 rounded-lg p-3">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium">{criterion.name}</span>
                                <span className={`font-bold ${criterion.score >= 70 ? 'text-green-600' : criterion.score >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                                  {criterion.score}/100
                                </span>
                              </div>
                              <div className="w-full bg-muted rounded-full h-2 mb-2">
                                <div 
                                  className={`h-2 rounded-full ${criterion.score >= 70 ? 'bg-green-500' : criterion.score >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                  style={{ width: `${criterion.score}%` }}
                                />
                              </div>
                              <p className="text-sm text-muted-foreground">{criterion.feedback}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* نقاط القوة */}
                      <div>
                        <h4 className="font-semibold flex items-center gap-2 mb-3">
                          <ThumbsUp className="h-4 w-4 text-green-600" />
                          نقاط القوة
                        </h4>
                        <ul className="space-y-2">
                          {evaluation.strengths?.map((strength: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2 text-sm">
                              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                              {strength}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* اقتراحات التحسين */}
                      <div>
                        <h4 className="font-semibold flex items-center gap-2 mb-3">
                          <AlertCircle className="h-4 w-4 text-amber-600" />
                          اقتراحات التحسين
                        </h4>
                        <ul className="space-y-2">
                          {evaluation.improvements?.map((improvement: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2 text-sm">
                              <TrendingUp className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                              {improvement}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* توصيات الخبراء */}
                      {evaluation.recommendations && evaluation.recommendations.length > 0 && (
                        <div>
                          <h4 className="font-semibold flex items-center gap-2 mb-3">
                            <Lightbulb className="h-4 w-4 text-blue-600" />
                            توصيات الخبراء
                          </h4>
                          <ul className="space-y-2">
                            {evaluation.recommendations.map((rec: string, idx: number) => (
                              <li key={idx} className="flex items-start gap-2 text-sm bg-blue-50 p-2 rounded">
                                <Star className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* الملخص */}
                      <div className="bg-accent/50 rounded-lg p-4">
                        <h4 className="font-semibold mb-2">ملخص التقييم</h4>
                        <p className="text-sm leading-relaxed">{evaluation.summary}</p>
                      </div>

                      <Button 
                        variant="outline" 
                        onClick={() => setShowEvaluation(false)}
                        className="w-full"
                      >
                        <X className="h-4 w-4 ml-2" />
                        إغلاق التقييم
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* عرض مؤشرات KPIs */}
                {showKPIs && kpisData && (
                  <EditableKPIs
                    data={kpisData}
                    onSave={(updatedData) => {
                      setKpisData(updatedData);
                      toast.success("تم حفظ مؤشرات الأداء");
                    }}
                    onClose={() => setShowKPIs(false)}
                  />
                )}

                {/* عرض تقدير الميزانية */}
                {showBudget && budgetData && (
                  <EditableBudget
                    data={budgetData}
                    onSave={(updatedData) => {
                      setBudgetData(updatedData);
                      toast.success("تم حفظ الميزانية");
                    }}
                    onClose={() => setShowBudget(false)}
                  />
                )}

                {/* عرض تحليل SWOT */}
                {showSWOT && swotData && (
                  <EditableSWOT
                    data={swotData}
                    onSave={(updatedData) => {
                      setSwotData(updatedData);
                      toast.success("تم حفظ تحليل SWOT");
                    }}
                    onClose={() => setShowSWOT(false)}
                  />
                )}

                {/* عرض الإطار المنطقي */}
                {showLogFrame && logFrameData && (
                  <Card className="border-0 shadow-lg overflow-hidden card-3d glass glass-card-enhanced">
                    <CardHeader className="bg-gradient-to-l from-teal-600 to-cyan-600 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <Table2 className="h-5 w-5" />
                            الإطار المنطقي (Logical Framework)
                          </CardTitle>
                          <CardDescription className="text-white/80">
                            مصفوفة الإطار المنطقي للمشروع
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            onClick={() => openJSONEditor(
                              "الإطار المنطقي",
                              logFrameData,
                              (updatedData) => {
                                setLogFrameData(updatedData);
                                toast.success("تم حفظ الإطار المنطقي");
                              }
                            )}
                            className="gap-1"
                          >
                            <Edit3 className="h-4 w-4" />
                            تعديل
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                      {/* الهدف العام */}
                      <div className="bg-teal-50 rounded-xl p-4 border border-teal-200">
                        <h4 className="font-bold text-teal-700 flex items-center gap-2 mb-3">
                          <Target className="h-4 w-4" />
                          الهدف العام (Goal)
                        </h4>
                        {editingLogFrame && logFrameEditData ? (
                          <Textarea
                            value={logFrameEditData.goal?.narrative || ''}
                            onChange={(e) => updateLogFrameField('goal', 'narrative', e.target.value)}
                            className="mb-3 text-sm"
                            rows={2}
                          />
                        ) : (
                          <p className="text-sm font-medium mb-3">{logFrameData.goal?.narrative}</p>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                          <div className="bg-white/50 rounded-lg p-2">
                            <span className="font-semibold text-teal-700">المؤشرات:</span>
                            {editingLogFrame && logFrameEditData ? (
                              <div className="mt-1 space-y-1">
                                {logFrameEditData.goal?.indicators?.map((ind: string, idx: number) => (
                                  <div key={idx} className="flex gap-1">
                                    <Input
                                      value={ind}
                                      onChange={(e) => updateArrayItem('goal', 'indicators', idx, e.target.value)}
                                      className="h-7 text-xs"
                                    />
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeArrayItem('goal', 'indicators', idx)}
                                      className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </div>
                                ))}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => addArrayItem('goal', 'indicators')}
                                  className="h-6 text-xs text-teal-600"
                                >
                                  + إضافة مؤشر
                                </Button>
                              </div>
                            ) : (
                              <ul className="mt-1 space-y-1">
                                {logFrameData.goal?.indicators?.map((ind: string, idx: number) => (
                                  <li key={idx}>• {ind}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                          <div className="bg-white/50 rounded-lg p-2">
                            <span className="font-semibold text-teal-700">وسائل التحقق:</span>
                            {editingLogFrame && logFrameEditData ? (
                              <div className="mt-1 space-y-1">
                                {logFrameEditData.goal?.verification?.map((ver: string, idx: number) => (
                                  <div key={idx} className="flex gap-1">
                                    <Input
                                      value={ver}
                                      onChange={(e) => updateArrayItem('goal', 'verification', idx, e.target.value)}
                                      className="h-7 text-xs"
                                    />
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeArrayItem('goal', 'verification', idx)}
                                      className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </div>
                                ))}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => addArrayItem('goal', 'verification')}
                                  className="h-6 text-xs text-teal-600"
                                >
                                  + إضافة وسيلة
                                </Button>
                              </div>
                            ) : (
                              <ul className="mt-1 space-y-1">
                                {logFrameData.goal?.verification?.map((ver: string, idx: number) => (
                                  <li key={idx}>• {ver}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                          <div className="bg-white/50 rounded-lg p-2">
                            <span className="font-semibold text-teal-700">الافتراضات:</span>
                            {editingLogFrame && logFrameEditData ? (
                              <div className="mt-1 space-y-1">
                                {logFrameEditData.goal?.assumptions?.map((ass: string, idx: number) => (
                                  <div key={idx} className="flex gap-1">
                                    <Input
                                      value={ass}
                                      onChange={(e) => updateArrayItem('goal', 'assumptions', idx, e.target.value)}
                                      className="h-7 text-xs"
                                    />
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeArrayItem('goal', 'assumptions', idx)}
                                      className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </div>
                                ))}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => addArrayItem('goal', 'assumptions')}
                                  className="h-6 text-xs text-teal-600"
                                >
                                  + إضافة افتراض
                                </Button>
                              </div>
                            ) : (
                              <ul className="mt-1 space-y-1">
                                {logFrameData.goal?.assumptions?.map((ass: string, idx: number) => (
                                  <li key={idx}>• {ass}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* الغرض */}
                      <div className="bg-cyan-50 rounded-xl p-4 border border-cyan-200">
                        <h4 className="font-bold text-cyan-700 flex items-center gap-2 mb-3">
                          <Crosshair className="h-4 w-4" />
                          الغرض / الهدف المباشر (Purpose)
                        </h4>
                        {editingLogFrame && logFrameEditData ? (
                          <Textarea
                            value={logFrameEditData.purpose?.narrative || ''}
                            onChange={(e) => updateLogFrameField('purpose', 'narrative', e.target.value)}
                            className="mb-3 text-sm"
                            rows={2}
                          />
                        ) : (
                          <p className="text-sm font-medium mb-3">{logFrameData.purpose?.narrative}</p>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                          <div className="bg-white/50 rounded-lg p-2">
                            <span className="font-semibold text-cyan-700">المؤشرات:</span>
                            {editingLogFrame && logFrameEditData ? (
                              <div className="mt-1 space-y-1">
                                {logFrameEditData.purpose?.indicators?.map((ind: string, idx: number) => (
                                  <div key={idx} className="flex gap-1">
                                    <Input
                                      value={ind}
                                      onChange={(e) => updateArrayItem('purpose', 'indicators', idx, e.target.value)}
                                      className="h-7 text-xs"
                                    />
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeArrayItem('purpose', 'indicators', idx)}
                                      className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </div>
                                ))}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => addArrayItem('purpose', 'indicators')}
                                  className="h-6 text-xs text-cyan-600"
                                >
                                  + إضافة مؤشر
                                </Button>
                              </div>
                            ) : (
                              <ul className="mt-1 space-y-1">
                                {logFrameData.purpose?.indicators?.map((ind: string, idx: number) => (
                                  <li key={idx}>• {ind}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                          <div className="bg-white/50 rounded-lg p-2">
                            <span className="font-semibold text-cyan-700">وسائل التحقق:</span>
                            {editingLogFrame && logFrameEditData ? (
                              <div className="mt-1 space-y-1">
                                {logFrameEditData.purpose?.verification?.map((ver: string, idx: number) => (
                                  <div key={idx} className="flex gap-1">
                                    <Input
                                      value={ver}
                                      onChange={(e) => updateArrayItem('purpose', 'verification', idx, e.target.value)}
                                      className="h-7 text-xs"
                                    />
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeArrayItem('purpose', 'verification', idx)}
                                      className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </div>
                                ))}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => addArrayItem('purpose', 'verification')}
                                  className="h-6 text-xs text-cyan-600"
                                >
                                  + إضافة وسيلة
                                </Button>
                              </div>
                            ) : (
                              <ul className="mt-1 space-y-1">
                                {logFrameData.purpose?.verification?.map((ver: string, idx: number) => (
                                  <li key={idx}>• {ver}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                          <div className="bg-white/50 rounded-lg p-2">
                            <span className="font-semibold text-cyan-700">الافتراضات:</span>
                            {editingLogFrame && logFrameEditData ? (
                              <div className="mt-1 space-y-1">
                                {logFrameEditData.purpose?.assumptions?.map((ass: string, idx: number) => (
                                  <div key={idx} className="flex gap-1">
                                    <Input
                                      value={ass}
                                      onChange={(e) => updateArrayItem('purpose', 'assumptions', idx, e.target.value)}
                                      className="h-7 text-xs"
                                    />
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeArrayItem('purpose', 'assumptions', idx)}
                                      className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </div>
                                ))}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => addArrayItem('purpose', 'assumptions')}
                                  className="h-6 text-xs text-cyan-600"
                                >
                                  + إضافة افتراض
                                </Button>
                              </div>
                            ) : (
                              <ul className="mt-1 space-y-1">
                                {logFrameData.purpose?.assumptions?.map((ass: string, idx: number) => (
                                  <li key={idx}>• {ass}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* المخرجات */}
                      <div>
                        <h4 className="font-semibold flex items-center gap-2 mb-3">
                          <Package className="h-4 w-4 text-teal-600" />
                          المخرجات (Outputs)
                        </h4>
                        <div className="space-y-3">
                          {(editingLogFrame ? logFrameEditData?.outputs : logFrameData.outputs)?.map((output: any, idx: number) => (
                            <div key={idx} className="bg-accent/30 rounded-lg p-4">
                              {editingLogFrame && logFrameEditData ? (
                                <Textarea
                                  value={output.narrative}
                                  onChange={(e) => updateLogFrameField('outputs', 'narrative', e.target.value, idx)}
                                  className="mb-2 text-sm font-medium"
                                  rows={2}
                                />
                              ) : (
                                <p className="font-medium text-sm mb-2">{idx + 1}. {output.narrative}</p>
                              )}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                                <div>
                                  <span className="font-semibold">المؤشرات:</span>
                                  {editingLogFrame && logFrameEditData ? (
                                    <div className="mt-1 space-y-1">
                                      {output.indicators?.map((ind: string, i: number) => (
                                        <div key={i} className="flex gap-1">
                                          <Input
                                            value={ind}
                                            onChange={(e) => updateArrayItem('outputs', 'indicators', i, e.target.value, idx)}
                                            className="h-7 text-xs"
                                          />
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeArrayItem('outputs', 'indicators', i, idx)}
                                            className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
                                          >
                                            <X className="h-3 w-3" />
                                          </Button>
                                        </div>
                                      ))}
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => addArrayItem('outputs', 'indicators', idx)}
                                        className="h-6 text-xs text-teal-600"
                                      >
                                        + إضافة
                                      </Button>
                                    </div>
                                  ) : (
                                    <ul className="mt-1">
                                      {output.indicators?.map((ind: string, i: number) => (
                                        <li key={i}>• {ind}</li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                                <div>
                                  <span className="font-semibold">وسائل التحقق:</span>
                                  {editingLogFrame && logFrameEditData ? (
                                    <div className="mt-1 space-y-1">
                                      {output.verification?.map((ver: string, i: number) => (
                                        <div key={i} className="flex gap-1">
                                          <Input
                                            value={ver}
                                            onChange={(e) => updateArrayItem('outputs', 'verification', i, e.target.value, idx)}
                                            className="h-7 text-xs"
                                          />
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeArrayItem('outputs', 'verification', i, idx)}
                                            className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
                                          >
                                            <X className="h-3 w-3" />
                                          </Button>
                                        </div>
                                      ))}
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => addArrayItem('outputs', 'verification', idx)}
                                        className="h-6 text-xs text-teal-600"
                                      >
                                        + إضافة
                                      </Button>
                                    </div>
                                  ) : (
                                    <ul className="mt-1">
                                      {output.verification?.map((ver: string, i: number) => (
                                        <li key={i}>• {ver}</li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                                <div>
                                  <span className="font-semibold">الافتراضات:</span>
                                  {editingLogFrame && logFrameEditData ? (
                                    <div className="mt-1 space-y-1">
                                      {output.assumptions?.map((ass: string, i: number) => (
                                        <div key={i} className="flex gap-1">
                                          <Input
                                            value={ass}
                                            onChange={(e) => updateArrayItem('outputs', 'assumptions', i, e.target.value, idx)}
                                            className="h-7 text-xs"
                                          />
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeArrayItem('outputs', 'assumptions', i, idx)}
                                            className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
                                          >
                                            <X className="h-3 w-3" />
                                          </Button>
                                        </div>
                                      ))}
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => addArrayItem('outputs', 'assumptions', idx)}
                                        className="h-6 text-xs text-teal-600"
                                      >
                                        + إضافة
                                      </Button>
                                    </div>
                                  ) : (
                                    <ul className="mt-1">
                                      {output.assumptions?.map((ass: string, i: number) => (
                                        <li key={i}>• {ass}</li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* الأنشطة */}
                      <div>
                        <h4 className="font-semibold flex items-center gap-2 mb-3">
                          <Activity className="h-4 w-4 text-teal-600" />
                          الأنشطة (Activities)
                        </h4>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="bg-teal-100">
                                <th className="p-2 text-right">النشاط</th>
                                <th className="p-2 text-right">المدخلات</th>
                                <th className="p-2 text-right">الإطار الزمني</th>
                                <th className="p-2 text-right">المسؤول</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(editingLogFrame ? logFrameEditData?.activities : logFrameData.activities)?.map((activity: any, idx: number) => (
                                <tr key={idx} className="border-b">
                                  <td className="p-2">
                                    {editingLogFrame && logFrameEditData ? (
                                      <Textarea
                                        value={activity.narrative}
                                        onChange={(e) => updateLogFrameField('activities', 'narrative', e.target.value, idx)}
                                        className="text-xs"
                                        rows={2}
                                      />
                                    ) : (
                                      activity.narrative
                                    )}
                                  </td>
                                  <td className="p-2">
                                    {editingLogFrame && logFrameEditData ? (
                                      <div className="space-y-1">
                                        {activity.inputs?.map((inp: string, i: number) => (
                                          <div key={i} className="flex gap-1">
                                            <Input
                                              value={inp}
                                              onChange={(e) => updateArrayItem('activities', 'inputs', i, e.target.value, idx)}
                                              className="h-7 text-xs"
                                            />
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => removeArrayItem('activities', 'inputs', i, idx)}
                                              className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
                                            >
                                              <X className="h-3 w-3" />
                                            </Button>
                                          </div>
                                        ))}
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => addArrayItem('activities', 'inputs', idx)}
                                          className="h-6 text-xs text-teal-600"
                                        >
                                          + إضافة
                                        </Button>
                                      </div>
                                    ) : (
                                      <ul>
                                        {activity.inputs?.map((inp: string, i: number) => (
                                          <li key={i}>• {inp}</li>
                                        ))}
                                      </ul>
                                    )}
                                  </td>
                                  <td className="p-2">
                                    {editingLogFrame && logFrameEditData ? (
                                      <Input
                                        value={activity.timeframe}
                                        onChange={(e) => updateLogFrameField('activities', 'timeframe', e.target.value, idx)}
                                        className="h-7 text-xs"
                                      />
                                    ) : (
                                      activity.timeframe
                                    )}
                                  </td>
                                  <td className="p-2">
                                    {editingLogFrame && logFrameEditData ? (
                                      <Input
                                        value={activity.responsible}
                                        onChange={(e) => updateLogFrameField('activities', 'responsible', e.target.value, idx)}
                                        className="h-7 text-xs"
                                      />
                                    ) : (
                                      activity.responsible
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* الملخص */}
                      <div className="bg-gradient-to-l from-teal-50 to-cyan-50 rounded-lg p-4 border border-teal-200">
                        {editingLogFrame && logFrameEditData ? (
                          <Textarea
                            value={logFrameEditData.summary || ''}
                            onChange={(e) => updateLogFrameField('summary', '', e.target.value)}
                            className="text-sm"
                            rows={3}
                          />
                        ) : (
                          <p className="text-sm text-teal-800">{logFrameData.summary}</p>
                        )}
                      </div>

                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setShowLogFrame(false);
                          setEditingLogFrame(false);
                        }}
                        className="w-full"
                      >
                        <X className="h-4 w-4 ml-2" />
                        إغلاق الإطار المنطقي
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* عرض الجدول الزمني */}
                {showTimeline && timelineData && (
                  <Card className="border-0 shadow-lg overflow-hidden card-3d glass glass-card-enhanced">
                    <CardHeader className="bg-gradient-to-l from-indigo-600 to-blue-600 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            الجدول الزمني التفصيلي
                          </CardTitle>
                          <CardDescription className="text-white/80">
                            خطة تنفيذية شاملة بالمراحل والأنشطة والمسؤوليات
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          {/* أزرار التبديل بين العرض */}
                          <div className="flex bg-white/20 rounded-lg p-0.5">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowGanttChart(false)}
                              className={`text-white hover:bg-white/30 ${!showGanttChart ? 'bg-white/30' : ''}`}
                            >
                              <Table2 className="h-4 w-4 ml-1" />
                              جدول
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowGanttChart(true)}
                              className={`text-white hover:bg-white/30 ${showGanttChart ? 'bg-white/30' : ''}`}
                            >
                              <BarChart2 className="h-4 w-4 ml-1" />
                              جانت
                            </Button>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={async () => {
                              const { exportGanttToPDF } = await import('@/lib/exportMethodologyPDF');
                              await exportGanttToPDF(timelineData, generatedIdea?.programDescription || 'مشروع');
                              toast.success('تم تصدير PDF بنجاح');
                            }}
                            className="text-white hover:bg-white/20 gap-2"
                          >
                            <Download className="h-4 w-4" />
                            تصدير PDF
                          </Button>
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            onClick={() => openJSONEditor(
                              "الجدول الزمني",
                              timelineData,
                              (updatedData) => {
                                setTimelineData(updatedData);
                                toast.success("تم حفظ الجدول الزمني");
                              }
                            )}
                            className="gap-1"
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowTimeline(false)}
                            className="text-white hover:bg-white/20"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                      {/* عرض مخطط جانت */}
                      {showGanttChart ? (
                        <>
                          <GanttChart data={timelineData} />
                          
                          {/* المسار الحرج */}
                          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <h4 className="font-semibold text-red-700 flex items-center gap-2 mb-2">
                              <AlertTriangle className="h-4 w-4" />
                              المسار الحرج (Critical Path)
                            </h4>
                            <p className="text-sm text-red-800">{timelineData.criticalPath}</p>
                          </div>

                          <Button 
                            variant="outline" 
                            onClick={() => setShowTimeline(false)}
                            className="w-full"
                          >
                            <X className="h-4 w-4 ml-2" />
                            إغلاق الجدول الزمني
                          </Button>
                        </>
                      ) : (
                        <>
                          {/* ملخص الخطة */}
                          <div className="bg-gradient-to-l from-indigo-50 to-blue-50 rounded-lg p-4">
                            <h4 className="font-semibold text-indigo-700 mb-2">ملخص الخطة التنفيذية</h4>
                            <p className="text-sm text-indigo-800">{timelineData.summary}</p>
                            <div className="mt-3 flex flex-wrap gap-4 text-xs">
                              <div className="bg-white rounded-lg px-3 py-2">
                                <span className="text-gray-500">المدة الإجمالية:</span>
                                <span className="font-semibold text-indigo-600 mr-1">{timelineData.totalDuration}</span>
                              </div>
                              <div className="bg-white rounded-lg px-3 py-2">
                                <span className="text-gray-500">عدد المراحل:</span>
                                <span className="font-semibold text-indigo-600 mr-1">{timelineData.phases?.length || 0}</span>
                              </div>
                            </div>
                          </div>

                          {/* المسار الحرج */}
                          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <h4 className="font-semibold text-red-700 flex items-center gap-2 mb-2">
                              <AlertTriangle className="h-4 w-4" />
                              المسار الحرج (Critical Path)
                            </h4>
                            <p className="text-sm text-red-800">{timelineData.criticalPath}</p>
                          </div>

                          {/* المراحل */}
                          <div>
                            <h4 className="font-semibold flex items-center gap-2 mb-4">
                              <ClipboardList className="h-4 w-4 text-indigo-600" />
                              مراحل التنفيذ
                            </h4>
                            <div className="space-y-4">
                              {timelineData.phases?.map((phase: any, idx: number) => (
                                <div key={idx} className="border rounded-lg overflow-hidden">
                                  <div className="bg-gradient-to-l from-indigo-100 to-blue-100 p-3">
                                    <div className="flex items-center justify-between">
                                      <h5 className="font-semibold text-indigo-800">
                                        {idx + 1}. {phase.name}
                                      </h5>
                                      <div className="flex gap-2 text-xs">
                                        <span className="bg-white rounded px-2 py-1">
                                          المدة: {phase.duration}
                                        </span>
                                        <span className="bg-indigo-200 text-indigo-800 rounded px-2 py-1">
                                          الأسبوع {phase.startWeek} - {phase.endWeek}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="p-3">
                                    <table className="w-full text-xs">
                                      <thead>
                                        <tr className="bg-gray-50">
                                          <th className="text-right p-2 border">النشاط</th>
                                          <th className="text-right p-2 border">الوصف</th>
                                          <th className="text-right p-2 border">المسؤول</th>
                                          <th className="text-right p-2 border">المخرجات</th>
                                          <th className="text-right p-2 border">الاعتماديات</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {phase.activities?.map((activity: any, aIdx: number) => (
                                          <tr key={aIdx} className="hover:bg-gray-50">
                                            <td className="p-2 border font-medium">{activity.name}</td>
                                            <td className="p-2 border text-gray-600">{activity.description}</td>
                                            <td className="p-2 border">
                                              <span className="bg-blue-100 text-blue-800 rounded px-2 py-0.5">
                                                {activity.responsible}
                                              </span>
                                            </td>
                                            <td className="p-2 border text-gray-600">{activity.deliverables}</td>
                                            <td className="p-2 border text-gray-500">{activity.dependencies || '-'}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* المعالم الرئيسية */}
                          <div>
                            <h4 className="font-semibold flex items-center gap-2 mb-3">
                              <Award className="h-4 w-4 text-amber-600" />
                              المعالم الرئيسية (Milestones)
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {timelineData.milestones?.map((milestone: any, idx: number) => (
                                <div key={idx} className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="font-semibold text-amber-800">{milestone.name}</span>
                                    <span className="bg-amber-200 text-amber-800 text-xs rounded px-2 py-0.5">
                                      الأسبوع {milestone.week}
                                    </span>
                                  </div>
                                  <p className="text-xs text-amber-700">{milestone.description}</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          <Button 
                            variant="outline" 
                            onClick={() => setShowTimeline(false)}
                            className="w-full"
                          >
                            <X className="h-4 w-4 ml-2" />
                            إغلاق الجدول الزمني
                          </Button>
                        </>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* عرض تحسينات الفكرة */}
                {showImprovements && improvementsData && (
                  <Card className="border-0 shadow-lg overflow-hidden card-3d glass glass-card-enhanced">
                    <CardHeader className="bg-gradient-to-l from-purple-600 to-pink-600 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5" />
                            تحسين الفكرة
                          </CardTitle>
                          <CardDescription className="text-white/80">
                            تحليل وتطوير بناءً على أفضل الممارسات العالمية
                          </CardDescription>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowImprovements(false)}
                          className="text-white hover:bg-white/20"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                      {/* التقييم العام */}
                      <div className="bg-gradient-to-l from-purple-50 to-pink-50 rounded-lg p-4">
                        <h4 className="font-semibold text-purple-700 mb-2">التقييم العام</h4>
                        <p className="text-sm text-purple-800">{improvementsData.overallAssessment}</p>
                      </div>

                      {/* الرؤية والأهداف المحسنة */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <h4 className="font-semibold text-green-700 flex items-center gap-2 mb-2">
                            <Eye className="h-4 w-4" />
                            الرؤية المحسنة
                          </h4>
                          <p className="text-sm text-green-800">{improvementsData.improvedVision}</p>
                        </div>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <h4 className="font-semibold text-blue-700 flex items-center gap-2 mb-2">
                            <Target className="h-4 w-4" />
                            الأهداف المحسنة
                          </h4>
                          <p className="text-sm text-blue-800">{improvementsData.improvedObjectives}</p>
                        </div>
                      </div>

                      {/* التحسينات المقترحة */}
                      <div>
                        <h4 className="font-semibold flex items-center gap-2 mb-3">
                          <TrendingUp className="h-4 w-4 text-purple-600" />
                          التحسينات المقترحة
                        </h4>
                        <div className="space-y-3">
                          {improvementsData.improvements?.map((imp: any, idx: number) => (
                            <div key={idx} className="border rounded-lg p-4">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-semibold text-purple-800">{imp.area}</span>
                                <span className={`text-xs rounded px-2 py-0.5 ${
                                  imp.priority === 'عالية' ? 'bg-red-100 text-red-800' :
                                  imp.priority === 'متوسطة' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-green-100 text-green-800'
                                }`}>
                                  أولوية {imp.priority}
                                </span>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                <div>
                                  <span className="text-gray-500">الوضع الحالي:</span>
                                  <p className="text-gray-700">{imp.currentState}</p>
                                </div>
                                <div>
                                  <span className="text-purple-500">التحسين المقترح:</span>
                                  <p className="text-purple-700 font-medium">{imp.suggestion}</p>
                                </div>
                              </div>
                              <div className="mt-2 bg-purple-50 rounded p-2">
                                <span className="text-xs text-purple-600">الأثر المتوقع:</span>
                                <p className="text-xs text-purple-800">{imp.impact}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* أفضل الممارسات */}
                      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                        <h4 className="font-semibold text-emerald-700 flex items-center gap-2 mb-3">
                          <CheckCircle className="h-4 w-4" />
                          أفضل الممارسات المقترحة
                        </h4>
                        <ul className="space-y-2">
                          {improvementsData.bestPractices?.map((practice: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-emerald-800">
                              <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                              {practice}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* الأفكار الإبداعية */}
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <h4 className="font-semibold text-amber-700 flex items-center gap-2 mb-3">
                          <Lightbulb className="h-4 w-4" />
                          أفكار إبداعية للتطوير
                        </h4>
                        <ul className="space-y-2">
                          {improvementsData.innovativeIdeas?.map((idea: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-amber-800">
                              <Lightbulb className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                              {idea}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* الشراكات والتوسع */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                          <h4 className="font-semibold text-indigo-700 flex items-center gap-2 mb-2">
                            <Users className="h-4 w-4" />
                            شراكات محتملة
                          </h4>
                          <p className="text-sm text-indigo-800">{improvementsData.potentialPartnerships}</p>
                        </div>
                        <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
                          <h4 className="font-semibold text-cyan-700 flex items-center gap-2 mb-2">
                            <TrendingUp className="h-4 w-4" />
                            خيارات التوسع
                          </h4>
                          <p className="text-sm text-cyan-800">{improvementsData.scalabilityOptions}</p>
                        </div>
                      </div>

                      {/* الملخص */}
                      <div className="bg-gradient-to-l from-purple-100 to-pink-100 rounded-lg p-4">
                        <h4 className="font-semibold text-purple-700 mb-2">ملخص التحسينات</h4>
                        <p className="text-sm text-purple-800">{improvementsData.summary}</p>
                      </div>

                      <div className="flex gap-3">
                        <Button 
                          variant="default" 
                          onClick={() => {
                            if (generatedIdea && improvementsData) {
                              applyImprovementsMutation.mutate({
                                id: generatedIdea.id,
                                improvedVision: improvementsData.improvedVision,
                                improvedObjectives: improvementsData.improvedObjectives,
                              });
                            }
                          }}
                          disabled={applyImprovementsMutation.isPending}
                          className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                        >
                          {applyImprovementsMutation.isPending ? (
                            <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                          ) : (
                            <CheckCircle className="h-4 w-4 ml-2" />
                          )}
                          تطبيق التحسينات على الفكرة
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => setShowImprovements(false)}
                          className="flex-1"
                        >
                          <X className="h-4 w-4 ml-2" />
                          إغلاق
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* واجهة المحادثة التفاعلية */}
                {showChat && (
                  <Card className="border-0 shadow-lg overflow-hidden card-3d glass glass-card-enhanced">
                    <CardHeader className="bg-gradient-to-l from-blue-600 to-cyan-600 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <MessageCircle className="h-5 w-5" />
                            محادثة تطوير الفكرة
                          </CardTitle>
                          <CardDescription className="text-white/80">
                            تحدث مع المساعد الذكي لتطوير فكرتك بشكل تدريجي
                          </CardDescription>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={handleCloseChat}
                          className="text-white hover:bg-white/20"
                        >
                          <X className="h-5 w-5" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      <AIChatBox
                        messages={chatMessages}
                        onSendMessage={handleSendChatMessage}
                        isLoading={sendMessageMutation.isPending}
                        placeholder="اكتب رسالتك هنا..."
                        height="500px"
                        emptyStateMessage="ابدأ المحادثة لتطوير فكرتك"
                        suggestedPrompts={suggestionsQuery.data || [
                          "كيف يمكن تحسين الأهداف؟",
                          "اقترح شراكات محتملة",
                          "ما هي مصادر التمويل المقترحة؟",
                          "كيف يمكن قياس الأثر؟"
                        ]}
                      />
                    </CardContent>
                  </Card>
                )}

                {/* واجهة عرض PMDPro */}
                {showPMDPro && pmdproData && (
                  <Card className="border-0 shadow-lg overflow-hidden card-3d glass glass-card-enhanced animate-slide-up">
                    <CardHeader className="bg-gradient-to-l from-indigo-600 to-violet-600 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <FolderKanban className="h-5 w-5" />
                            خطة PMDPro
                          </CardTitle>
                          <CardDescription className="text-white/80">
                            إدارة المشاريع وفق منهجية PMDPro
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            onClick={() => openJSONEditor(
                              "خطة PMDPro",
                              pmdproData,
                              (updatedData) => {
                                setPmdproData(updatedData);
                                toast.success("تم حفظ خطة PMDPro");
                              }
                            )}
                            className="gap-1"
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={async () => {
                              const { exportPMDProToPDF } = await import('@/lib/exportMethodologyPDF');
                              await exportPMDProToPDF(pmdproData, generatedIdea?.programDescription || 'مشروع');
                              toast.success('تم تصدير PDF بنجاح');
                            }}
                            className="text-white hover:bg-white/20 gap-2"
                          >
                            <Download className="h-4 w-4" />
                            تصدير PDF
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => setShowPMDPro(false)}
                            className="text-white hover:bg-white/20"
                          >
                            <X className="h-5 w-5" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                      {/* ملخص المشروع */}
                      <div className="bg-gradient-to-r from-indigo-50 to-violet-50 rounded-xl p-4 border border-indigo-100">
                        <h3 className="font-bold text-indigo-800 mb-3 flex items-center gap-2">
                          <Briefcase className="h-5 w-5" />
                          ملخص المشروع
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {pmdproData.projectSummary?.title && (
                            <div className="bg-white rounded-lg p-3 border border-indigo-100">
                              <span className="text-xs text-indigo-600 font-medium">عنوان المشروع</span>
                              <p className="text-gray-800 font-semibold mt-1">{pmdproData.projectSummary.title}</p>
                            </div>
                          )}
                          {pmdproData.projectSummary?.goal && (
                            <div className="bg-white rounded-lg p-3 border border-indigo-100">
                              <span className="text-xs text-indigo-600 font-medium">الهدف العام</span>
                              <p className="text-gray-700 text-sm mt-1">{pmdproData.projectSummary.goal}</p>
                            </div>
                          )}
                          {pmdproData.projectSummary?.duration && (
                            <div className="bg-white rounded-lg p-3 border border-indigo-100">
                              <span className="text-xs text-indigo-600 font-medium">المدة الزمنية</span>
                              <p className="text-gray-700 text-sm mt-1">{pmdproData.projectSummary.duration}</p>
                            </div>
                          )}
                          {pmdproData.projectSummary?.beneficiaries && (
                            <div className="bg-white rounded-lg p-3 border border-indigo-100">
                              <span className="text-xs text-indigo-600 font-medium">الفئة المستهدفة</span>
                              <p className="text-gray-700 text-sm mt-1">{pmdproData.projectSummary.beneficiaries}</p>
                            </div>
                          )}
                          {pmdproData.projectSummary?.budget && (
                            <div className="bg-white rounded-lg p-3 border border-indigo-100 md:col-span-2">
                              <span className="text-xs text-indigo-600 font-medium">الميزانية التقديرية</span>
                              <p className="text-gray-700 text-sm mt-1">{pmdproData.projectSummary.budget}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* مراحل دورة حياة المشروع */}
                      <div>
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                          <Layers className="h-5 w-5 text-indigo-600" />
                          مراحل دورة حياة المشروع
                        </h3>
                        <div className="grid gap-4">
                          {pmdproData.phases?.map((phase: any, index: number) => (
                            <div key={index} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
                              <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold">
                                  {index + 1}
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-bold text-gray-800 mb-1">{phase.name}</h4>
                                  <p className="text-gray-600 text-sm mb-3">{phase.description}</p>
                                  
                                  {/* الأنشطة الرئيسية */}
                                  {phase.activities && phase.activities.length > 0 && (
                                    <div className="mb-3">
                                      <h5 className="text-xs font-semibold text-indigo-600 mb-2">الأنشطة الرئيسية:</h5>
                                      <ul className="space-y-1">
                                        {phase.activities.map((activity: string, actIdx: number) => (
                                          <li key={actIdx} className="text-sm text-gray-600 flex items-start gap-2">
                                            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                                            {activity}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                  
                                  {/* المخرجات */}
                                  {phase.deliverables && phase.deliverables.length > 0 && (
                                    <div className="mb-3">
                                      <h5 className="text-xs font-semibold text-violet-600 mb-2">المخرجات:</h5>
                                      <div className="flex flex-wrap gap-2">
                                        {phase.deliverables.map((deliverable: string, delIdx: number) => (
                                          <span key={delIdx} className="px-2 py-1 bg-violet-100 text-violet-700 rounded-full text-xs">
                                            {deliverable}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  
                                  {/* المدة الزمنية */}
                                  {phase.duration && (
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                      <Clock className="h-3.5 w-3.5" />
                                      {phase.duration}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* الإطار المنطقي */}
                      {pmdproData.logicalFramework && (
                        <div>
                          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Table2 className="h-5 w-5 text-indigo-600" />
                            الإطار المنطقي
                          </h3>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm border-collapse">
                              <thead>
                                <tr className="bg-gradient-to-r from-indigo-100 to-violet-100">
                                  <th className="border border-indigo-200 p-2 text-right">المستوى</th>
                                  <th className="border border-indigo-200 p-2 text-right">الوصف</th>
                                  <th className="border border-indigo-200 p-2 text-right">المؤشرات</th>
                                  <th className="border border-indigo-200 p-2 text-right">وسائل التحقق</th>
                                  <th className="border border-indigo-200 p-2 text-right">الافتراضات</th>
                                </tr>
                              </thead>
                              <tbody>
                                {pmdproData.logicalFramework.map((row: any, rowIdx: number) => (
                                  <tr key={rowIdx} className={rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                    <td className="border border-gray-200 p-2 font-medium text-indigo-700">{row.level}</td>
                                    <td className="border border-gray-200 p-2">{row.description}</td>
                                    <td className="border border-gray-200 p-2">{row.indicators}</td>
                                    <td className="border border-gray-200 p-2">{row.verification}</td>
                                    <td className="border border-gray-200 p-2">{row.assumptions}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* تحليل أصحاب المصلحة */}
                      {pmdproData.stakeholders && pmdproData.stakeholders.length > 0 && (
                        <div>
                          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Users className="h-5 w-5 text-indigo-600" />
                            تحليل أصحاب المصلحة
                          </h3>
                          <div className="grid gap-3 md:grid-cols-2">
                            {pmdproData.stakeholders.map((stakeholder: any, idx: number) => (
                              <div key={idx} className="bg-white rounded-lg border border-gray-200 p-3">
                                <h4 className="font-semibold text-gray-800 mb-1">{stakeholder.name}</h4>
                                <p className="text-sm text-gray-600 mb-2">{stakeholder.role}</p>
                                <div className="flex items-center gap-2">
                                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                                    stakeholder.influence === 'عالي' ? 'bg-red-100 text-red-700' :
                                    stakeholder.influence === 'متوسط' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-green-100 text-green-700'
                                  }`}>
                                    التأثير: {stakeholder.influence}
                                  </span>
                                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                                    stakeholder.interest === 'عالي' ? 'bg-blue-100 text-blue-700' :
                                    stakeholder.interest === 'متوسط' ? 'bg-purple-100 text-purple-700' :
                                    'bg-gray-100 text-gray-700'
                                  }`}>
                                    الاهتمام: {stakeholder.interest}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* مصفوفة المخاطر */}
                      {pmdproData.risks && pmdproData.risks.length > 0 && (
                        <div>
                          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-indigo-600" />
                            مصفوفة المخاطر
                          </h3>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm border-collapse">
                              <thead>
                                <tr className="bg-gradient-to-r from-red-100 to-orange-100">
                                  <th className="border border-red-200 p-2 text-right">المخاطرة</th>
                                  <th className="border border-red-200 p-2 text-right">الاحتمالية</th>
                                  <th className="border border-red-200 p-2 text-right">التأثير</th>
                                  <th className="border border-red-200 p-2 text-right">استراتيجية التخفيف</th>
                                </tr>
                              </thead>
                              <tbody>
                                {pmdproData.risks.map((risk: any, riskIdx: number) => (
                                  <tr key={riskIdx} className={riskIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                    <td className="border border-gray-200 p-2">{risk.description}</td>
                                    <td className="border border-gray-200 p-2">
                                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                                        risk.probability === 'عالية' ? 'bg-red-100 text-red-700' :
                                        risk.probability === 'متوسطة' ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-green-100 text-green-700'
                                      }`}>
                                        {risk.probability}
                                      </span>
                                    </td>
                                    <td className="border border-gray-200 p-2">
                                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                                        risk.impact === 'عالي' ? 'bg-red-100 text-red-700' :
                                        risk.impact === 'متوسط' ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-green-100 text-green-700'
                                      }`}>
                                        {risk.impact}
                                      </span>
                                    </td>
                                    <td className="border border-gray-200 p-2">{risk.mitigation}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* خطة المتابعة والتقييم */}
                      {pmdproData.monitoringPlan && (
                        <div>
                          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Activity className="h-5 w-5 text-indigo-600" />
                            خطة المتابعة والتقييم
                          </h3>
                          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                            <p className="text-gray-700 mb-4">{pmdproData.monitoringPlan.description}</p>
                            {pmdproData.monitoringPlan.indicators && (
                              <div className="grid gap-2 md:grid-cols-2">
                                {pmdproData.monitoringPlan.indicators.map((indicator: any, indIdx: number) => (
                                  <div key={indIdx} className="bg-white rounded-lg p-3 border border-green-200">
                                    <h5 className="font-medium text-green-800 mb-1">{indicator.name}</h5>
                                    <p className="text-sm text-gray-600">المستهدف: {indicator.target}</p>
                                    <p className="text-xs text-gray-500">التكرار: {indicator.frequency}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* الدروس المستفادة المتوقعة */}
                      {pmdproData.lessonsLearned && pmdproData.lessonsLearned.length > 0 && (
                        <div>
                          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Award className="h-5 w-5 text-indigo-600" />
                            الدروس المستفادة المتوقعة
                          </h3>
                          <ul className="space-y-2">
                            {pmdproData.lessonsLearned.map((lesson: string, lessonIdx: number) => (
                              <li key={lessonIdx} className="flex items-start gap-2 text-gray-700">
                                <Lightbulb className="h-4 w-4 text-amber-500 flex-shrink-0 mt-1" />
                                {lesson}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* واجهة عرض التفكير التصميمي */}
                {showDesignThinking && designThinkingData && (
                  <Card className="border-0 shadow-lg overflow-hidden card-3d glass glass-card-enhanced animate-slide-up">
                    <CardHeader className="bg-gradient-to-l from-pink-600 to-rose-600 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <Lightbulb className="h-5 w-5" />
                            التفكير التصميمي (Design Thinking)
                          </CardTitle>
                          <CardDescription className="text-white/80">
                            خطة متكاملة وفق منهجية التفكير التصميمي بمراحلها الخمس
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            onClick={() => openJSONEditor(
                              "التفكير التصميمي",
                              designThinkingData,
                              (updatedData) => {
                                setDesignThinkingData(updatedData);
                                toast.success("تم حفظ التفكير التصميمي");
                              }
                            )}
                            className="gap-1"
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost"
                            size="sm"
                            onClick={async () => {
                              const { exportDesignThinkingToPDF } = await import('@/lib/exportMethodologyPDF');
                              await exportDesignThinkingToPDF(designThinkingData, generatedIdea?.programDescription || 'مشروع');
                              toast.success('تم تصدير PDF بنجاح');
                            }}
                            className="text-white hover:bg-white/20 gap-2"
                          >
                            <Download className="h-4 w-4" />
                            تصدير PDF
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => setShowDesignThinking(false)}
                            className="text-white hover:bg-white/20"
                          >
                            <X className="h-5 w-5" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                      {/* ملخص */}
                      {designThinkingData.summary && (
                        <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl p-4 border border-pink-100">
                          <h3 className="font-bold text-pink-800 mb-2 flex items-center gap-2">
                            <Sparkles className="h-5 w-5" />
                            ملخص التفكير التصميمي
                          </h3>
                          <p className="text-gray-700">{designThinkingData.summary}</p>
                        </div>
                      )}

                      {/* المرحلة 1: التعاطف */}
                      {designThinkingData.phase1_empathize && (
                        <div className="border border-pink-200 rounded-xl overflow-hidden">
                          <div className="bg-gradient-to-r from-pink-500 to-rose-500 text-white p-4">
                            <h3 className="font-bold flex items-center gap-2">
                              <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm">1</span>
                              {designThinkingData.phase1_empathize.title}
                            </h3>
                            <p className="text-white/80 text-sm mt-1">{designThinkingData.phase1_empathize.description}</p>
                          </div>
                          <div className="p-4 space-y-4">
                            {/* خريطة التعاطف */}
                            {designThinkingData.phase1_empathize.empathyMap && (
                              <div>
                                <h4 className="font-semibold text-pink-700 mb-3 flex items-center gap-2">
                                  <Users className="h-4 w-4" />
                                  خريطة التعاطف (Empathy Map)
                                </h4>
                                <div className="grid grid-cols-2 gap-3">
                                  <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                                    <h5 className="font-medium text-blue-700 text-sm mb-2">ماذا يقولون</h5>
                                    <ul className="text-xs text-gray-600 space-y-1">
                                      {designThinkingData.phase1_empathize.empathyMap.says?.map((item: string, idx: number) => (
                                        <li key={idx} className="flex items-start gap-1">
                                          <span className="text-blue-500">•</span> {item}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                  <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                                    <h5 className="font-medium text-purple-700 text-sm mb-2">ماذا يفكرون</h5>
                                    <ul className="text-xs text-gray-600 space-y-1">
                                      {designThinkingData.phase1_empathize.empathyMap.thinks?.map((item: string, idx: number) => (
                                        <li key={idx} className="flex items-start gap-1">
                                          <span className="text-purple-500">•</span> {item}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                  <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                                    <h5 className="font-medium text-green-700 text-sm mb-2">ماذا يفعلون</h5>
                                    <ul className="text-xs text-gray-600 space-y-1">
                                      {designThinkingData.phase1_empathize.empathyMap.does?.map((item: string, idx: number) => (
                                        <li key={idx} className="flex items-start gap-1">
                                          <span className="text-green-500">•</span> {item}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                  <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                                    <h5 className="font-medium text-amber-700 text-sm mb-2">ماذا يشعرون</h5>
                                    <ul className="text-xs text-gray-600 space-y-1">
                                      {designThinkingData.phase1_empathize.empathyMap.feels?.map((item: string, idx: number) => (
                                        <li key={idx} className="flex items-start gap-1">
                                          <span className="text-amber-500">•</span> {item}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                              </div>
                            )}
                            {/* طرق البحث */}
                            {designThinkingData.phase1_empathize.researchMethods && (
                              <div>
                                <h4 className="font-semibold text-pink-700 mb-2 text-sm">طرق البحث</h4>
                                <div className="grid gap-2">
                                  {designThinkingData.phase1_empathize.researchMethods.map((method: any, idx: number) => (
                                    <div key={idx} className="bg-gray-50 rounded-lg p-3 border">
                                      <div className="font-medium text-gray-800">{method.method}</div>
                                      <div className="text-xs text-gray-600 mt-1">{method.description}</div>
                                      <div className="flex gap-3 mt-2 text-xs text-gray-500">
                                        <span>المشاركون: {method.participants}</span>
                                        <span>المدة: {method.duration}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            {/* الرؤى الرئيسية */}
                            {designThinkingData.phase1_empathize.keyInsights && (
                              <div>
                                <h4 className="font-semibold text-pink-700 mb-2 text-sm">الرؤى الرئيسية</h4>
                                <ul className="space-y-1">
                                  {designThinkingData.phase1_empathize.keyInsights.map((insight: string, idx: number) => (
                                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                                      <Lightbulb className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                                      {insight}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* المرحلة 2: التحديد */}
                      {designThinkingData.phase2_define && (
                        <div className="border border-orange-200 rounded-xl overflow-hidden">
                          <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white p-4">
                            <h3 className="font-bold flex items-center gap-2">
                              <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm">2</span>
                              {designThinkingData.phase2_define.title}
                            </h3>
                            <p className="text-white/80 text-sm mt-1">{designThinkingData.phase2_define.description}</p>
                          </div>
                          <div className="p-4 space-y-4">
                            {/* بيان المشكلة */}
                            {designThinkingData.phase2_define.problemStatement && (
                              <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                                <h4 className="font-semibold text-orange-700 mb-2 flex items-center gap-2">
                                  <Target className="h-4 w-4" />
                                  بيان المشكلة (Problem Statement)
                                </h4>
                                <p className="text-gray-700 text-sm italic">"{designThinkingData.phase2_define.problemStatement}"</p>
                              </div>
                            )}
                            {/* وجهة النظر */}
                            {designThinkingData.phase2_define.pointOfView && (
                              <div>
                                <h4 className="font-semibold text-orange-700 mb-2 text-sm">وجهة النظر (POV)</h4>
                                <p className="text-gray-700 text-sm">{designThinkingData.phase2_define.pointOfView}</p>
                              </div>
                            )}
                            {/* أسئلة كيف يمكننا */}
                            {designThinkingData.phase2_define.howMightWe && (
                              <div>
                                <h4 className="font-semibold text-orange-700 mb-2 text-sm">أسئلة "كيف يمكننا" (HMW)</h4>
                                <ul className="space-y-2">
                                  {designThinkingData.phase2_define.howMightWe.map((question: string, idx: number) => (
                                    <li key={idx} className="bg-white rounded-lg p-3 border border-orange-100 text-sm text-gray-700">
                                      كيف يمكننا {question}?
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* المرحلة 3: التفكير */}
                      {designThinkingData.phase3_ideate && (
                        <div className="border border-green-200 rounded-xl overflow-hidden">
                          <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-4">
                            <h3 className="font-bold flex items-center gap-2">
                              <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm">3</span>
                              {designThinkingData.phase3_ideate.title}
                            </h3>
                            <p className="text-white/80 text-sm mt-1">{designThinkingData.phase3_ideate.description}</p>
                          </div>
                          <div className="p-4 space-y-4">
                            {/* قواعد العصف الذهني */}
                            {designThinkingData.phase3_ideate.brainstormRules && (
                              <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                                <h4 className="font-semibold text-green-700 mb-2 text-sm">قواعد العصف الذهني</h4>
                                <div className="flex flex-wrap gap-2">
                                  {designThinkingData.phase3_ideate.brainstormRules.map((rule: string, idx: number) => (
                                    <span key={idx} className="bg-white text-green-700 text-xs px-2 py-1 rounded-full border border-green-300">
                                      {rule}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            {/* الأفكار */}
                            {designThinkingData.phase3_ideate.ideas && (
                              <div>
                                <h4 className="font-semibold text-green-700 mb-2 text-sm">الأفكار المولدة</h4>
                                <div className="grid gap-2">
                                  {designThinkingData.phase3_ideate.ideas.map((idea: any, idx: number) => (
                                    <div key={idx} className="bg-white rounded-lg p-3 border border-green-100">
                                      <div className="font-medium text-gray-800">{idea.idea}</div>
                                      <div className="flex gap-3 mt-2 text-xs">
                                        <span className="bg-gray-100 px-2 py-0.5 rounded">{idea.category}</span>
                                        <span className="text-green-600">قابلية التنفيذ: {idea.feasibility}</span>
                                        <span className="text-blue-600">التأثير: {idea.impact}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            {/* الفكرة المختارة */}
                            {designThinkingData.phase3_ideate.selectedIdea && (
                              <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg p-4 border border-green-300">
                                <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                                  <CheckCircle className="h-4 w-4" />
                                  الفكرة المختارة للتنفيذ
                                </h4>
                                <p className="text-gray-700">{designThinkingData.phase3_ideate.selectedIdea}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* المرحلة 4: النموذج الأولي */}
                      {designThinkingData.phase4_prototype && (
                        <div className="border border-blue-200 rounded-xl overflow-hidden">
                          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-4">
                            <h3 className="font-bold flex items-center gap-2">
                              <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm">4</span>
                              {designThinkingData.phase4_prototype.title}
                            </h3>
                            <p className="text-white/80 text-sm mt-1">{designThinkingData.phase4_prototype.description}</p>
                          </div>
                          <div className="p-4 space-y-4">
                            {/* نوع النموذج */}
                            {designThinkingData.phase4_prototype.prototypeType && (
                              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                                <h4 className="font-semibold text-blue-700 mb-1 text-sm">نوع النموذج</h4>
                                <p className="text-gray-700">{designThinkingData.phase4_prototype.prototypeType}</p>
                              </div>
                            )}
                            {/* المكونات */}
                            {designThinkingData.phase4_prototype.components && (
                              <div>
                                <h4 className="font-semibold text-blue-700 mb-2 text-sm">مكونات النموذج</h4>
                                <div className="grid gap-2">
                                  {designThinkingData.phase4_prototype.components.map((comp: any, idx: number) => (
                                    <div key={idx} className="bg-white rounded-lg p-3 border">
                                      <div className="font-medium text-gray-800">{comp.component}</div>
                                      <div className="text-xs text-gray-600 mt-1">{comp.description}</div>
                                      <div className="flex gap-3 mt-2 text-xs text-gray-500">
                                        <span>المواد: {comp.materials}</span>
                                        <span>الوقت: {comp.time}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            {/* خطوات البناء */}
                            {designThinkingData.phase4_prototype.buildSteps && (
                              <div>
                                <h4 className="font-semibold text-blue-700 mb-2 text-sm">خطوات بناء النموذج</h4>
                                <ol className="space-y-2">
                                  {designThinkingData.phase4_prototype.buildSteps.map((step: string, idx: number) => (
                                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                                      <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs flex-shrink-0">{idx + 1}</span>
                                      {step}
                                    </li>
                                  ))}
                                </ol>
                              </div>
                            )}
                            {/* التكلفة */}
                            {designThinkingData.phase4_prototype.budget && (
                              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                                <h4 className="font-semibold text-blue-700 mb-1 text-sm flex items-center gap-2">
                                  <DollarSign className="h-4 w-4" />
                                  التكلفة التقديرية
                                </h4>
                                <p className="text-gray-700">{designThinkingData.phase4_prototype.budget}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* المرحلة 5: الاختبار */}
                      {designThinkingData.phase5_test && (
                        <div className="border border-purple-200 rounded-xl overflow-hidden">
                          <div className="bg-gradient-to-r from-purple-500 to-violet-500 text-white p-4">
                            <h3 className="font-bold flex items-center gap-2">
                              <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm">5</span>
                              {designThinkingData.phase5_test.title}
                            </h3>
                            <p className="text-white/80 text-sm mt-1">{designThinkingData.phase5_test.description}</p>
                          </div>
                          <div className="p-4 space-y-4">
                            {/* خطة الاختبار */}
                            {designThinkingData.phase5_test.testPlan && (
                              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                                <h4 className="font-semibold text-purple-700 mb-3 text-sm">خطة الاختبار</h4>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                  <div>
                                    <span className="text-gray-500">الهدف:</span>
                                    <p className="text-gray-700">{designThinkingData.phase5_test.testPlan.objective}</p>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">المشاركون:</span>
                                    <p className="text-gray-700">{designThinkingData.phase5_test.testPlan.participants}</p>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">المدة:</span>
                                    <p className="text-gray-700">{designThinkingData.phase5_test.testPlan.duration}</p>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">المكان:</span>
                                    <p className="text-gray-700">{designThinkingData.phase5_test.testPlan.location}</p>
                                  </div>
                                </div>
                              </div>
                            )}
                            {/* سيناريوهات الاختبار */}
                            {designThinkingData.phase5_test.testScenarios && (
                              <div>
                                <h4 className="font-semibold text-purple-700 mb-2 text-sm">سيناريوهات الاختبار</h4>
                                <div className="space-y-2">
                                  {designThinkingData.phase5_test.testScenarios.map((scenario: any, idx: number) => (
                                    <div key={idx} className="bg-white rounded-lg p-3 border">
                                      <div className="font-medium text-gray-800">{scenario.scenario}</div>
                                      <div className="text-xs text-gray-600 mt-1">المهمة: {scenario.task}</div>
                                      <div className="text-xs text-purple-600 mt-1">معايير النجاح: {scenario.successCriteria}</div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            {/* أسئلة الملاحظات */}
                            {designThinkingData.phase5_test.feedbackQuestions && (
                              <div>
                                <h4 className="font-semibold text-purple-700 mb-2 text-sm">أسئلة جمع الملاحظات</h4>
                                <ul className="space-y-1">
                                  {designThinkingData.phase5_test.feedbackQuestions.map((q: string, idx: number) => (
                                    <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                                      <span className="text-purple-500">•</span> {q}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {/* خطة التكرار */}
                            {designThinkingData.phase5_test.iterationPlan && (
                              <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                                <h4 className="font-semibold text-purple-700 mb-1 text-sm flex items-center gap-2">
                                  <RefreshCw className="h-4 w-4" />
                                  خطة التكرار والتحسين
                                </h4>
                                <p className="text-gray-700 text-sm">{designThinkingData.phase5_test.iterationPlan}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* الجدول الزمني */}
                      {designThinkingData.timeline && designThinkingData.timeline.length > 0 && (
                        <div>
                          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-pink-600" />
                            الجدول الزمني
                          </h3>
                          <div className="space-y-2">
                            {designThinkingData.timeline.map((item: any, idx: number) => (
                              <div key={idx} className="flex items-center gap-3 bg-gray-50 rounded-lg p-3 border">
                                <div className="w-24 text-sm font-medium text-pink-700">{item.phase}</div>
                                <div className="w-20 text-xs text-gray-500">{item.duration}</div>
                                <div className="flex-1 text-sm text-gray-700">{item.activities?.join(", ")}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* مقاييس النجاح */}
                      {designThinkingData.successMetrics && designThinkingData.successMetrics.length > 0 && (
                        <div>
                          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-pink-600" />
                            مقاييس النجاح
                          </h3>
                          <div className="grid gap-2 md:grid-cols-2">
                            {designThinkingData.successMetrics.map((metric: any, idx: number) => (
                              <div key={idx} className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-lg p-3 border border-pink-100">
                                <div className="font-medium text-pink-800">{metric.metric}</div>
                                <div className="text-sm text-gray-600 mt-1">الهدف: {metric.target}</div>
                                <div className="text-xs text-gray-500">طريقة القياس: {metric.measurement}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* زر اعتماد المشروع */}
            {generatedIdea && (
              <div className="flex justify-center mt-8">
                <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 shadow-lg max-w-2xl w-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-green-800">
                      <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl">
                        <CheckCircle className="h-6 w-6 text-white" />
                      </div>
                      اعتماد المشروع
                    </CardTitle>
                    <CardDescription className="text-gray-700">
                      بعد مراجعة المشروع والتأكد من جاهزيته، يمكنك اعتماده للوصول إلى خبير الاستدامة والدراسة البحثية
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={() => {
                        if (!generatedIdea.isApproved) {
                          approveMutation.mutate({ id: generatedIdea.id });
                        } else {
                          toast.info("المشروع معتمد بالفعل");
                        }
                      }}
                      disabled={approveMutation.isPending || !!generatedIdea.isApproved}
                      className="w-full gradient-primary border-0 gap-2 py-6 text-lg"
                    >
                      {approveMutation.isPending ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          جاري الاعتماد...
                        </>
                      ) : generatedIdea.isApproved ? (
                        <>
                          <CheckCircle className="h-5 w-5" />
                          مشروع معتمد
                        </>
                      ) : (
                        <>
                          <Award className="h-5 w-5" />
                          اعتماد المشروع
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* عرض التوليد المتعدد */}
            {showMultipleMode && multipleVersions && (
              <div className="space-y-6 animate-fade-in">
                {/* شريط التنقل بين النسخ */}
                <Card className="border-0 shadow-md glass glass-interactive">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                      <Layers className="h-5 w-5 text-primary" />
                      اختر النسخة المناسبة
                    </CardTitle>
                    <CardDescription>
                      تم توليد 3 نسخ مختلفة - اختر الأنسب لمشروعك
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedVersionIndex(Math.max(0, selectedVersionIndex - 1))}
                        disabled={selectedVersionIndex === 0}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                      <div className="flex items-center gap-2">
                        {multipleVersions.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSelectedVersionIndex(idx)}
                            className={`w-3 h-3 rounded-full transition-colors ${
                              idx === selectedVersionIndex ? 'bg-primary' : 'bg-muted hover:bg-muted-foreground/30'
                            }`}
                          />
                        ))}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedVersionIndex(Math.min(multipleVersions.length - 1, selectedVersionIndex + 1))}
                        disabled={selectedVersionIndex === multipleVersions.length - 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="text-center mt-4">
                      <span className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary font-medium">
                        {multipleVersions[selectedVersionIndex]?.versionName}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* عرض النسخة المختارة */}
                <div className="grid gap-4">
                  {[
                    { key: 'idea', title: 'الفكرة', icon: Lightbulb, color: 'text-amber-600' },
                    { key: 'justifications', title: 'مبررات البرنامج', icon: FileText, color: 'text-purple-600' },
                    { key: 'features', title: 'المميزات', icon: Star, color: 'text-yellow-600' },
                    { key: 'strengths', title: 'نقاط القوة', icon: Zap, color: 'text-green-600' },
                    { key: 'outputs', title: 'المخرجات', icon: Package, color: 'text-indigo-600' },
                    { key: 'expectedResults', title: 'النتائج المتوقعة', icon: TrendingUp, color: 'text-teal-600' },
                  ].map((section) => (
                    <Card key={section.key} className="card-hover border-0 shadow-md">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <section.icon className={`h-5 w-5 ${section.color}`} />
                          {section.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-foreground leading-relaxed whitespace-pre-line">
                          {multipleVersions[selectedVersionIndex]?.[section.key]}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* أزرار الإجراءات */}
                <div className="flex items-center justify-center gap-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowMultipleMode(false);
                      setMultipleVersions(null);
                    }}
                    className="gap-2"
                  >
                    <X className="h-4 w-4" />
                    إلغاء
                  </Button>
                  <Button
                    onClick={handleSaveSelectedVersion}
                    disabled={saveVersionMutation.isPending}
                    className="gradient-primary border-0 gap-2 px-8"
                  >
                    {saveVersionMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        جاري الحفظ...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        حفظ هذه النسخة
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Features Section */}
            {!generatedIdea && !showMultipleMode && (
              <div className="grid md:grid-cols-3 gap-6 mt-12">
                <Card className="card-hover border-0 shadow-md text-center p-6 glass-card animate-slide-up opacity-0" style={{ animationDelay: '0.6s', animationFillMode: 'forwards' }}>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4 icon-bounce">
                    <Lightbulb className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">أفكار إبداعية</h3>
                  <p className="text-sm text-muted-foreground">
                    توليد أفكار مبتكرة ومناسبة لطبيعة المنظمات غير الربحية
                  </p>
                </Card>
                <Card className="card-hover border-0 shadow-md text-center p-6 glass-card animate-slide-up opacity-0" style={{ animationDelay: '0.7s', animationFillMode: 'forwards' }}>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4 icon-bounce">
                    <Target className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">محتوى متكامل</h3>
                  <p className="text-sm text-muted-foreground">
                    من الأهداف إلى المخرجات والنتائج المتوقعة بشكل شامل
                  </p>
                </Card>
                <Card className="card-hover border-0 shadow-md text-center p-6 glass-card animate-slide-up opacity-0" style={{ animationDelay: '0.8s', animationFillMode: 'forwards' }}>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4 icon-bounce">
                    <History className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">حفظ واسترجاع</h3>
                  <p className="text-sm text-muted-foreground">
                    احفظ أفكارك وارجع إليها في أي وقت من سجل الأفكار
                  </p>
                </Card>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* عرض المحتوى التسويقي */}
      {showMarketing && marketingData && (
        <MarketingContent
          content={marketingData.content}
          programName={marketingData.programName}
          onClose={() => setShowMarketing(false)}
          onEdit={() => openJSONEditor(
            "المحتوى التسويقي",
            marketingData,
            (updatedData) => {
              setMarketingData(updatedData);
              toast.success("تم حفظ المحتوى التسويقي");
            }
          )}
        />
      )}

      {/* عرض تحليل القيمة المضافة */}
      {showValueAdd && valueAddData && (
        <ValueAddAnalysis
          analysis={valueAddData.analysis}
          programName={valueAddData.programName}
          onClose={() => setShowValueAdd(false)}
        />
      )}

      {/* Footer */}
      <footer className="py-8 border-t bg-card/50">
        <div className="container text-center text-sm text-muted-foreground">
          <p>مسار الابتكار - حلول مبتكرة للمنظمات غير الربحية</p>
        </div>
      </footer>
    </div>
  );
}
