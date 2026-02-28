'use client';

import { useEffect, useState } from 'react';
import Header from './Header';
import InventoryPanel from './Sidebar/InventoryPanel';
import CanvasArea from './Canvas/CanvasArea';
import CheckoutModal from './CheckoutModal';
import { InventoryItem, WorkspaceState } from '../lib/data';

export default function WorkspaceBuilder() {
  const [state, setState] = useState<WorkspaceState>({
    desk: null,
    chair: null,
    accessories: [],
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
    setState((prev) => ({
      ...prev,
      desk: prev.desk?.id === item.id ? null : item,
    }));
  };

  const handleSelectChair = (item: InventoryItem) => {
    setState((prev) => ({
      ...prev,
      chair: prev.chair?.id === item.id ? null : item,
    }));
  };

  const handleToggleAccessory = (item: InventoryItem) => {
    setState((prev) => {
      const isEditing = prev.accessories.some((acc) => acc.id === item.id);
      let newAccessories = [...prev.accessories];

      // Mutually exclusive monitor logic (optional UX improvement)
      if (!isEditing && item.name.includes('Monitor')) {
        newAccessories = newAccessories.filter(
          (a) => !a.name.includes('Monitor'),
        );
      }

      if (isEditing) {
        newAccessories = newAccessories.filter((acc) => acc.id !== item.id);
      } else {
        newAccessories.push(item);
      }

      return {
        ...prev,
        accessories: newAccessories,
      };
    });
  };

  const handleReset = () => {
    setState({ desk: null, chair: null, accessories: [] });
  };

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  const totalPrice =
    (state.desk?.price || 0) +
    (state.chair?.price || 0) +
    state.accessories.reduce((sum, acc) => sum + acc.price, 0);

  return (
    <main className="min-h-screen flex flex-col font-sans transition-colors duration-400 bg-[#fcfdfd] dark:bg-slate-900 text-slate-900 dark:text-white overflow-hidden selection:bg-indigo-500/30">
      {/* Decorative Blob Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[30%] left-[15%] w-[800px] h-[800px] rounded-full bg-indigo-500/5 dark:bg-indigo-500/10 blur-[120px] -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute top-[70%] left-[85%] w-[600px] h-[600px] rounded-full bg-emerald-500/5 dark:bg-emerald-500/10 blur-[120px] -translate-x-1/2 -translate-y-1/2" />
      </div>

      <Header totalPrice={totalPrice} onCheckout={() => setIsModalOpen(true)} />

      <div className="flex-1 flex gap-8 p-8 pt-4 z-10 overflow-hidden">
        <InventoryPanel
          selectedState={state}
          onSelectDesk={handleSelectDesk}
          onSelectChair={handleSelectChair}
          onToggleAccessory={handleToggleAccessory}
          totalPrice={totalPrice}
          onCheckout={() => setIsModalOpen(true)}
        />
        <CanvasArea
          selectedState={state}
          onReset={handleReset}
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
        />
      </div>

      <CheckoutModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedState={state}
        totalPrice={totalPrice}
      />
    </main>
  );
}
