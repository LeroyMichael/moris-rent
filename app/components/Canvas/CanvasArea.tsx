import { Moon, RotateCcw, Sun } from 'lucide-react';
import { WorkspaceState } from '../../lib/data';

interface CanvasAreaProps {
  selectedState: WorkspaceState;
  onReset: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export default function CanvasArea({
  selectedState,
  onReset,
  isDarkMode,
  toggleDarkMode,
}: CanvasAreaProps) {
  const isWorkspaceEmpty =
    !selectedState.desk &&
    !selectedState.chair &&
    selectedState.accessories.length === 0;

  return (
    <section className="flex-1 relative rounded-3xl bg-black/5 dark:bg-white/5 border border-dashed border-black/10 dark:border-white/10 overflow-hidden flex items-center justify-center">
      {/* Background Dots */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          color: isDarkMode ? 'white' : '#64748b',
        }}
      />

      {/* Canvas Container */}
      <div className="w-[800px] h-[600px] relative z-10 flex flex-col items-center justify-center">
        {/* Empty State Prompt */}
        <div
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl text-slate-500 dark:text-slate-400 font-medium transition-opacity duration-300 pointer-events-none ${
            isWorkspaceEmpty ? 'opacity-60' : 'opacity-0'
          }`}
        >
          Select a desk to start building
        </div>

        {/* --- Layers --- */}
        {/* Chair Layer (Behind desk if realistic, but our perspective puts chair in front of desk) */}
        {/* Wait, the original code had chair with z-index 20 (front), desk 10 (base), accessories 15. */}

        {/* Desk Layer */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          {selectedState.desk && (
            <img
              src={selectedState.desk.image}
              alt={selectedState.desk.name}
              className="w-auto h-[60%] object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.15)] origin-bottom animate-in zoom-in-90 fade-in duration-500"
            />
          )}
        </div>

        {/* Accessory Layer (Only show if desk exists, attached to desk technically) */}
        <div className="absolute inset-0 pointer-events-none z-15">
          {selectedState.desk &&
            selectedState.accessories.map((acc) => (
              <div
                key={acc.id}
                className="absolute origin-bottom animate-in slide-in-from-bottom-2 fade-in duration-500"
                style={{
                  width: acc.width,
                  top: acc.top,
                  left: acc.left,
                  zIndex: acc.zIndex,
                }}
              >
                <img
                  src={acc.image}
                  alt={acc.name}
                  className="w-full object-contain drop-shadow-[0_10px_15px_rgba(0,0,0,0.1)]"
                />
              </div>
            ))}
        </div>

        {/* Chair Layer */}
        <div className="absolute inset-0 flex flex-col justify-end items-center pointer-events-none z-20">
          {selectedState.chair && (
            <img
              src={selectedState.chair.image}
              alt={selectedState.chair.name}
              className={`w-auto h-[45%] object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.15)] origin-bottom animate-in zoom-in-95 fade-in duration-500 transition-all ${
                selectedState.desk ? '-translate-y-[10%]' : '-translate-y-[25%]'
              }`}
            />
          )}
        </div>
      </div>

      {/* Floating Controls */}
      <div className="absolute bottom-8 right-8 flex gap-3 z-30">
        <button
          onClick={onReset}
          title="Reset Workspace"
          className="w-12 h-12 rounded-full bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-white/50 dark:border-white/10 flex items-center justify-center text-slate-900 dark:text-white shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] hover:scale-105 hover:bg-white dark:hover:bg-slate-800 transition-all duration-300"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
        <button
          onClick={toggleDarkMode}
          title="Toggle Theme"
          className="w-12 h-12 rounded-full bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-white/50 dark:border-white/10 flex items-center justify-center text-slate-900 dark:text-white shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] hover:scale-105 hover:bg-white dark:hover:bg-slate-800 transition-all duration-300"
        >
          {isDarkMode ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </button>
      </div>
    </section>
  );
}
