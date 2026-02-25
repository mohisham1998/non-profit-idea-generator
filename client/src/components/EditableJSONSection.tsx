import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Edit3, Save, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

interface EditableJSONSectionProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  headerClass: string;
  data: any;
  onSave: (updatedData: any) => void;
  onClose: () => void;
  children: React.ReactNode;
}

export function EditableJSONSection({
  title,
  description,
  icon,
  headerClass,
  data,
  onSave,
  onClose,
  children
}: EditableJSONSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedJSON, setEditedJSON] = useState(JSON.stringify(data, null, 2));
  const [jsonError, setJsonError] = useState<string | null>(null);

  const handleSave = () => {
    try {
      const parsed = JSON.parse(editedJSON);
      onSave(parsed);
      setIsEditing(false);
      setJsonError(null);
      toast.success("تم حفظ التعديلات بنجاح!");
    } catch (error) {
      setJsonError("خطأ في صيغة JSON. يرجى التحقق من البيانات.");
      toast.error("خطأ في صيغة JSON");
    }
  };

  const handleCancel = () => {
    setEditedJSON(JSON.stringify(data, null, 2));
    setIsEditing(false);
    setJsonError(null);
  };

  const handleJSONChange = (value: string) => {
    setEditedJSON(value);
    try {
      JSON.parse(value);
      setJsonError(null);
    } catch (error) {
      setJsonError("صيغة JSON غير صحيحة");
    }
  };

  return (
    <Card className="border-0 shadow-lg overflow-hidden card-3d glass glass-card-enhanced">
      <CardHeader className={headerClass}>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {icon}
              {title}
            </CardTitle>
            <CardDescription className="text-white/80">
              {description}
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
            {children}
            <Button 
              variant="outline" 
              onClick={onClose}
              className="w-full"
            >
              <X className="h-4 w-4 ml-2" />
              إغلاق
            </Button>
          </>
        ) : (
          <>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">تعديل البيانات (JSON)</label>
                {jsonError && (
                  <span className="text-xs text-red-600">{jsonError}</span>
                )}
              </div>
              <Textarea
                value={editedJSON}
                onChange={(e) => handleJSONChange(e.target.value)}
                className="font-mono text-xs min-h-[400px] resize-y"
                dir="ltr"
              />
              <div className="text-xs text-muted-foreground bg-accent/30 rounded p-3">
                💡 نصيحة: يمكنك تعديل البيانات بصيغة JSON. تأكد من صحة الصيغة قبل الحفظ.
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={handleSave} 
                className="flex-1"
                disabled={!!jsonError}
              >
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
      </CardContent>
    </Card>
  );
}
