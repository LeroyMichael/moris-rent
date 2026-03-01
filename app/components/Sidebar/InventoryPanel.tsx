import { ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { inventoryData, InventoryItem, WorkspaceState } from '../../lib/data';
import ItemCard from './ItemCard';

interface InventoryPanelProps {
  selectedState: WorkspaceState;
  onSelectDesk: (item: InventoryItem) => void;
  onSelectChair: (item: InventoryItem) => void;
  onAddAccessory: (item: InventoryItem) => void;
  onRemoveAccessory: (item: InventoryItem) => void;
  totalPrice: number;
  onCheckout: () => void;
}

type TabType =
  | 'desks'
  | 'chairs'
  | 'accessories'
  | 'coffee_station'
  | 'outdoor_gear'
  | 'relax_zone';

export default function InventoryPanel({
  selectedState,
  onSelectDesk,
  onSelectChair,
  onAddAccessory,
  onRemoveAccessory,
  totalPrice,
  onCheckout,
}: InventoryPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>('desks');

  const canCheckout = totalPrice > 0;

  return (
    <aside className="h-full w-full flex flex-col rounded-3xl overflow-hidden shrink-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/50 dark:border-white/10 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] dark:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)]">
      <div className="p-8 pb-6">
        <h2 className="text-2xl font-bold tracking-tight mb-2">
          Build Your Dream Office
        </h2>
        <p className="text-[0.95rem] leading-relaxed text-slate-500 dark:text-slate-400">
          Select furniture & accessories. We deliver it to your Bali villa
          tomorrow.
        </p>
      </div>
      <div className="flex gap-6 overflow-x-auto px-8 pb-4 border-b border-black/5 dark:border-white/5 scrollbar-thin">
        {(
          [
            'desks',
            'chairs',
            'accessories',
            'coffee_station',
            'outdoor_gear',
            'relax_zone',
          ] as TabType[]
        ).map((tab) => {
          // Human-readable tab names
          const labelMap: Record<TabType, string> = {
            desks: 'Desks',
            chairs: 'Chairs',
            accessories: 'Extras',
            coffee_station: 'Coffee',
            outdoor_gear: 'Outdoor',
            relax_zone: 'Relax',
          };
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 text-base font-semibold whitespace-nowrap relative transition-colors duration-300 ${
                activeTab === tab
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {labelMap[tab]}
              {activeTab === tab && (
                <span className="absolute -bottom-4 left-0 w-full h-[3px] bg-indigo-600 rounded-t-sm" />
              )}
            </button>
          );
        })}
      </div>
      <div className="flex-1 overflow-y-auto px-8 py-6 scrollbar-thin">
        <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
          {activeTab === 'desks' &&
            inventoryData.desks.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                isSelected={selectedState.desk?.id === item.id}
                onClick={onSelectDesk}
              />
            ))}
          {activeTab === 'chairs' &&
            inventoryData.chairs.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                isSelected={selectedState.chair?.item.id === item.id}
                onClick={onSelectChair}
              />
            ))}
          {activeTab === 'accessories' &&
            inventoryData.accessories.map((item) => {
              const count = selectedState.accessories.filter(
                (acc) => acc.item.id === item.id,
              ).length;

              const usedDeskBlocks = selectedState.accessories
                .filter((a) => (a.zone || 'desk') === 'desk')
                .reduce((sum, acc) => {
                  const s = acc.item.size || { cols: 1, rows: 1 };
                  return sum + s.cols * s.rows;
                }, 0);

              const usedTableBlocks = selectedState.accessories
                .filter((a) => a.zone === 'table')
                .reduce((sum, acc) => {
                  const s = acc.item.size || { cols: 1, rows: 1 };
                  return sum + s.cols * s.rows;
                }, 0);

              const deskCapacity =
                (selectedState.desk?.gridSize?.cols || 0) *
                (selectedState.desk?.gridSize?.rows || 0);
              const tableCapacity =
                inventoryData.tables[0].gridSize!.cols *
                inventoryData.tables[0].gridSize!.rows;

              const itemArea = (item.size?.cols || 1) * (item.size?.rows || 1);
              const canAddToDesk = usedDeskBlocks + itemArea <= deskCapacity;
              const canAddToTable = usedTableBlocks + itemArea <= tableCapacity;

              return (
                <ItemCard
                  key={item.id}
                  item={item}
                  count={count}
                  isSelected={count > 0}
                  disabled={
                    !selectedState.desk || (!canAddToDesk && !canAddToTable)
                  }
                  onClick={onAddAccessory}
                  onRemove={onRemoveAccessory}
                />
              );
            })}
          {activeTab === 'coffee_station' &&
            inventoryData.coffee_station.map((item) => {
              const count = selectedState.accessories.filter(
                (acc) => acc.item.id === item.id,
              ).length;

              const usedTableBlocks = selectedState.accessories
                .filter((a) => a.zone === 'table')
                .reduce((sum, acc) => {
                  const s = acc.item.size || { cols: 1, rows: 1 };
                  return sum + s.cols * s.rows;
                }, 0);

              const tableCapacity =
                inventoryData.tables[0].gridSize!.cols *
                inventoryData.tables[0].gridSize!.rows;
              const itemArea = (item.size?.cols || 1) * (item.size?.rows || 1);

              return (
                <ItemCard
                  key={item.id}
                  item={item}
                  count={count}
                  isSelected={count > 0}
                  disabled={usedTableBlocks + itemArea > tableCapacity}
                  onClick={onAddAccessory}
                  onRemove={onRemoveAccessory}
                />
              );
            })}
          {activeTab === 'relax_zone' &&
            inventoryData.relax_zone.map((item) => {
              const count = selectedState.accessories.filter(
                (acc) => acc.item.id === item.id,
              ).length;
              return (
                <ItemCard
                  key={item.id}
                  item={item}
                  count={count}
                  isSelected={count > 0}
                  onClick={onAddAccessory}
                  onRemove={onRemoveAccessory}
                />
              );
            })}
          {activeTab === 'outdoor_gear' &&
            inventoryData.outdoor_gear.map((item) => {
              const count = selectedState.accessories.filter(
                (acc) => acc.item.id === item.id,
              ).length;
              return (
                <ItemCard
                  key={item.id}
                  item={item}
                  count={count}
                  isSelected={count > 0}
                  onClick={onAddAccessory}
                  onRemove={onRemoveAccessory}
                />
              );
            })}
        </div>
      </div>
      <div className="p-8 border-t border-black/5 dark:border-white/5 bg-white/40 dark:bg-slate-900/40">
        <div className="flex justify-between items-center mb-4">
          <span className="text-[0.95rem] text-slate-500 dark:text-slate-400">
            Estimated Monthly:
          </span>
          <span className="text-2xl font-bold">${totalPrice}</span>
        </div>
        <button
          disabled={!canCheckout}
          onClick={onCheckout}
          className="w-full p-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-semibold flex justify-center items-center gap-2 transition-all duration-300 hover:opacity-90 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          View Summary <ArrowRight className="w-4.5 h-4.5" />
        </button>
      </div>
    </aside>
  );
}
