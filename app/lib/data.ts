export type ItemType = 'desk' | 'chair' | 'accessory';

export interface InventoryItem {
  id: string;
  name: string;
  price: number;
  image: string;
  type: ItemType;
  // Desks define the total grid capacity
  gridSize?: { cols: number; rows: number };
  // Accessories and Chairs take up space
  size?: { cols: number; rows: number };
  // Desks define where their top-left grid diamond starts relative to the image center
  originOffset?: { x: number; y: number };
}

export interface PlacedItem {
  item: InventoryItem;
  id: string; // Unique ID for this placed instance
  x: number; // Grid X coordinate (col)
  y: number; // Grid Y coordinate (row)
}

export const inventoryData = {
  desks: [
    {
      id: 'desk1',
      name: 'Standard Isometric Desk',
      price: 45,
      image: '/assets/v4/desk.png',
      type: 'desk',
      // Represents a 10x6 grid of 10x10cm blocks
      gridSize: { cols: 5, rows: 11 },
      originOffset: { x: 70, y: -170 },
    },
    {
      id: 'desk3',
      name: 'Long Wooden Desk',
      price: 85,
      image: '/assets/v4/desk_long.png',
      type: 'desk',
      // 1.5x longer than standard 6x6 table
      gridSize: { cols: 4, rows: 15 },
      originOffset: { x: 135, y: -170 },
    },
  ] as InventoryItem[],
  chairs: [
    {
      id: 'chair1',
      name: 'Ergonomic Mesh Chair',
      price: 25,
      image: '/assets/v4/chair.png',
      type: 'chair',
      size: { cols: 4, rows: 4 },
      originOffset: { x: 130, y: -150 },
    },
    {
      id: 'chair2',
      name: 'Brown Leather Chair',
      price: 40,
      image: '/assets/v4/chair-brown.png',
      type: 'chair',
      size: { cols: 4, rows: 4 },
      originOffset: { x: 130, y: -150 },
    },
  ] as InventoryItem[],
  accessories: [
    {
      id: 'monitor1',
      name: '27" 4K Monitor',
      price: 30,
      image: '/assets/v4/monitor.png',
      type: 'accessory',
      size: { cols: 2, rows: 4 },
    },
    {
      id: 'plant1',
      name: 'Monstera Desk Plant',
      price: 10,
      image: '/assets/v4/plant.png',
      type: 'accessory',
      size: { cols: 2, rows: 2 },
    },
    {
      id: 'mouse1',
      name: 'Wireless Ergonomic Mouse',
      price: 5,
      image: '/assets/v4/mouse.png',
      type: 'accessory',
      size: { cols: 1, rows: 1 },
      originOffset: { x: 5, y: 8 },
    },
    {
      id: 'keyboard1',
      name: 'Mechanical Pro Keyboard',
      price: 12,
      image: '/assets/v4/keyboard.png',
      type: 'accessory',
      size: { cols: 2, rows: 4 },
      originOffset: { x: -10, y: 30 },
    },
  ] as InventoryItem[],
};

export interface WorkspaceState {
  desk: InventoryItem | null;
  chair: PlacedItem | null;
  accessories: PlacedItem[];
}
