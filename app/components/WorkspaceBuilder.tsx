'use client';

import { useEffect, useState } from 'react';
import { Menu } from 'lucide-react';
import Header from './Header';
import InventoryPanel from './Sidebar/InventoryPanel';
import CanvasArea from './Canvas/CanvasArea';
import CheckoutModal from './CheckoutModal';
import { InventoryItem, WorkspaceState, PlacedItem } from '../lib/data';

import { inventoryData } from '../lib/data';

export default function WorkspaceBuilder() {
  const [state, setState] = useState<WorkspaceState>({
    desk: inventoryData.desks[0], // Standard Isometric Desk
    sideTable: null,
    frontYard: null,
    hasRelaxArea: false,
    chair: {
      item: inventoryData.chairs[1],
      id: 'chair-init',
      x: 0,
      y: 0,
    },
    accessories: [
      {
        item: inventoryData.accessories[1], // Plant
        id: 'plant-init',
        x: 0,
        y: 0,
      },
      {
        item: inventoryData.accessories[0], // Monitor
        id: 'monitor-init',
        x: 0,
        y: 3,
      },
      {
        item: inventoryData.accessories[3], // Keyboard
        id: 'keyboard-init',
        x: 3,
        y: 4,
      },
      {
        item: inventoryData.accessories[2], // Mouse
        id: 'mouse-init',
        x: 3,
        y: 2, // one unit below top of keyboard or aligned with keyboard
      },
    ],
  });

  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Add dark class to html if needed, for now we can scope it to a wrapper
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // To prevent hydration mismatch on any child components that *might* rely on it,
  // we can use a wrapper that suppresses hydration warnings, but ideally we just ensure
  // the client and server match. We'll simply let the component render.

  const handleSelectDesk = (item: InventoryItem) => {
    setState((prev) => {
      const isRemoving = prev.desk?.id === item.id;
      return {
        ...prev,
        desk: isRemoving ? null : item,
        // If we remove the desk, remove all desk-bound accessories too
        accessories: isRemoving
          ? prev.accessories.filter((a) => a.zone !== 'desk')
          : prev.accessories,
      };
    });
    setSelectedItemId(null);
  };

  const handleSelectTable = (item: InventoryItem) => {
    if (item.type === 'yard') return handleSelectYard(item);
    if (item.type === 'desk') return handleSelectDesk(item);

    setState((prev) => {
      const isRemoving = prev.sideTable?.id === item.id;
      return {
        ...prev,
        sideTable: isRemoving ? null : item,
        accessories: isRemoving
          ? prev.accessories.filter((a) => a.zone !== 'table')
          : prev.accessories,
      };
    });
    setSelectedItemId(null);
  };

  const handleSelectYard = (item: InventoryItem) => {
    setState((prev) => {
      const isRemoving = prev.frontYard?.id === item.id;
      return {
        ...prev,
        frontYard: isRemoving ? null : item,
        accessories: isRemoving
          ? prev.accessories.filter((a) => a.zone !== 'yard')
          : prev.accessories,
      };
    });
    setSelectedItemId(null);
  };

  const handleSelectChair = (item: InventoryItem) => {
    setState((prev) => ({
      ...prev,
      chair:
        prev.chair?.item.id === item.id
          ? null
          : { item, id: `chair-${Date.now()}`, x: 0, y: 0 },
    }));
  };

  const findFirstAvailableSlot = (
    deskGrid: { cols: number; rows: number },
    placed: PlacedItem[],
    itemSize: { cols: number; rows: number },
  ) => {
    for (let y = 0; y <= deskGrid.rows - itemSize.rows; y++) {
      for (let x = 0; x <= deskGrid.cols - itemSize.cols; x++) {
        let collision = false;
        for (const p of placed) {
          const pSize = p.item.size || { cols: 1, rows: 1 };
          if (
            x < p.x + pSize.cols &&
            x + itemSize.cols > p.x &&
            y < p.y + pSize.rows &&
            y + itemSize.rows > p.y
          ) {
            collision = true;
            break;
          }
        }
        if (!collision) return { x, y };
      }
    }
    return null;
  };

  const handleAddAccessory = (item: InventoryItem) => {
    setState((prev) => {
      // Determine which zone this item belongs to
      let targetZone: 'desk' | 'table' | 'yard' | 'relax' = 'desk';
      if (item.type === 'coffee_station') targetZone = 'table';
      if (item.type === 'outdoor_gear') targetZone = 'yard';
      if (item.type === 'relax_zone') targetZone = 'relax';

      const itemArea = (item.size?.cols || 1) * (item.size?.rows || 1);
      const usedDeskBlocks = prev.accessories
        .filter((a) => (a.zone || 'desk') === 'desk')
        .reduce(
          (s, a) => s + (a.item.size?.cols || 1) * (a.item.size?.rows || 1),
          0,
        );
      const deskCapacity =
        (prev.desk?.gridSize?.cols || 0) * (prev.desk?.gridSize?.rows || 0);

      // Overflow logic for standard desk accessories
      if (targetZone === 'desk' && usedDeskBlocks + itemArea > deskCapacity) {
        targetZone = 'table';
      }

      let nextSideTable = prev.sideTable;
      let nextFrontYard = prev.frontYard;
      let nextHasRelaxArea = prev.hasRelaxArea;

      if (targetZone === 'table' && !nextSideTable) {
        nextSideTable = inventoryData.tables[0];
      }
      if (targetZone === 'yard' && !nextFrontYard) {
        nextFrontYard = inventoryData.yards[0];
      }
      if (targetZone === 'relax') {
        nextHasRelaxArea = true;
      }

      // Resolve targetGridItem — relax zone uses a hardcoded 8x8 grid
      const RELAX_GRID = { cols: 8, rows: 8 };
      const targetGridItem =
        targetZone === 'desk'
          ? prev.desk
          : targetZone === 'table'
            ? nextSideTable
            : targetZone === 'relax'
              ? { gridSize: RELAX_GRID }
              : nextFrontYard;

      if (!targetGridItem || !targetGridItem.gridSize) return prev;

      const itemSize = item.size || { cols: 1, rows: 1 };

      // Filter placed items to ONLY check collisions against the target zone
      const zoneAccessories = prev.accessories.filter(
        (a) => (a.zone || 'desk') === targetZone,
      );

      const slot = findFirstAvailableSlot(
        targetGridItem.gridSize,
        zoneAccessories,
        itemSize,
      );

      if (!slot) {
        // Target Grid is full
        return prev;
      }

      const newItem: PlacedItem = {
        item,
        id: `${item.id}-${Date.now()}`,
        x: slot.x,
        y: slot.y,
        zone: targetZone,
      };

      // Auto-select the newly added item
      setSelectedItemId(newItem.id);

      return {
        ...prev,
        sideTable: nextSideTable,
        frontYard: nextFrontYard,
        hasRelaxArea: nextHasRelaxArea,
        accessories: [...prev.accessories, newItem],
      };
    });
  };

  const handleMoveAccessory = (id: string, dx: number, dy: number) => {
    setState((prev) => {
      const index = prev.accessories.findIndex((a) => a.id === id);
      if (index === -1) return prev;

      const acc = prev.accessories[index];
      const newX = acc.x + dx;
      const newY = acc.y + dy;

      const targetZone = acc.zone || 'desk';
      const targetGridItem =
        prev[
          targetZone === 'desk'
            ? 'desk'
            : targetZone === 'table'
              ? 'sideTable'
              : 'frontYard'
        ];

      const grid = targetGridItem?.gridSize || { cols: 5, rows: 3 };
      const itemSize = acc.item.size || { cols: 1, rows: 1 };

      // Bounds checking
      if (
        newX < 0 ||
        newY < 0 ||
        newX + itemSize.cols > grid.cols ||
        newY + itemSize.rows > grid.rows
      ) {
        return prev;
      }

      // Collision checking ONLY within the same zone
      let collision = false;
      const zoneAccessories = prev.accessories.filter(
        (a) => (a.zone || 'desk') === targetZone,
      );

      for (const p of zoneAccessories) {
        if (p.id === id) continue; // Skip self
        const pSize = p.item.size || { cols: 1, rows: 1 };
        if (
          newX < p.x + pSize.cols &&
          newX + itemSize.cols > p.x &&
          newY < p.y + pSize.rows &&
          newY + itemSize.rows > p.y
        ) {
          collision = true;
          break;
        }
      }

      if (collision) return prev;

      const newAccessories = [...prev.accessories];
      newAccessories[index] = { ...acc, x: newX, y: newY };

      return { ...prev, accessories: newAccessories };
    });
  };

  const handleRemoveAccessory = (item: InventoryItem, instanceId?: string) => {
    setState((prev) => {
      const index = instanceId
        ? prev.accessories.findIndex((acc) => acc.id === instanceId)
        : prev.accessories.findIndex((acc) => acc.item.id === item.id);

      if (index === -1) return prev;

      const newAccessories = [...prev.accessories];
      const removed = newAccessories.splice(index, 1)[0];

      if (selectedItemId === removed.id) {
        setSelectedItemId(null);
      }

      return {
        ...prev,
        accessories: newAccessories,
      };
    });
  };

  const handleReset = () => {
    setState({
      desk: null,
      sideTable: null,
      frontYard: null,
      hasRelaxArea: false,
      chair: null,
      accessories: [],
    });
    setSelectedItemId(null);
  };

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  const totalPrice =
    (state.desk?.price || 0) +
    (state.sideTable?.price || 0) +
    (state.frontYard?.price || 0) +
    (state.chair?.item.price || 0) +
    state.accessories.reduce((sum, acc) => sum + acc.item.price, 0);

  return (
    <main className="h-screen flex flex-col font-sans bg-[#fcfdfd] dark:bg-slate-900 text-slate-900 dark:text-white overflow-hidden selection:bg-indigo-500/30">
      <Header totalPrice={totalPrice} onCheckout={() => setIsModalOpen(true)} />

      <div className="flex-1 flex min-h-0 md:gap-8 p-4 md:p-8 pt-2 md:pt-4 z-10 overflow-hidden relative">
        {/* Mobile Inventory Menu Toggle */}
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="md:hidden fixed bottom-6 left-6 z-[300] p-4 bg-indigo-600 outline outline-4 outline-white dark:outline-[#0a0f1c] text-white rounded-full shadow-[0_10px_30px_rgba(79,70,229,0.4)] transition-transform active:scale-95"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Mobile Overlay */}
        <div
          className={`md:hidden fixed inset-0 bg-black/40 z-[290] transition-opacity duration-300 ${
            isMobileMenuOpen
              ? 'opacity-100 pointer-events-auto'
              : 'opacity-0 pointer-events-none'
          }`}
          onClick={() => setIsMobileMenuOpen(false)}
        />

        {/* Inventory Panel Container */}
        <div
          className={`fixed flex flex-col min-h-0 md:relative top-0 bottom-0 left-0 md:top-auto md:bottom-auto md:left-auto z-[350] md:z-10 h-full w-[320px] md:w-[400px] shrink-0 transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] ${
            isMobileMenuOpen
              ? 'translate-x-0'
              : '-translate-x-[120%] md:translate-x-0'
          }`}
        >
          <InventoryPanel
            selectedState={state}
            onSelectDesk={handleSelectTable} // Renamed internal router
            onSelectChair={handleSelectChair}
            onAddAccessory={handleAddAccessory}
            onRemoveAccessory={handleRemoveAccessory}
            totalPrice={totalPrice}
            onCheckout={() => setIsModalOpen(true)}
          />
        </div>

        <CanvasArea
          selectedState={state}
          onReset={handleReset}
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
          selectedItemId={selectedItemId}
          onSelectItemId={setSelectedItemId}
          onMoveItem={handleMoveAccessory}
          onRemoveItem={handleRemoveAccessory}
        />
      </div>

      <footer className="w-full text-center py-3 text-sm text-slate-500 dark:text-slate-400 z-10 relative">
        Leroy Gian Michael 2026
      </footer>

      <CheckoutModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedState={state}
        totalPrice={totalPrice}
      />
    </main>
  );
}
