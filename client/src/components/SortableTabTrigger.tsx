import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TabsTrigger } from '@/components/ui/tabs';
import { GripVertical } from 'lucide-react';
import { ReactNode } from 'react';

interface SortableTabTriggerProps {
  id: string;
  value: string;
  icon: ReactNode;
  label: string;
}

export function SortableTabTrigger({ id, value, icon, label }: SortableTabTriggerProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-1">
      <button
        {...listeners}
        {...attributes}
        className="cursor-grab active:cursor-grabbing p-1 hover:bg-accent rounded"
        aria-label="سحب لإعادة الترتيب"
      >
        <GripVertical className="w-3 h-3 text-muted-foreground" />
      </button>
      <TabsTrigger value={value} className="gap-2 flex-1">
        {icon}
        <span className="hidden sm:inline">{label}</span>
      </TabsTrigger>
    </div>
  );
}
