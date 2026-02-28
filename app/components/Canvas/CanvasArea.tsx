import {
  Moon,
  RotateCcw,
  Sun,
  ArrowUpLeft,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowDownRight,
  Trash2,
  List,
  ChevronRight,
} from 'lucide-react';
import { WorkspaceState, InventoryItem } from '../../lib/data';
import { useEffect, useRef, useState } from 'react';

interface CanvasAreaProps {
  selectedState: WorkspaceState;
  onReset: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  selectedItemId?: string | null;
  onSelectItemId?: (id: string | null) => void;
  onMoveItem?: (id: string, dx: number, dy: number) => void;
  onRemoveItem?: (item: InventoryItem, instanceId?: string) => void;
}

export default function CanvasArea({
  selectedState,
  onReset,
  isDarkMode,
  toggleDarkMode,
  selectedItemId,
  onSelectItemId,
  onMoveItem,
  onRemoveItem,
}: CanvasAreaProps) {
  const containerRef = useRef<HTMLElement>(null);
  const [scale, setScale] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isListOpen, setIsListOpen] = useState(false);

  const isDraggingRef = useRef(false);
  const hasDragged = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });

  const handlePointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    isDraggingRef.current = true;
    setIsDragging(true);
    hasDragged.current = false;
    lastMousePos.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - lastMousePos.current.x;
    const dy = e.clientY - lastMousePos.current.y;
    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
      hasDragged.current = true;
    }
    setPan((p) => ({ x: p.x + dx, y: p.y + dy }));
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDraggingRef.current = false;
    setIsDragging(false);
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      // Fit an 800x800 logical canvas inside
      const s = Math.min(width / 800, height / 800, 1);
      setScale(s);
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const isWorkspaceEmpty =
    !selectedState.desk &&
    !selectedState.chair &&
    selectedState.accessories.length === 0;

  // Use dynamic origin per desk, default to 0,0 if not provided
  const deskOriginX = selectedState.desk?.originOffset?.x ?? 0;
  const deskOriginY = selectedState.desk?.originOffset?.y ?? -70;

  const stepX = 24; // X span of half a block
  const stepY = 12.5; // Y span of half a block

  const getScreenPos = (
    x: number,
    y: number,
    sizeCols: number,
    sizeRows: number,
  ) => {
    // The top-most absolute corner of the *entire grid* should be firmly locked at (deskOriginX, deskOriginY) on screen.
    // 1 unit of X moves down-right (+stepX, +stepY)
    // 1 unit of Y moves down-left (-stepX, +stepY)

    // We add sizeCols and sizeRows divided by 2 just to center the *image* on its own footprint bounds,
    // but the starting coordinate of the footprint must rely strictly on standard isometric projection starting from 0,0.
    const centerX = x + (sizeCols - 1) / 2;
    const centerY = y + (sizeRows - 1) / 2;

    // The key fix: Standard Isometric Projection math from an absolute Top-Point Origin.
    const screenX = deskOriginX + centerX * stepX - centerY * stepX;
    const screenY = deskOriginY + centerX * stepY + centerY * stepY;

    return { screenX, screenY };
  };

  const renderGrid = () => {
    if (!selectedState.desk?.gridSize || !selectedItemId) return null;
    const { cols, rows } = selectedState.desk.gridSize;
    const cells = [];

    const selectedItem = selectedState.accessories.find(
      (a) => a.id === selectedItemId,
    );
    const itemSize = selectedItem?.item.size || { cols: 1, rows: 1 };

    // Desk bounding box centering
    // For the overall grid centering, the top-most diamond is at 0,0.
    // If the grid scales, deskOriginX/Y remains the absolute tip of the top corner.

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        // True isometric top-left origin projection for each cell
        const screenX = deskOriginX + x * stepX - y * stepX;
        const screenY = deskOriginY + x * stepY + y * stepY;

        const isFootprint =
          selectedItem &&
          x >= selectedItem.x &&
          x < selectedItem.x + itemSize.cols &&
          y >= selectedItem.y &&
          y < selectedItem.y + itemSize.rows;

        cells.push(
          <div
            key={`grid-${x}-${y}`}
            className="absolute z-20 pointer-events-none transition-colors duration-200"
            style={{
              left: '50%',
              top: '50%',
              transform: `translate(calc(-50% + ${screenX}px), calc(-50% + ${screenY}px))`,
            }}
          >
            <svg
              width={stepX * 2}
              height={stepY * 2}
              className="overflow-visible"
              style={{ position: 'absolute', top: 0, left: -stepX }}
            >
              <polygon
                points={`${stepX},0 ${stepX * 2},${stepY} ${stepX},${stepY * 2} 0,${stepY}`}
                fill={isFootprint ? 'rgba(99, 102, 241, 0.4)' : 'transparent'}
                stroke={
                  isFootprint
                    ? 'rgba(99, 102, 241, 0.8)'
                    : isDarkMode
                      ? 'rgba(255, 255, 255, 0.15)'
                      : 'rgba(0, 0, 0, 0.1)'
                }
                strokeWidth="1"
              />
            </svg>
          </div>,
        );
      }
    }
    return cells;
  };

  const renderAccessories = () => {
    return selectedState.accessories.map((acc) => {
      const size = acc.item.size || { cols: 1, rows: 1 };
      const { screenX, screenY } = getScreenPos(
        acc.x,
        acc.y,
        size.cols,
        size.rows,
      );

      const offsetX = acc.item.originOffset?.x || 0;
      const offsetY = acc.item.originOffset?.y || 0;

      // Z-index based on depth (x + y). Items closer to bottom-screen have higher x+y.
      const zIndex = 30 + acc.x + acc.y;

      const isSelected = selectedItemId === acc.id;

      return (
        <div
          key={acc.id}
          className="absolute origin-bottom animate-in slide-in-from-top-4 fade-in duration-300 ease-out transition-all z-[var(--z)] pointer-events-auto cursor-pointer"
          style={
            {
              left: '50%',
              top: '50%',
              transform: `translate(calc(-50% + ${screenX + offsetX}px), calc(-80% + ${screenY + stepY + offsetY}px))`,
              '--z': zIndex,
            } as React.CSSProperties
          }
          onClick={(e) => {
            e.stopPropagation();
            onSelectItemId?.(isSelected ? null : acc.id);
          }}
        >
          <img
            src={acc.item.image}
            alt={acc.item.name}
            className={`object-contain transition-transform duration-200 ${
              isSelected
                ? 'scale-110 -translate-y-6'
                : 'translate-y-0 hover:scale-105 hover:-translate-y-1'
            } ${
              acc.item.name.includes('Monitor')
                ? 'w-[220px]'
                : acc.item.name.includes('Keyboard')
                  ? 'w-[140px]'
                  : acc.item.name.includes('Mouse')
                    ? 'w-[40px]'
                    : 'w-[90px]'
            }`}
          />

          {/* Movement Controls Overlay */}
          {isSelected && onMoveItem && (
            <div className="absolute top-[10%] left-1/2 -translate-x-1/2 -translate-y-[120%] z-[300] w-max opacity-0 group-hover:opacity-100 hover:opacity-100 transition-all duration-300">
              <div className="grid grid-cols-3 gap-1.5 p-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] border border-slate-200/50 dark:border-white/10">
                {/* Row 1: Up-Left, Empty, Up-Right */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onMoveItem(acc.id, -1, 0);
                  }}
                  title="Move Up-Left (Left)"
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100/50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/20 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all hover:scale-110 active:scale-95"
                >
                  <ArrowUpLeft size={18} />
                </button>
                <div />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onMoveItem(acc.id, 0, -1);
                  }}
                  title="Move Up-Right (Back)"
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100/50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/20 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all hover:scale-110 active:scale-95"
                >
                  <ArrowUpRight size={18} />
                </button>

                {/* Row 2: Empty, Trash, Empty */}
                <div />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveItem?.(acc.item, acc.id);
                  }}
                  title="Remove Item"
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100/50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-500/20 hover:text-red-600 dark:hover:text-red-400 transition-all hover:scale-110 active:scale-95"
                >
                  <Trash2 size={18} />
                </button>
                <div />

                {/* Row 3: Down-Left, Empty, Down-Right */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onMoveItem(acc.id, 0, 1);
                  }}
                  title="Move Down-Left (Front)"
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100/50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/20 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all hover:scale-110 active:scale-95"
                >
                  <ArrowDownLeft size={18} />
                </button>
                <div />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onMoveItem(acc.id, 1, 0);
                  }}
                  title="Move Down-Right (Right)"
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100/50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/20 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all hover:scale-110 active:scale-95"
                >
                  <ArrowDownRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <section
      ref={containerRef}
      className={`flex-1 relative rounded-3xl bg-slate-50 dark:bg-[#0a0f1c] border border-dashed border-slate-200 dark:border-white/10 overflow-hidden flex items-center justify-center group ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      onClick={(e) => {
        if (
          !hasDragged.current &&
          !(e.target as HTMLElement).closest('button')
        ) {
          onSelectItemId?.(null);
        }
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <div
        className={`absolute inset-0 pointer-events-none ${isDarkMode ? 'opacity-20' : 'opacity-40'}`}
        style={{
          backgroundImage:
            'linear-gradient(45deg, currentColor 1px, transparent 1px), linear-gradient(-45deg, currentColor 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          color: isDarkMode ? 'white' : '#64748b',
        }}
      />

      <div
        className="w-[800px] h-[800px] flex-shrink-0 relative z-10 flex flex-col items-center justify-center transform-gpu transition-transform duration-75"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale * zoomLevel})`,
        }}
      >
        <div
          className={`absolute top-[20%] left-1/2 -translate-x-1/2 text-2xl text-slate-400 dark:text-slate-500 font-medium transition-opacity duration-300 pointer-events-none z-50 ${
            isWorkspaceEmpty ? 'opacity-80' : 'opacity-0'
          }`}
        >
          Select an Isometric Desk to start building
        </div>

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          {selectedState.desk && (
            <img
              src={selectedState.desk.image}
              alt={selectedState.desk.name}
              className="w-auto h-[480px] object-contain origin-center animate-in zoom-in-90 fade-in duration-700 pointer-events-auto"
            />
          )}
        </div>

        {/* The generated Grid */}
        {renderGrid()}

        {selectedState.desk && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
            {renderAccessories()}
          </div>
        )}

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[100]">
          {selectedState.chair && (
            <div
              className="absolute transform origin-bottom animate-in slide-in-from-bottom-8 fade-in duration-500 ease-out pointer-events-auto"
              style={{
                transform: `translate(calc(0px + ${selectedState.chair.item.originOffset?.x || 0}px), calc(180px + ${selectedState.chair.item.originOffset?.y || 0}px))`,
              }}
            >
              <img
                src={selectedState.chair.item.image}
                alt={selectedState.chair.item.name}
                className="w-auto h-[360px] object-contain hover:scale-105 transition-transform"
              />
            </div>
          )}
        </div>
      </div>

      <div className="absolute top-8 right-8 flex flex-col gap-3 z-[200]">
        <button
          onClick={() => setZoomLevel((z) => Math.min(z + 0.2, 3))}
          title="Zoom In"
          className="w-12 h-12 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-white/50 dark:border-white/10 flex items-center justify-center text-slate-700 dark:text-slate-300 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.1)] hover:scale-105 hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 pointer-events-auto text-xl font-bold"
        >
          +
        </button>
        <button
          onClick={() => setZoomLevel((z) => Math.max(z - 0.2, 0.4))}
          title="Zoom Out"
          className="w-12 h-12 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-white/50 dark:border-white/10 flex items-center justify-center text-slate-700 dark:text-slate-300 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.1)] hover:scale-105 hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 pointer-events-auto text-xl font-bold"
        >
          -
        </button>
        <button
          onClick={() => {
            setPan({ x: 0, y: 0 });
            setZoomLevel(1);
            onReset();
          }}
          title="Reset Workspace"
          className="w-12 h-12 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-white/50 dark:border-white/10 flex items-center justify-center text-slate-700 dark:text-slate-300 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.1)] hover:scale-105 hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 pointer-events-auto"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
        <button
          onClick={toggleDarkMode}
          title="Toggle Theme"
          className="w-12 h-12 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-white/50 dark:border-white/10 flex items-center justify-center text-slate-700 dark:text-slate-300 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.1)] hover:scale-105 hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 pointer-events-auto"
        >
          {isDarkMode ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </button>
        <button
          onClick={() => setIsListOpen(true)}
          title="Active Items List"
          className="w-12 h-12 rounded-full bg-indigo-600/90 backdrop-blur-md border border-indigo-500/50 flex items-center justify-center text-white shadow-[0_10px_30px_-10px_rgba(79,70,229,0.5)] hover:scale-105 hover:bg-indigo-600 transition-all duration-300 pointer-events-auto"
        >
          <List className="w-5 h-5" />
        </button>
      </div>

      {/* Active Items List Drawer (Right Side) */}
      <div
        className={`absolute top-4 bottom-4 right-4 z-[250] w-64 md:w-80 bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl flex flex-col transition-transform duration-300 ease-out ${
          isListOpen ? 'translate-x-0' : 'translate-x-[120%]'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-black/5 dark:border-white/5">
          <h3 className="font-semibold text-slate-800 dark:text-white">
            Placed Items
          </h3>
          <button
            onClick={() => setIsListOpen(false)}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin pointer-events-auto">
          {!selectedState.chair && selectedState.accessories.length === 0 ? (
            <div className="text-sm text-slate-500 dark:text-slate-400 text-center mt-4">
              No items placed yet.
            </div>
          ) : (
            <>
              {selectedState.chair && (
                <button
                  onClick={() => onSelectItemId?.(selectedState.chair!.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all border ${
                    selectedItemId === selectedState.chair.id
                      ? 'bg-indigo-50 dark:bg-indigo-500/20 border-indigo-200 dark:border-indigo-500/30'
                      : 'bg-slate-50 dark:bg-slate-800/50 border-transparent hover:border-slate-200 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-lg p-1 shrink-0 flex items-center justify-center">
                    <img
                      src={selectedState.chair.item.image}
                      alt="chair"
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  <div className="text-sm font-medium text-left truncate flex-1">
                    {selectedState.chair.item.name}
                  </div>
                </button>
              )}
              {selectedState.accessories.map((acc) => (
                <button
                  key={acc.id}
                  onClick={() => onSelectItemId?.(acc.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all border ${
                    selectedItemId === acc.id
                      ? 'bg-indigo-50 dark:bg-indigo-500/20 border-indigo-200 dark:border-indigo-500/30'
                      : 'bg-slate-50 dark:bg-slate-800/50 border-transparent hover:border-slate-200 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-lg p-1 shrink-0 flex items-center justify-center">
                    <img
                      src={acc.item.image}
                      alt={acc.item.name}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  <div className="text-sm font-medium text-left truncate flex-1 leading-tight">
                    {acc.item.name}
                  </div>
                </button>
              ))}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
