import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Edit3, 
  Save, 
  X, 
  Plus, 
  Trash2,
  Gauge,
  BarChart3,
  Activity,
  Calendar,
  ClipboardList,
  ThumbsUp,
  CheckCircle
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

interface KPI {
  name: string;
  description: string;
  type: string;
  category: string;
  target: string;
  frequency: string;
  measurementMethod: string;
}

interface KPIsData {
  kpis: KPI[];
  recommendations: string[];
  summary: string;
}

interface EditableKPIsProps {
  data: KPIsData;
  onSave: (updatedData: KPIsData) => void;
  onClose: () => void;
}

export function EditableKPIs({ data, onSave, onClose }: EditableKPIsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<KPIsData>(JSON.parse(JSON.stringify(data)));

  const handleSave = () => {
    onSave(editedData);
    setIsEditing(false);
    toast.success("تم حفظ التعديلات بنجاح!");
  };

  const handleCancel = () => {
    setEditedData(JSON.parse(JSON.stringify(data)));
    setIsEditing(false);
  };

  const addKPI = () => {
    setEditedData({
      ...editedData,
      kpis: [
        ...editedData.kpis,
        {
          name: "",
          description: "",
          type: "كمي",
          category: "مخرجات",
          target: "",
          frequency: "شهري",
          measurementMethod: ""
        }
      ]
    });
  };

  const removeKPI = (index: number) => {
    setEditedData({
      ...editedData,
      kpis: editedData.kpis.filter((_, i) => i !== index)
    });
  };

  const updateKPI = (index: number, field: keyof KPI, value: string) => {
    const newKPIs = [...editedData.kpis];
    newKPIs[index] = { ...newKPIs[index], [field]: value };
    setEditedData({ ...editedData, kpis: newKPIs });
  };

  const addRecommendation = () => {
    setEditedData({
      ...editedData,
      recommendations: [...editedData.recommendations, ""]
    });
  };

  const removeRecommendation = (index: number) => {
    setEditedData({
      ...editedData,
      recommendations: editedData.recommendations.filter((_, i) => i !== index)
    });
  };

  const updateRecommendation = (index: number, value: string) => {
    const newRecs = [...editedData.recommendations];
    newRecs[index] = value;
    setEditedData({ ...editedData, recommendations: newRecs });
  };

  return (
    <Card className="border-0 shadow-lg overflow-hidden card-3d glass glass-card-enhanced">
      <CardHeader className="bg-gradient-to-l from-cyan-600 to-teal-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Gauge className="h-5 w-5" />
              مؤشرات قياس الأداء (KPIs)
            </CardTitle>
            <CardDescription className="text-white/80">
              مؤشرات عملية لقياس نجاح البرنامج
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
            className="text-white hover:bg-white/20"
          >
            {isEditing ? <X className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {!isEditing ? (
          <>
            {/* Read-only view */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-accent/30">
                    <th className="text-right p-3 font-semibold">المؤشر</th>
                    <th className="text-right p-3 font-semibold">النوع</th>
                    <th className="text-right p-3 font-semibold">الفئة</th>
                    <th className="text-right p-3 font-semibold">الهدف</th>
                    <th className="text-right p-3 font-semibold">دورية القياس</th>
                  </tr>
                </thead>
                <tbody>
                  {data.kpis?.map((kpi, idx) => (
                    <tr key={idx} className="border-b hover:bg-accent/20 transition-colors">
                      <td className="p-3">
                        <div className="font-medium">{kpi.name}</div>
                        <div className="text-xs text-muted-foreground mt-1">{kpi.description}</div>
                      </td>
                      <td className="p-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          kpi.type === 'كمي' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                        }`}>
                          {kpi.type === 'كمي' ? <BarChart3 className="h-3 w-3" /> : <Activity className="h-3 w-3" />}
                          {kpi.type}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          kpi.category === 'مخرجات' ? 'bg-green-100 text-green-700' :
                          kpi.category === 'نتائج' ? 'bg-amber-100 text-amber-700' :
                          'bg-rose-100 text-rose-700'
                        }`}>
                          {kpi.category}
                        </span>
                      </td>
                      <td className="p-3 font-medium text-primary">{kpi.target}</td>
                      <td className="p-3">
                        <span className="inline-flex items-center gap-1 text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {kpi.frequency}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-accent/30 rounded-lg p-4">
              <h4 className="font-semibold flex items-center gap-2 mb-3">
                <ClipboardList className="h-4 w-4 text-teal-600" />
                طرق القياس
              </h4>
              <div className="grid gap-3">
                {data.kpis?.slice(0, 4).map((kpi, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm">
                    <span className="font-medium text-primary shrink-0">{kpi.name}:</span>
                    <span className="text-muted-foreground">{kpi.measurementMethod}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold flex items-center gap-2 mb-3">
                <ThumbsUp className="h-4 w-4 text-teal-600" />
                توصيات لتحسين عملية القياس
              </h4>
              <ul className="space-y-2">
                {data.recommendations?.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-teal-600 mt-0.5 shrink-0" />
                    {rec}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-gradient-to-l from-cyan-50 to-teal-50 rounded-lg p-4 border border-teal-200">
              <h4 className="font-semibold mb-2 text-teal-700">ملخص</h4>
              <p className="text-sm leading-relaxed text-teal-800">{data.summary}</p>
            </div>
          </>
        ) : (
          <>
            {/* Edit mode */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">المؤشرات</h4>
                <Button size="sm" onClick={addKPI} variant="outline">
                  <Plus className="h-4 w-4 ml-2" />
                  إضافة مؤشر
                </Button>
              </div>

              {editedData.kpis.map((kpi, idx) => (
                <div key={idx} className="border rounded-lg p-4 space-y-3 bg-accent/10">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">مؤشر {idx + 1}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeKPI(idx)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <label className="text-xs font-medium mb-1 block">اسم المؤشر</label>
                      <Input
                        value={kpi.name}
                        onChange={(e) => updateKPI(idx, 'name', e.target.value)}
                        dir="rtl"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs font-medium mb-1 block">الوصف</label>
                      <Textarea
                        value={kpi.description}
                        onChange={(e) => updateKPI(idx, 'description', e.target.value)}
                        dir="rtl"
                        rows={2}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium mb-1 block">النوع</label>
                      <select
                        value={kpi.type}
                        onChange={(e) => updateKPI(idx, 'type', e.target.value)}
                        className="w-full px-3 py-2 border rounded-md text-sm"
                        dir="rtl"
                      >
                        <option value="كمي">كمي</option>
                        <option value="نوعي">نوعي</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium mb-1 block">الفئة</label>
                      <select
                        value={kpi.category}
                        onChange={(e) => updateKPI(idx, 'category', e.target.value)}
                        className="w-full px-3 py-2 border rounded-md text-sm"
                        dir="rtl"
                      >
                        <option value="مخرجات">مخرجات</option>
                        <option value="نتائج">نتائج</option>
                        <option value="تأثير">تأثير</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium mb-1 block">الهدف</label>
                      <Input
                        value={kpi.target}
                        onChange={(e) => updateKPI(idx, 'target', e.target.value)}
                        dir="rtl"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium mb-1 block">دورية القياس</label>
                      <select
                        value={kpi.frequency}
                        onChange={(e) => updateKPI(idx, 'frequency', e.target.value)}
                        className="w-full px-3 py-2 border rounded-md text-sm"
                        dir="rtl"
                      >
                        <option value="يومي">يومي</option>
                        <option value="أسبوعي">أسبوعي</option>
                        <option value="شهري">شهري</option>
                        <option value="ربع سنوي">ربع سنوي</option>
                        <option value="سنوي">سنوي</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs font-medium mb-1 block">طريقة القياس</label>
                      <Textarea
                        value={kpi.measurementMethod}
                        onChange={(e) => updateKPI(idx, 'measurementMethod', e.target.value)}
                        dir="rtl"
                        rows={2}
                      />
                    </div>
                  </div>
                </div>
              ))}

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">التوصيات</h4>
                  <Button size="sm" onClick={addRecommendation} variant="outline">
                    <Plus className="h-4 w-4 ml-2" />
                    إضافة توصية
                  </Button>
                </div>
                {editedData.recommendations.map((rec, idx) => (
                  <div key={idx} className="flex gap-2">
                    <Input
                      value={rec}
                      onChange={(e) => updateRecommendation(idx, e.target.value)}
                      dir="rtl"
                      placeholder="أدخل التوصية"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeRecommendation(idx)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">الملخص</label>
                <Textarea
                  value={editedData.summary}
                  onChange={(e) => setEditedData({ ...editedData, summary: e.target.value })}
                  dir="rtl"
                  rows={4}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSave} className="flex-1">
                  <Save className="h-4 w-4 ml-2" />
                  حفظ التعديلات
                </Button>
                <Button onClick={handleCancel} variant="outline">
                  <X className="h-4 w-4 ml-2" />
                  إلغاء
                </Button>
              </div>
            </div>
          </>
        )}

        {!isEditing && (
          <Button 
            variant="outline" 
            onClick={onClose}
            className="w-full"
          >
            <X className="h-4 w-4 ml-2" />
            إغلاق المؤشرات
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
