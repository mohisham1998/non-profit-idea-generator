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
  DollarSign,
  Receipt,
  PiggyBank,
  AlertTriangle
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

interface BudgetCategory {
  name: string;
  amount: number;
  percentage: number;
  items: string[];
}

interface BudgetData {
  totalBudget: number;
  currency: string;
  categories: BudgetCategory[];
  assumptions: string[];
  recommendations: string[];
}

interface EditableBudgetProps {
  data: BudgetData;
  onSave: (updatedData: BudgetData) => void;
  onClose: () => void;
}

export function EditableBudget({ data, onSave, onClose }: EditableBudgetProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<BudgetData>(JSON.parse(JSON.stringify(data)));

  const handleSave = () => {
    onSave(editedData);
    setIsEditing(false);
    toast.success("تم حفظ التعديلات بنجاح!");
  };

  const handleCancel = () => {
    setEditedData(JSON.parse(JSON.stringify(data)));
    setIsEditing(false);
  };

  const addCategory = () => {
    setEditedData({
      ...editedData,
      categories: [
        ...editedData.categories,
        { name: "", amount: 0, percentage: 0, items: [] }
      ]
    });
  };

  const removeCategory = (index: number) => {
    setEditedData({
      ...editedData,
      categories: editedData.categories.filter((_, i) => i !== index)
    });
  };

  const updateCategory = (index: number, field: keyof BudgetCategory, value: any) => {
    const newCategories = [...editedData.categories];
    newCategories[index] = { ...newCategories[index], [field]: value };
    setEditedData({ ...editedData, categories: newCategories });
  };

  const addItem = (categoryIndex: number) => {
    const newCategories = [...editedData.categories];
    newCategories[categoryIndex].items.push("");
    setEditedData({ ...editedData, categories: newCategories });
  };

  const removeItem = (categoryIndex: number, itemIndex: number) => {
    const newCategories = [...editedData.categories];
    newCategories[categoryIndex].items = newCategories[categoryIndex].items.filter((_, i) => i !== itemIndex);
    setEditedData({ ...editedData, categories: newCategories });
  };

  const updateItem = (categoryIndex: number, itemIndex: number, value: string) => {
    const newCategories = [...editedData.categories];
    newCategories[categoryIndex].items[itemIndex] = value;
    setEditedData({ ...editedData, categories: newCategories });
  };

  return (
    <Card className="border-0 shadow-lg overflow-hidden card-3d glass glass-card-enhanced">
      <CardHeader className="bg-gradient-to-l from-emerald-600 to-green-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              تقدير الميزانية التقريبية
            </CardTitle>
            <CardDescription className="text-white/80">
              تقدير مبني على أسعار السوق السعودي
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
            <div className="bg-gradient-to-l from-emerald-50 to-green-50 rounded-xl p-6 border border-emerald-200">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">الميزانية الإجمالية التقديرية</p>
                <p className="text-4xl font-bold text-emerald-700">
                  {data.totalBudget?.toLocaleString('ar-SA')}
                </p>
                <p className="text-lg text-emerald-600 mt-1">{data.currency}</p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold flex items-center gap-2 mb-4">
                <Receipt className="h-4 w-4 text-emerald-600" />
                تفصيل التكاليف حسب الفئة
              </h4>
              <div className="space-y-4">
                {data.categories?.map((category, idx) => (
                  <div key={idx} className="bg-accent/30 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{category.name}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground">{category.percentage}%</span>
                        <span className="font-bold text-emerald-700">
                          {category.amount?.toLocaleString('ar-SA')} ر.س
                        </span>
                      </div>
                    </div>
                    <ul className="text-sm text-muted-foreground space-y-1 mr-4">
                      {category.items?.map((item, itemIdx) => (
                        <li key={itemIdx} className="list-disc">{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {data.assumptions && data.assumptions.length > 0 && (
              <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                <h4 className="font-semibold flex items-center gap-2 mb-3 text-amber-700">
                  <AlertTriangle className="h-4 w-4" />
                  افتراضات التقدير
                </h4>
                <ul className="space-y-2">
                  {data.assumptions.map((assumption, idx) => (
                    <li key={idx} className="text-sm text-amber-800 flex items-start gap-2">
                      <span className="shrink-0">•</span>
                      {assumption}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {data.recommendations && data.recommendations.length > 0 && (
              <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
                <h4 className="font-semibold flex items-center gap-2 mb-3 text-emerald-700">
                  <PiggyBank className="h-4 w-4" />
                  توصيات لتحسين الميزانية
                </h4>
                <ul className="space-y-2">
                  {data.recommendations.map((rec, idx) => (
                    <li key={idx} className="text-sm text-emerald-800 flex items-start gap-2">
                      <span className="shrink-0">•</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Edit mode */}
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">الميزانية الإجمالية</label>
                  <Input
                    type="number"
                    value={editedData.totalBudget}
                    onChange={(e) => setEditedData({ ...editedData, totalBudget: Number(e.target.value) })}
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">العملة</label>
                  <Input
                    value={editedData.currency}
                    onChange={(e) => setEditedData({ ...editedData, currency: e.target.value })}
                    dir="rtl"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">الفئات</h4>
                  <Button size="sm" onClick={addCategory} variant="outline">
                    <Plus className="h-4 w-4 ml-2" />
                    إضافة فئة
                  </Button>
                </div>

                {editedData.categories.map((category, catIdx) => (
                  <div key={catIdx} className="border rounded-lg p-4 space-y-3 bg-accent/10">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">فئة {catIdx + 1}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeCategory(catIdx)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs font-medium mb-1 block">اسم الفئة</label>
                        <Input
                          value={category.name}
                          onChange={(e) => updateCategory(catIdx, 'name', e.target.value)}
                          dir="rtl"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium mb-1 block">المبلغ</label>
                        <Input
                          type="number"
                          value={category.amount}
                          onChange={(e) => updateCategory(catIdx, 'amount', Number(e.target.value))}
                          dir="ltr"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium mb-1 block">النسبة %</label>
                        <Input
                          type="number"
                          value={category.percentage}
                          onChange={(e) => updateCategory(catIdx, 'percentage', Number(e.target.value))}
                          dir="ltr"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-medium">البنود</label>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => addItem(catIdx)}
                          className="h-7 px-2"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      {category.items.map((item, itemIdx) => (
                        <div key={itemIdx} className="flex gap-2">
                          <Input
                            value={item}
                            onChange={(e) => updateItem(catIdx, itemIdx, e.target.value)}
                            dir="rtl"
                            placeholder="بند التكلفة"
                            className="text-sm"
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeItem(catIdx, itemIdx)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
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
            إغلاق الميزانية
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
