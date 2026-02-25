import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { useState, useEffect } from "react";
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
  Search,
  Loader2,
  ArrowRight,
  Trash2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Calendar,
  FolderOpen,
  FileDown,
  AlertTriangle,
  Eye,
  Crosshair,
  ListChecks,
  BarChart3,
  BookOpen
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "wouter";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { generateIdeaPDF } from "@/lib/pdfGenerator";

interface Idea {
  id: number;
  programDescription: string;
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
  isApproved: boolean;
  approvedAt?: Date | null;
  approvedBy?: number | null;
  createdAt: Date;
}

export default function History() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [exportingPDFId, setExportingPDFId] = useState<number | null>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data, isLoading, refetch } = trpc.ideas.list.useQuery(
    { limit: 50, offset: 0, search: debouncedSearch || undefined },
    { enabled: isAuthenticated }
  );

  const deleteMutation = trpc.ideas.delete.useMutation({
    onSuccess: () => {
      toast.success("تم حذف الفكرة بنجاح");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "حدث خطأ أثناء الحذف");
    },
  });

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`تم نسخ ${label}`);
  };

  const downloadAsPDF = async (idea: Idea) => {
    setExportingPDFId(idea.id);
    try {
      await generateIdeaPDF(idea);
      toast.success("تم تصدير الملف بنجاح");
    } catch (error) {
      toast.error("حدث خطأ أثناء تصدير PDF");
    } finally {
      setExportingPDFId(null);
    }
  };

  const copyAllContent = (idea: Idea) => {
    const content = `
وصف البرنامج/المبادرة:
${idea.programDescription}

الفكرة:
${idea.idea}

الهدف:
${idea.objective}

مبررات البرنامج:
${idea.justifications}

المميزات:
${idea.features}

نقاط القوة:
${idea.strengths}

المخرجات:
${idea.outputs}

النتائج المتوقعة:
${idea.expectedResults}
${idea.risks ? `
المخاطر:
${idea.risks}` : ''}
    `.trim();
    navigator.clipboard.writeText(content);
    toast.success("تم نسخ جميع المحتوى");
  };

  const downloadAsText = (idea: Idea) => {
    const content = `
وصف البرنامج/المبادرة:
${idea.programDescription}

═══════════════════════════════════════

الفكرة:
${idea.idea}

═══════════════════════════════════════

الهدف:
${idea.objective}

═══════════════════════════════════════

مبررات البرنامج:
${idea.justifications}

═══════════════════════════════════════

المميزات:
${idea.features}

═══════════════════════════════════════

نقاط القوة:
${idea.strengths}

═══════════════════════════════════════

المخرجات:
${idea.outputs}

═══════════════════════════════════════

النتائج المتوقعة:
${idea.expectedResults}
${idea.risks ? `
المخاطر:
${idea.risks}` : ''}
    `.trim();

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `فكرة-برنامج-${idea.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("تم تحميل الملف");
  };

  const getSections = (idea: Idea) => [
    ...(idea.vision ? [{ icon: Eye, title: "الرؤية", content: idea.vision, color: "text-cyan-600" }] : []),
    ...(idea.generalObjective ? [{ icon: Crosshair, title: "الهدف العام", content: idea.generalObjective, color: "text-rose-600" }] : []),
    ...(idea.detailedObjectives ? [{ icon: ListChecks, title: "الأهداف التفصيلية", content: idea.detailedObjectives, color: "text-orange-600" }] : []),
    { icon: Lightbulb, title: "الفكرة", content: idea.idea, color: "text-amber-600" },
    { icon: Target, title: "الهدف", content: idea.objective, color: "text-blue-600" },
    { icon: FileText, title: "مبررات البرنامج", content: idea.justifications, color: "text-purple-600" },
    { icon: Star, title: "المميزات", content: idea.features, color: "text-yellow-600" },
    { icon: Zap, title: "نقاط القوة", content: idea.strengths, color: "text-green-600" },
    { icon: Package, title: "المخرجات", content: idea.outputs, color: "text-indigo-600" },
    { icon: TrendingUp, title: "النتائج المتوقعة", content: idea.expectedResults, color: "text-teal-600" },
    ...(idea.risks ? [{ icon: AlertTriangle, title: "المخاطر", content: idea.risks, color: "text-red-600" }] : []),
  ];

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen">
        {/* Header */}
        <Navbar />

        <div className="container py-20">
          <div className="max-w-md mx-auto text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <FolderOpen className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-4">سجل الأفكار</h2>
            <p className="text-muted-foreground mb-6">
              يرجى تسجيل الدخول للوصول إلى سجل أفكارك المحفوظة
            </p>
            <Button asChild className="gradient-primary border-0">
              <a href={getLoginUrl()}>تسجيل الدخول</a>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <Navbar />

      {/* Main Content */}
      <section className="py-6 md:py-8 lg:py-12">
        <div className="container px-3 md:px-6">
          <div className="max-w-4xl mx-auto">
            {/* Page Header */}
            <div className="mb-6 md:mb-8">
              <h2 className="text-xl md:text-2xl lg:text-3xl font-bold mb-1 md:mb-2">سجل الأفكار</h2>
              <p className="text-sm md:text-base text-muted-foreground">
                جميع الأفكار التي قمت بتوليدها مسبقاً
              </p>
            </div>

            {/* Search */}
            <div className="relative mb-4 md:mb-6">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
              <Input
                placeholder="ابحث في الأفكار..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-9 md:pr-10 h-10 md:h-12 text-sm md:text-base"
                dir="rtl"
              />
            </div>

            {/* Stats */}
            {data && (
              <div className="flex items-center gap-4 mb-4 md:mb-6 text-xs md:text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <FolderOpen className="h-3.5 w-3.5 md:h-4 md:w-4" />
                  {data.total} فكرة محفوظة
                </span>
              </div>
            )}

            {/* Ideas List */}
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : data?.ideas.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                  <FolderOpen className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">لا توجد أفكار</h3>
                <p className="text-muted-foreground mb-6">
                  {searchQuery ? "لم يتم العثور على نتائج للبحث" : "لم تقم بتوليد أي أفكار بعد"}
                </p>
                {!searchQuery && (
                  <Link href="/">
                    <Button className="gradient-primary border-0 gap-2">
                      <Sparkles className="h-4 w-4" />
                      ابدأ بتوليد فكرة جديدة
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-3 md:space-y-4">
                {data?.ideas.map((idea) => (
                  <Card key={idea.id} className="border-0 shadow-md overflow-hidden">
                    <CardHeader 
                      className="cursor-pointer hover:bg-muted/50 transition-colors p-3 md:p-6"
                      onClick={() => setExpandedId(expandedId === idea.id ? null : idea.id)}
                    >
                      <div className="flex items-start justify-between gap-2 md:gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 md:mb-2">
                            <CardTitle className="text-sm md:text-base font-medium line-clamp-2">
                              {idea.programDescription}
                            </CardTitle>
                            {idea.isApproved && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 whitespace-nowrap">
                                <Sparkles className="h-3 w-3" />
                                معتمد
                              </span>
                            )}
                          </div>
                          <CardDescription className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm">
                            <Calendar className="h-3.5 w-3.5 md:h-4 md:w-4" />
                            {formatDate(idea.createdAt)}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          {expandedId === idea.id ? (
                            <ChevronUp className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                    </CardHeader>

                    {expandedId === idea.id && (
                      <CardContent className="pt-0 animate-fade-in p-3 md:p-6 md:pt-0">
                        {/* Actions */}
                        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 mb-4 md:mb-6 pb-3 md:pb-4 border-b">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={(e) => {
                              e.stopPropagation();
                              copyAllContent(idea);
                            }}
                            className="gap-1 md:gap-2 text-xs md:text-sm px-2 md:px-3"
                          >
                            <Copy className="h-3.5 w-3.5 md:h-4 md:w-4" />
                            نسخ
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={(e) => {
                              e.stopPropagation();
                              downloadAsText(idea);
                            }}
                            className="gap-1 md:gap-2 text-xs md:text-sm px-2 md:px-3"
                          >
                            <Download className="h-3.5 w-3.5 md:h-4 md:w-4" />
                            TXT
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={(e) => {
                              e.stopPropagation();
                              downloadAsPDF(idea);
                            }}
                            disabled={exportingPDFId === idea.id}
                            className="gap-1 md:gap-2 text-xs md:text-sm px-2 md:px-3"
                          >
                            {exportingPDFId === idea.id ? (
                              <Loader2 className="h-3.5 w-3.5 md:h-4 md:w-4 animate-spin" />
                            ) : (
                              <FileDown className="h-3.5 w-3.5 md:h-4 md:w-4" />
                            )}
                            PDF
                          </Button>
                          <Link href={`/project-dashboard/${idea.id}`}>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={(e) => e.stopPropagation()}
                              className="gap-1 md:gap-2 text-xs md:text-sm px-2 md:px-3 text-emerald-600 hover:text-emerald-700 border-emerald-300 hover:border-emerald-400"
                            >
                              <BarChart3 className="h-3.5 w-3.5 md:h-4 md:w-4" />
                              لوحة المتابعة
                            </Button>
                          </Link>
                          {idea.isApproved && (
                            <>
                              <Link href={`/sustainability/${idea.id}`}>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={(e) => e.stopPropagation()}
                                  className="gap-1 md:gap-2 text-xs md:text-sm px-2 md:px-3 text-green-600 hover:text-green-700 border-green-300 hover:border-green-400 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100"
                                >
                                  <Sparkles className="h-3.5 w-3.5 md:h-4 md:w-4" />
                                  خبير الاستدامة
                                </Button>
                              </Link>
                              <Link href={`/research/${idea.id}`}>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={(e) => e.stopPropagation()}
                                  className="gap-1 md:gap-2 text-xs md:text-sm px-2 md:px-3 text-blue-600 hover:text-blue-700 border-blue-300 hover:border-blue-400 bg-gradient-to-r from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100"
                                >
                                  <BookOpen className="h-3.5 w-3.5 md:h-4 md:w-4" />
                                  الدراسة البحثية
                                </Button>
                              </Link>
                            </>
                          )}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="gap-1 md:gap-2 text-xs md:text-sm px-2 md:px-3 text-destructive hover:text-destructive"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Trash2 className="h-3.5 w-3.5 md:h-4 md:w-4" />
                                حذف
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
                                <AlertDialogDescription>
                                  سيتم حذف هذه الفكرة نهائياً ولا يمكن استرجاعها.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter className="gap-2">
                                <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteMutation.mutate({ id: idea.id })}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  حذف
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>

                        {/* Content Sections */}
                        <div className="space-y-4">
                          {getSections(idea).map((section, index) => (
                            <div key={index} className="p-4 bg-muted/30 rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium flex items-center gap-2">
                                  <section.icon className={`h-4 w-4 ${section.color}`} />
                                  {section.title}
                                </h4>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    copyToClipboard(section.content, section.title);
                                  }}
                                  className="h-8 w-8 p-0"
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </div>
                              <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                                {section.content}
                              </p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t bg-card/50">
        <div className="container text-center text-sm text-muted-foreground">
          <p>مسار الابتكار - حلول مبتكرة للمنظمات غير الربحية</p>
        </div>
      </footer>
    </div>
  );
}
