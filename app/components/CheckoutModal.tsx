import { CheckCircle2, ChevronRight, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { WorkspaceState, InventoryItem, PlacedItem } from '../lib/data';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedState: WorkspaceState;
  totalPrice: number;
}

export default function CheckoutModal({
  isOpen,
  onClose,
  selectedState,
  totalPrice,
}: CheckoutModalProps) {
  const [mounted, setMounted] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 1);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    onClose();
    // delay reset so it doesn't flash during close animation
    setTimeout(() => setIsConfirmed(false), 300);
  };

  if (!mounted) return null;

  const orderItems = [
    selectedState.desk,
    selectedState.chair?.item,
    ...selectedState.accessories.map((acc: PlacedItem) => acc.item),
  ].filter(Boolean) as InventoryItem[];

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${
        isOpen
          ? 'opacity-100 pointer-events-auto'
          : 'opacity-0 pointer-events-none'
      }`}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={handleClose} />

      {/* Modal Content */}
      <div
        className={`relative w-full max-w-[500px] p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-xl transition-all duration-300 ease-out ${
          isOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`}
      >
        <button
          onClick={handleClose}
          className="absolute top-6 right-6 p-2 rounded-full text-slate-500 hover:bg-black/5 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {isConfirmed ? (
          <div className="flex flex-col items-center justify-center py-12 text-center animate-in zoom-in-95 fade-in duration-500">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping" />
              <CheckCircle2 className="w-20 h-20 text-emerald-500 relative z-10 bg-white dark:bg-slate-900 rounded-full" />
            </div>
            <h2 className="text-3xl font-bold mb-3 tracking-tight">
              Order Confirmed!
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-sm mx-auto leading-relaxed">
              Your stunning workspace is being prepared. We will deliver it to
              you tomorrow.
            </p>
            <button
              onClick={handleClose}
              className="px-8 py-3 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-xl font-bold transition-transform hover:scale-105"
            >
              Back to Editor
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-3xl font-bold mb-2 tracking-tight">
              Your Workspace Setup
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
              Ready to get to work? Here&apos;s what we are delivering to you.
            </p>

            <div className="flex flex-col gap-4 mb-8 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
              {orderItems.map((item, idx) => (
                <div
                  key={`${item.id}-${idx}`}
                  className="flex justify-between items-center pb-4 border-b border-dashed border-black/10 dark:border-white/10 last:border-0 last:pb-0"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-lg p-1.5 flex items-center justify-center shrink-0 border border-slate-100 shadow-sm">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                    <div>
                      <div className="font-semibold">{item.name}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-0.5">
                        {item.type}
                      </div>
                    </div>
                  </div>
                  <div className="font-semibold whitespace-nowrap">
                    ${item.price}
                    <span className="text-sm font-normal text-slate-500 dark:text-slate-400">
                      /mo
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-6 border-t border-black/10 dark:border-white/10">
              <div className="flex justify-between items-center mb-6">
                <span className="text-lg text-slate-500 dark:text-slate-400">
                  Total Due
                </span>
                <div className="text-4xl font-bold flex items-baseline gap-1">
                  <span className="text-3xl font-semibold">$</span>
                  {totalPrice}
                  <span className="text-base font-normal text-slate-500 dark:text-slate-400 tracking-normal ml-1">
                    / month
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsConfirmed(true)}
                className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg transition-all duration-300 hover:bg-indigo-700 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(79,70,229,0.4)]"
              >
                Rent This Setup
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
