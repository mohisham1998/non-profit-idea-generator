import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, CheckCircle2, Clock, ArrowRight } from "lucide-react";

export default function ResearchList() {
  const { data, isLoading } = trpc.ideas.list.useQuery({ limit: 100, offset: 0 });

  // تصفية المشاريع المعتمدة فقط
  const approvedIdeas = data?.ideas?.filter((idea: any) => idea.isApproved) || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">جاري تحميل المشاريع...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">الدراسة البحثية</h1>
              <p className="text-gray-600 mt-1">دراسات بحثية أكاديمية شاملة للمشاريع المعتمدة</p>
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        {approvedIdeas.length === 0 ? (
          <Card className="border-2 border-dashed border-gray-300">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Clock className="w-16 h-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">لا توجد مشاريع معتمدة</h3>
              <p className="text-gray-500 text-center mb-6">
                قم باعتماد مشروع أولاً من صفحة السجل لتتمكن من عرض الدراسة البحثية
              </p>
              <Link href="/history">
                <Button className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600">
                  الذهاب إلى السجل
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {approvedIdeas.map((idea: any) => (
              <Card key={idea.id} className="hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-300">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <CheckCircle2 className="w-6 h-6 text-blue-500 flex-shrink-0" />
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                      معتمد
                    </span>
                  </div>
                  <CardTitle className="text-lg line-clamp-2">{idea.title}</CardTitle>
                  <CardDescription className="line-clamp-3 mt-2">
                    {idea.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">الفئة المستهدفة:</span>
                      <span className="font-medium text-gray-800">{idea.targetAudience}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">تاريخ الإنشاء:</span>
                      <span className="font-medium text-gray-800">
                        {new Date(idea.createdAt).toLocaleDateString('ar-SA')}
                      </span>
                    </div>
                    <Link href={`/research/${idea.id}`}>
                      <Button className="w-full mt-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700">
                        عرض الدراسة البحثية
                        <ArrowRight className="w-4 h-4 mr-2" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
