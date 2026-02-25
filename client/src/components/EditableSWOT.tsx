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
  Grid3X3,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Compass,
  CheckCircle
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

interface SWOTItem {
  title: string;
  description: string;
}

interface SWOTData {
  strengths: SWOTItem[];
  weaknesses: SWOTItem[];
  opportunities: SWOTItem[];
  threats: SWOTItem[];
  strategies: string[];
  summary: string;
}

interface EditableSWOTProps {
  data: SWOTData;
  onSave: (updatedData: SWOTData) => void;
  onClose: () => void;
}

export function EditableSWOT({ data, onSave, onClose }: EditableSWOTProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<SWOTData>(JSON.parse(JSON.stringify(data)));

  const handleSave = () => {
    onSave(editedData);
    setIsEditing(false);
    toast.success("تم حفظ التعديلات بنجاح!");
  };

  const handleCancel = () => {
    setEditedData(JSON.parse(JSON.stringify(data)));
    setIsEditing(false);
  };

  const addItem = (category: 'strengths' | 'weaknesses' | 'opportunities' | 'threats') => {
    setEditedData({
      ...editedData,
      [category]: [...editedData[category], { title: "", description: "" }]
    });
  };

  const removeItem = (category: 'strengths' | 'weaknesses' | 'opportunities' | 'threats', index: number) => {
    setEditedData({
      ...editedData,
      [category]: editedData[category].filter((_, i) => i !== index)
    });
  };

  const updateItem = (
    category: 'strengths' | 'weaknesses' | 'opportunities' | 'threats',
    index: number,
    field: 'title' | 'description',
    value: string
  ) => {
    const newItems = [...editedData[category]];
    newItems[index] = { ...newItems[index], [field]: value };
    setEditedData({ ...editedData, [category]: newItems });
  };

  const addStrategy = () => {
    setEditedData({
      ...editedData,
      strategies: [...editedData.strategies, ""]
    });
  };

  const removeStrategy = (index: number) => {
    setEditedData({
      ...editedData,
      strategies: editedData.strategies.filter((_, i) => i !== index)
    });
  };

  const updateStrategy = (index: number, value: string) => {
    const newStrategies = [...editedData.strategies];
    newStrategies[index] = value;
    setEditedData({ ...editedData, strategies: newStrategies });
  };

  const renderCategory = (
    category: 'strengths' | 'weaknesses' | 'opportunities' | 'threats',
    title: string,
    icon: any,
    colorClass: string
  ) => {
    const Icon = icon;
    const items = editedData[category];

    if (!isEditing) {
      const bgClass = category === 'strengths' ? 'bg-green-50 border-green-200' :
                      category === 'weaknesses' ? 'bg-red-50 border-red-200' :
                      category === 'opportunities' ? 'bg-blue-50 border-blue-200' :
                      'bg-amber-50 border-amber-200';
      const textClass = category === 'strengths' ? 'text-green-700' :
                        category === 'weaknesses' ? 'text-red-700' :
                        category === 'opportunities' ? 'text-blue-700' :
                        'text-amber-700';

      return (
        <div className={`${bgClass} rounded-xl p-4 border`}>
          <h4 className={`font-bold ${textClass} flex items-center gap-2 mb-3`}>
            <Icon className="h-4 w-4" />
            {title}
          </h4>
          <ul className="space-y-2">
            {items?.map((item, idx) => (
              <li key={idx} className="text-sm">
                <span className={`font-medium ${textClass}`}>{item.title}</span>
                <p className={`${textClass}/80 text-xs mt-0.5`}>{item.description}</p>
              </li>
            ))}
          </ul>
        </div>
      );
    }

    return (
      <div className="border rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-sm">{title}</h4>
          <Button size="sm" variant="outline" onClick={() => addItem(category)}>
            <Plus className="h-3 w-3 ml-1" />
            إضافة
          </Button>
        </div>
        {items.map((item, idx) => (
          <div key={idx} className="border rounded p-3 space-y-2 bg-accent/5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium">عنصر {idx + 1}</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => removeItem(category, idx)}
                className="h-6 w-6 p-0 text-red-600"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
            <Input
              value={item.title}
              onChange={(e) => updateItem(category, idx, 'title', e.target.value)}
              placeholder="العنوان"
              dir="rtl"
              className="text-sm"
            />
            <Textarea
              value={item.description}
              onChange={(e) => updateItem(category, idx, 'description', e.target.value)}
              placeholder="الوصف"
              dir="rtl"
              rows={2}
              className="text-sm"
            />
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card className="border-0 shadow-lg overflow-hidden card-3d glass glass-card-enhanced">
      <CardHeader className="bg-gradient-to-l from-purple-600 to-indigo-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Grid3X3 className="h-5 w-5" />
              تحليل SWOT
            </CardTitle>
            <CardDescription className="text-white/80">
              تحليل شامل لنقاط القوة والضعف والفرص والتهديدات
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderCategory('strengths', 'نقاط القوة (Strengths)', TrendingUp, 'text-green-700')}
              {renderCategory('weaknesses', 'نقاط الضعف (Weaknesses)', TrendingDown, 'text-red-700')}
              {renderCategory('opportunities', 'الفرص (Opportunities)', TrendingUp, 'text-blue-700')}
              {renderCategory('threats', 'التهديدات (Threats)', AlertTriangle, 'text-amber-700')}
            </div>

            <div>
              <h4 className="font-semibold flex items-center gap-2 mb-3">
                <Compass className="h-4 w-4 text-purple-600" />
                الاستراتيجيات المقترحة
              </h4>
              <ul className="space-y-2">
                {data.strategies?.map((strategy, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm bg-purple-50 rounded-lg p-3">
                    <CheckCircle className="h-4 w-4 text-purple-600 mt-0.5 shrink-0" />
                    {strategy}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-gradient-to-l from-purple-50 to-indigo-50 rounded-lg p-4 border border-purple-200">
              <p className="text-sm text-purple-800">{data.summary}</p>
            </div>
          </>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderCategory('strengths', 'نقاط القوة', TrendingUp, 'text-green-700')}
              {renderCategory('weaknesses', 'نقاط الضعف', TrendingDown, 'text-red-700')}
              {renderCategory('opportunities', 'الفرص', TrendingUp, 'text-blue-700')}
              {renderCategory('threats', 'التهديدات', AlertTriangle, 'text-amber-700')}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">الاستراتيجيات</h4>
                <Button size="sm" onClick={addStrategy} variant="outline">
                  <Plus className="h-4 w-4 ml-2" />
                  إضافة استراتيجية
                </Button>
              </div>
              {editedData.strategies.map((strategy, idx) => (
                <div key={idx} className="flex gap-2">
                  <Textarea
                    value={strategy}
                    onChange={(e) => updateStrategy(idx, e.target.value)}
                    dir="rtl"
                    rows={2}
                    placeholder="أدخل الاستراتيجية"
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeStrategy(idx)}
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
          </>
        )}

        {!isEditing && (
          <Button 
            variant="outline" 
            onClick={onClose}
            className="w-full"
          >
            <X className="h-4 w-4 ml-2" />
            إغلاق تحليل SWOT
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
