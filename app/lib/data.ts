export type ItemType =
  | 'desk'
  | 'table'
  | 'yard'
  | 'chair'
  | 'accessory'
  | 'coffee_station'
  | 'outdoor_gear'
  | 'relax_zone';

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
  // z is vertical height offset (subtracted from screenY)
  originOffset?: { x: number; y: number; z?: number };
}

export interface PlacedItem {
  item: InventoryItem;
  id: string; // Unique ID for this placed instance
  x: number; // Grid X coordinate (col)
  y: number; // Grid Y coordinate (row)
  zone?: 'desk' | 'table' | 'yard' | 'relax'; // Which storage grid this sits on
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
      originOffset: { x: 70, y: -170, z: 0 },
    },
    {
      id: 'desk3',
      name: 'Long Wooden Desk',
      price: 85,
      image: '/assets/v4/desk_long.png',
      type: 'desk',
      // 1.5x longer than standard 6x6 table
      gridSize: { cols: 4, rows: 15 },
      originOffset: { x: 135, y: -170, z: 0 },
    },
    {
      id: 'desk4',
      name: 'Electrical Adjustable Desk',
      price: 60,
      image: '/assets/v4/desk_electrical.png',
      type: 'desk',
      // 1.5x longer than standard 6x6 table
      gridSize: { cols: 4, rows: 12 },
      originOffset: { x: 80, y: -220, z: 0 },
    },
  ] as InventoryItem[],
  tables: [
    {
      id: 'table1',
      name: 'Medium Side Table',
      price: 25,
      image: '/assets/v4/medium_table.png',
      type: 'table',
      gridSize: { cols: 4, rows: 6 },
      originOffset: { x: -250, y: 0, z: 0 },
    },
  ] as InventoryItem[],
  yards: [
    {
      id: 'yard1',
      name: 'Front Yard Pad',
      price: 0,
      image: '/assets/v4/front_yard.png',
      type: 'yard',
      gridSize: { cols: 20, rows: 10 },
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
      originOffset: { x: 130, y: -150, z: 0 },
    },
    {
      id: 'chair2',
      name: 'Brown Leather Chair',
      price: 40,
      image: '/assets/v4/chair-brown.png',
      type: 'chair',
      size: { cols: 4, rows: 4 },
      originOffset: { x: 130, y: -150, z: 0 },
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
    {
      id: 'monitor2',
      name: '27" 4K Dual Monitor',
      price: 45,
      image: '/assets/v4/monitor_dual.png',
      type: 'accessory',
      size: { cols: 2, rows: 2 },
      originOffset: { x: 5, y: -35 },
    },
  ] as InventoryItem[],
  coffee_station: [
    {
      id: 'coffee1',
      name: 'Premium Espresso Machine',
      price: 45,
      image: '/assets/v4/coffee_machine.png',
      type: 'coffee_station',
      size: { cols: 3, rows: 3 },
      originOffset: { x: 0, y: 0, z: 0 },
    },
  ] as InventoryItem[],
  outdoor_gear: [
    {
      id: 'surfboard1',
      name: 'Retro Surfboard',
      price: 15,
      image: '/assets/v4/surfboard.png',
      type: 'outdoor_gear',
      size: { cols: 2, rows: 6 },
      originOffset: { x: 0, y: 0, z: 0 },
    },
    {
      id: 'motorcycle1',
      name: 'Cafe Racer Motorcycle',
      price: 250,
      image: '/assets/v4/motorcycle.png',
      type: 'outdoor_gear',
      size: { cols: 8, rows: 4 },
      originOffset: { x: 0, y: 0, z: 0 },
    },
  ] as InventoryItem[],
  relax_zone: [
    {
      id: 'beanbag1',
      name: 'Cozy Bean Bag',
      price: 18,
      image: '/assets/v4/bean_bag.png',
      type: 'relax_zone',
      size: { cols: 6, rows: 6 },
    },
  ] as InventoryItem[],
};

export interface WorkspaceState {
  desk: InventoryItem | null;
  sideTable: InventoryItem | null;
  frontYard: InventoryItem | null;
  hasRelaxArea: boolean;
  chair: PlacedItem | null;
  accessories: PlacedItem[];
}
