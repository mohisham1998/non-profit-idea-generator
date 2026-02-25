import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Save, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface JSONEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  data: any;
  onSave: (updatedData: any) => void;
}

export function JSONEditorModal({
  isOpen,
  onClose,
  title,
  data,
  onSave
}: JSONEditorModalProps) {
  const [editedJSON, setEditedJSON] = useState("");
  const [jsonError, setJsonError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && data) {
      setEditedJSON(JSON.stringify(data, null, 2));
      setJsonError(null);
    }
  }, [isOpen, data]);

  const handleSave = () => {
    try {
      const parsed = JSON.parse(editedJSON);
      onSave(parsed);
      toast.success("تم حفظ التعديلات بنجاح!");
      onClose();
    } catch (error) {
      setJsonError("خطأ في صيغة JSON. يرجى التحقق من البيانات.");
      toast.error("خطأ في صيغة JSON");
    }
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>تعديل {title}</DialogTitle>
          <DialogDescription>
            يمكنك تعديل البيانات بصيغة JSON. تأكد من صحة الصيغة قبل الحفظ.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto space-y-3">
          {jsonError && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
              {jsonError}
            </div>
          )}
          <Textarea
            value={editedJSON}
            onChange={(e) => handleJSONChange(e.target.value)}
            className="font-mono text-xs min-h-[500px] resize-none"
            dir="ltr"
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4 ml-2" />
            إلغاء
          </Button>
          <Button onClick={handleSave} disabled={!!jsonError}>
            <Save className="h-4 w-4 ml-2" />
            حفظ
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
