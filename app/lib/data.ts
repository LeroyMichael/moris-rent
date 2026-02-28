export type ItemCategory = 'desk' | 'chair' | 'accessory';

export interface InventoryItem {
  id: string;
  name: string;
  price: number;
  image: string;
  type: ItemCategory;
  width?: string;
  top?: string;
  left?: string;
  zIndex?: number;
}

export const inventoryData = {
  desks: [
    {
      id: 'desk1',
      name: 'Minimalist Wood Standing Desk',
      price: 45,
      image: '/assets/wooden_standing_desk.png',
      type: 'desk',
    },
    {
      id: 'desk2',
      name: 'Executive L-Shape Black Desk',
      price: 65,
      image: '/assets/black_l_desk.png',
      type: 'desk',
    },
  ] as InventoryItem[],
  chairs: [
    {
      id: 'chair1',
      name: 'ErgoMesh Pro Office Chair',
      price: 25,
      image: '/assets/ergonomic_mesh_chair.png',
      type: 'chair',
    },
    {
      id: 'chair2',
      name: 'Premium Leather Executive',
      price: 40,
      image: '/assets/brown_leather_chair.png',
      type: 'chair',
    },
  ] as InventoryItem[],
  accessories: [
    {
      id: 'acc1',
      name: '27" 4K Monitor',
      price: 30,
      image: '/assets/monitor_single.png',
      type: 'accessory',
      width: '25%',
      top: '25%',
      left: '38%',
      zIndex: 12,
    },
    {
      id: 'acc2',
      name: 'Dual Monitor Setup',
      price: 55,
      image: '/assets/monitor_dual.png',
      type: 'accessory',
      width: '45%',
      top: '23%',
      left: '27.5%',
      zIndex: 12,
    },
    {
      id: 'acc3',
      name: 'Monstera Desk Plant',
      price: 10,
      image: '/assets/desk_plant.png',
      type: 'accessory',
      width: '15%',
      top: '35%',
      left: '70%',
      zIndex: 14,
    },
  ] as InventoryItem[],
};

export interface WorkspaceState {
  desk: InventoryItem | null;
  chair: InventoryItem | null;
  accessories: InventoryItem[];
}
