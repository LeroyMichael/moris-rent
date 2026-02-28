import Image from 'next/image';
import { Check } from 'lucide-react';
import { InventoryItem } from '../../lib/data';

interface ItemCardProps {
  item: InventoryItem;
  isSelected: boolean;
  onClick: (item: InventoryItem) => void;
}

export default function ItemCard({ item, isSelected, onClick }: ItemCardProps) {
  return (
    <div
      onClick={() => onClick(item)}
      className={`relative flex flex-col items-center p-4 rounded-2xl cursor-pointer transition-all duration-300 border bg-white dark:bg-slate-900 overflow-hidden
        ${
          isSelected
            ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/10 shadow-md'
            : 'border-gray-100 dark:border-white/5 hover:-translate-y-1 hover:shadow-lg hover:border-indigo-600'
        }
      `}
    >
      {isSelected && (
        <div className="absolute top-2.5 right-2.5 w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center z-10 shadow-sm">
          <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
        </div>
      )}
      <div className="w-full aspect-square flex items-center justify-center mb-4 relative">
        {/* We use standard img to allow mix-blend-mode effectively, Next Image can be tricky with mix-blend-mode if not configured right, but let's try standard img for simplicity here */}
        <img
          src={item.image}
          alt={item.name}
          className="max-w-full max-h-full object-contain mix-blend-multiply dark:mix-blend-normal"
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
