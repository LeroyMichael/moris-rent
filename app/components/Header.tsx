import { Monitor } from 'lucide-react';

interface HeaderProps {
  totalPrice: number;
  onCheckout: () => void;
}

export default function Header({ totalPrice, onCheckout }: HeaderProps) {
  const canCheckout = totalPrice > 0;

  return (
    <header className="flex justify-between items-center px-8 py-4 h-20 z-10 w-full relative">
      <div className="flex items-center gap-3 text-2xl font-bold tracking-tight">
        <div className="flex items-center justify-center w-10 h-10 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg">
          <Monitor className="w-5 h-5" />
        </div>
        <span>monis.rent</span>
      </div>
      <button
        disabled={!canCheckout}
        onClick={onCheckout}
        className="text-sm sm:text-md flex items-center gap-4 px-6 py-3 bg-indigo-600 text-white rounded-full font-semibold transition-all duration-300 hover:bg-indigo-700 hover:-translate-y-0.5 hover:shadow-[0_10px_25px_-5px_rgba(79,70,229,0.4)] disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-400 disabled:shadow-none disabled:transform-none"
      >
        <span>Finish Setup</span>
        <div className="bg-white/20 px-3 py-1 rounded-full text-sm hidden sm:block">
          ${totalPrice}/mo
        </div>
      </button>
    </header>
  );
}
