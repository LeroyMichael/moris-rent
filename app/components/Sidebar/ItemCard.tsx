import Image from 'next/image';
import { Check, Minus, Plus } from 'lucide-react';
import { InventoryItem } from '../../lib/data';

interface ItemCardProps {
  item: InventoryItem;
  isSelected?: boolean;
  count?: number;
  disabled?: boolean;
  onClick: (item: InventoryItem) => void;
  onRemove?: (item: InventoryItem) => void;
}

export default function ItemCard({
  item,
  isSelected,
  count = 0,
  disabled,
  onClick,
  onRemove,
}: ItemCardProps) {
  const isActive = isSelected || count > 0;

  return (
    <div
      onClick={() => (disabled ? null : onClick(item))}
      className={`relative flex flex-col items-center p-4 rounded-2xl transition-all duration-300 border bg-white dark:bg-slate-900 overflow-hidden
        ${disabled ? 'opacity-50 cursor-not-allowed grayscale-[0.5]' : 'cursor-pointer'}
        ${
          isActive
            ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/10 shadow-md'
            : 'border-gray-100 dark:border-white/5 hover:-translate-y-1 hover:shadow-lg hover:border-indigo-600'
        }
      `}
    >
      {/* Checkmark for boolean selection (like desks/chairs) */}
      {isSelected && count === 0 && (
        <div className="absolute top-2.5 right-2.5 w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center z-10 shadow-sm">
          <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
        </div>
      )}

      {/* Count Badge for plural selection (accessories) */}
      {count > 0 && (
        <div className="absolute top-2.5 right-2.5 flex items-center gap-2 z-10">
          {onRemove && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove(item);
              }}
              className="w-6 h-6 bg-white dark:bg-slate-800 text-slate-700 dark:text-white rounded-full flex items-center justify-center shadow-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
          )}
          <div className="min-w-6 h-6 px-1.5 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-sm text-xs font-bold font-sans">
            x{count}
          </div>
        </div>
      )}

      {/* Capacity Cost Badge */}
      {item.size && (
        <div className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-[6px] text-[10px] font-bold tracking-wide uppercase border border-slate-200 dark:border-slate-700 z-10">
          {item.size.cols * item.size.rows}{' '}
          {item.size.cols * item.size.rows === 1 ? 'Slot' : 'Slots'}
        </div>
      )}

      <div className="w-full aspect-square flex items-center justify-center mb-4 relative mt-2">
        <img
          src={item.image}
          alt={item.name}
          className="max-w-full max-h-full object-contain"
        />
      </div>
      <div className="w-full text-left">
        <div className="font-semibold text-[0.95rem] mb-1 line-clamp-1">
          {item.name}
        </div>
        <div className="text-sm text-slate-500 dark:text-slate-400">
          ${item.price} <span className="text-xs">/mo</span>
        </div>
      </div>
    </div>
  );
}
