/**
 * DeckLibrary — مكتبة عروض الشرائح
 *
 * Displays all user slide decks with:
 * - Data table (Code, Title, Slides, Status, Created Date)
 * - Row actions: Open, Rename, Duplicate, Delete
 * - Search and filter by status, date range
 */

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Library,
  Search,
  Pencil,
  Eye,
  Copy,
  Trash2,
  Loader2,
  FileQuestion,
  Filter,
} from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { DataTable } from '@/components/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useLocation } from 'wouter';
import { toast } from 'sonner';

const STATUS_LABELS: Record<string, string> = {
  draft: 'مسودة',
  published: 'منشور',
  archived: 'مؤرشف',
};

export default function DeckLibrary() {
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; title: string } | null>(null);
  const [renameTarget, setRenameTarget] = useState<{ id: number; title: string } | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [sortColumn, setSortColumn] = useState<string>('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const { data: decks, isLoading, refetch } = trpc.adminDashboard.getDecks.useQuery();
  const updateDeckMutation = trpc.adminDashboard.updateDeck.useMutation({
    onSuccess: () => {
      toast.success('تم تحديث العنوان');
      refetch();
      setRenameTarget(null);
    },
    onError: (e) => toast.error(e.message),
  });
  const deleteDeckMutation = trpc.adminDashboard.deleteDeck.useMutation({
    onSuccess: () => {
      toast.success('تم حذف العرض');
      refetch();
      setDeleteTarget(null);
    },
    onError: (e) => toast.error(e.message),
  });
  const duplicateDeckMutation = trpc.adminDashboard.duplicateDeck.useMutation({
    onSuccess: () => {
      toast.success('تم نسخ العرض بنجاح');
      refetch();
    },
    onError: (e) => toast.error(e.message),
  });

  const filteredAndSorted = useMemo(() => {
    if (!decks) return [];
    let list = decks.map((d) => ({
      id: d.id,
      title: d.title,
      slideCount: d.slideCount,
      status: d.status,
      createdAt: d.createdAt,
      statusLabel: STATUS_LABELS[d.status] || d.status,
    }));

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((d) => d.title.toLowerCase().includes(q));
    }
    if (statusFilter !== 'all') {
      list = list.filter((d) => d.status === statusFilter);
    }

    list.sort((a, b) => {
      const aVal = a[sortColumn as keyof typeof a];
      const bVal = b[sortColumn as keyof typeof b];
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return sortDir === 'asc' ? -1 : 1;
      if (bVal == null) return sortDir === 'asc' ? 1 : -1;
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDir === 'asc'
          ? aVal.localeCompare(bVal, 'ar')
          : bVal.localeCompare(aVal, 'ar');
      }
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
      }
      const aDate = aVal instanceof Date ? aVal : new Date(aVal as string);
      const bDate = bVal instanceof Date ? bVal : new Date(bVal as string);
      return sortDir === 'asc'
        ? aDate.getTime() - bDate.getTime()
        : bDate.getTime() - aDate.getTime();
    });

    return list;
  }, [decks, search, statusFilter, sortColumn, sortDir]);

  const handleOpen = (row: { id: number }) => {
    setLocation(`/admin/generate?deck=${row.id}`);
  };

  const handleDuplicate = (row: { id: number }) => {
    duplicateDeckMutation.mutate({ id: row.id });
  };

  const handleDeleteClick = (row: { id: number; title: string }) => {
    setDeleteTarget({ id: row.id, title: row.title });
  };

  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      deleteDeckMutation.mutate({ id: deleteTarget.id });
    }
  };

  const handleRenameClick = (row: { id: number; title: string }) => {
    setRenameTarget({ id: row.id, title: row.title });
    setRenameValue(row.title);
  };

  const handleRenameConfirm = () => {
    if (renameTarget && renameValue.trim()) {
      updateDeckMutation.mutate({
        id: renameTarget.id,
        title: renameValue.trim(),
      });
    }
  };

  const handleSort = (col: string) => {
    if (sortColumn === col) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(col);
      setSortDir('desc');
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Library className="h-7 w-7" />
          مكتبة العروض
        </h1>
        <p className="text-muted-foreground mt-1">
          تصفح وإدارة عروض الشرائح المولدة
        </p>
      </motion.div>

      {/* Search & Filter */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="البحث بالعنوان..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="الحالة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">الكل</SelectItem>
              <SelectItem value="draft">مسودة</SelectItem>
              <SelectItem value="published">منشور</SelectItem>
              <SelectItem value="archived">مؤرشف</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {/* DataTable */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        {isLoading ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-muted/30 py-16">
            <Loader2 className="h-10 w-10 animate-spin text-muted-foreground mb-4" />
            <p className="text-muted-foreground">جاري التحميل...</p>
          </div>
        ) : (
          <DataTable
            columns={[
              { key: 'id', label: 'الرمز', className: 'font-mono text-xs', sortable: true },
              { key: 'title', label: 'العنوان', sortable: true },
              { key: 'slideCount', label: 'الشرائح', sortable: true },
              {
                key: 'status',
                label: 'الحالة',
                render: (_, row) => {
                  const s = (row as { status: string }).status;
                  const colors: Record<string, string> = {
                    draft: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
                    published: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
                    archived: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
                  };
                  return (
                    <Badge variant="secondary" className={colors[s] || colors.draft}>
                      {STATUS_LABELS[s] || s}
                    </Badge>
                  );
                },
              },
              {
                key: 'createdAt',
                label: 'التاريخ',
                sortable: true,
                render: (v) =>
                  v ? new Date(v as string).toLocaleDateString('ar-SA') : '—',
              },
            ]}
            data={filteredAndSorted}
            sort={{
              column: sortColumn,
              direction: sortDir,
              onSort: handleSort,
            }}
            actions={[
              { icon: Eye, label: 'فتح', onClick: handleOpen },
              { icon: Pencil, label: 'تعديل', onClick: (r) => handleRenameClick(r as { id: number; title: string }) },
              { icon: Copy, label: 'نسخ', onClick: handleDuplicate },
              {
                icon: Trash2,
                label: 'حذف',
                variant: 'destructive',
                onClick: (r) => handleDeleteClick(r as { id: number; title: string }),
              },
            ]}
            emptyMessage="لا توجد عروض شرائح. أنشئ عرضاً من صفحة توليد الأفكار."
            emptyIcon={<FileQuestion className="h-12 w-12 text-muted-foreground mb-4" />}
            rowClassName={() => 'hover:bg-muted/30 transition-colors'}
          />
        )}
      </motion.div>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف &quot;{deleteTarget?.title}&quot;؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Rename dialog */}
      <AlertDialog open={!!renameTarget} onOpenChange={() => setRenameTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تعديل العنوان</AlertDialogTitle>
            <AlertDialogDescription>
              أدخل العنوان الجديد للعرض.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Input
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              placeholder="عنوان العرض"
              dir="rtl"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRenameConfirm}
              disabled={!renameValue.trim() || renameValue === renameTarget?.title}
            >
              حفظ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
