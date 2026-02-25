import { useState } from 'react';
import { useSlideStore } from '@/stores/slideStore';
import { Button } from '@/components/ui/button';
import { X, Sparkles, Check, PenLine, RefreshCw } from 'lucide-react';

interface ProposedNamesModalProps {
  onClose: () => void;
}

export function ProposedNamesModal({ onClose }: ProposedNamesModalProps) {
  const { proposedNames, presentationName, setPresentationName } = useSlideStore();

  const [selected, setSelected] = useState<string>(presentationName ?? '');
  const [customName, setCustomName] = useState('');
  const [useCustom, setUseCustom] = useState(false);

  const handleSelect = (name: string) => {
    setSelected(name);
    setUseCustom(false);
    setCustomName('');
  };

  const handleConfirm = () => {
    const final = useCustom ? customName.trim() : selected.trim();
    if (!final) return;
    setPresentationName(final);
    onClose();
  };

  const activeName = useCustom ? customName : selected;

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden"
        onClick={e => e.stopPropagation()}
        dir="rtl"
      >
        {/* ── Header ───────────────────────────────────────── */}
        <div className="bg-gradient-to-r from-violet-600 to-purple-700 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">اختر اسم المشروع</h2>
              <p className="text-sm text-purple-200">اختر من الأسماء المقترحة أو أدخل اسمك الخاص</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">

          {/* ── AI Suggested Names ───────────────────────── */}
          {proposedNames.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-4 w-4 text-purple-500" />
                <h3 className="text-sm font-semibold text-gray-700">الأسماء المقترحة بالذكاء الاصطناعي</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {proposedNames.map((name, idx) => {
                  const isActive = !useCustom && selected === name;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelect(name)}
                      className={`
                        group relative text-right rounded-xl border-2 px-4 py-3 transition-all duration-200
                        ${isActive
                          ? 'border-violet-500 bg-violet-50 shadow-md'
                          : 'border-gray-200 bg-white hover:border-violet-300 hover:bg-violet-50/50'}
                      `}
                    >
                      <span className="block text-[10px] font-semibold text-violet-400 mb-1">
                        الاسم {idx + 1}
                      </span>
                      <span className={`block text-sm font-bold leading-snug ${isActive ? 'text-violet-800' : 'text-gray-800'}`}>
                        {name}
                      </span>
                      {isActive && (
                        <span className="absolute top-2 left-2 w-5 h-5 bg-violet-500 rounded-full flex items-center justify-center">
                          <Check className="h-3 w-3 text-white" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {/* ── Custom Name Input ────────────────────────── */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <PenLine className="h-4 w-4 text-gray-500" />
              <h3 className="text-sm font-semibold text-gray-700">أو اكتب اسمك الخاص</h3>
            </div>
            <div className="relative">
              <input
                type="text"
                dir="rtl"
                value={customName}
                onChange={e => {
                  setCustomName(e.target.value);
                  setUseCustom(true);
                  setSelected('');
                }}
                onFocus={() => setUseCustom(true)}
                placeholder="مثال: مبادرة نور للتعليم المستدام..."
                className={`
                  w-full rounded-xl border-2 px-4 py-3 text-sm text-gray-800 placeholder-gray-400
                  focus:outline-none transition-colors
                  ${useCustom && customName
                    ? 'border-violet-500 bg-violet-50'
                    : 'border-gray-200 bg-white focus:border-violet-300'}
                `}
              />
              {useCustom && customName && (
                <span className="absolute top-1/2 left-3 -translate-y-1/2 w-5 h-5 bg-violet-500 rounded-full flex items-center justify-center">
                  <Check className="h-3 w-3 text-white" />
                </span>
              )}
            </div>
          </section>

          {/* ── Preview ──────────────────────────────────── */}
          {activeName && (
            <section className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <p className="text-[10px] text-gray-500 mb-1 font-medium uppercase tracking-wider">المعاينة — سيظهر في الغلاف وعنوان العرض</p>
              <p className="text-base font-bold text-gray-800 leading-snug">{activeName}</p>
            </section>
          )}
        </div>

        {/* ── Footer ───────────────────────────────────────── */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-3 bg-gray-50">
          <button
            onClick={onClose}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            إلغاء
          </button>
          <Button
            onClick={handleConfirm}
            disabled={!activeName.trim()}
            className="bg-violet-600 hover:bg-violet-700 text-white gap-2 disabled:opacity-50"
          >
            <Check className="h-4 w-4" />
            تأكيد الاسم
          </Button>
        </div>
      </div>
    </div>
  );
}
