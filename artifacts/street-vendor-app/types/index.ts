export type UserRole = "customer" | "vendor";

export type MenuItemCategory = "main" | "side" | "drink" | "dessert";

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: MenuItemCategory;
  emoji: string;
  available: boolean;
  rating: number;
  prepTime: number;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

export type OrderStatus = "pending" | "preparing" | "ready" | "delivered";

export interface Order {
  id: string;
  tokenNumber: number;
  vendorId: string;
  vendorName: string;
  items: CartItem[];
  status: OrderStatus;
  total: number;
  createdAt: Date;
  estimatedTime: number;
}

export interface Vendor {
  id: string;
  name: string;
  description: string;
  rating: number;
  category: string;
  isOpen: boolean;
}
