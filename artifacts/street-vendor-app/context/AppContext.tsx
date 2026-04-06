import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { MOCK_ORDERS, MOCK_VENDOR } from "@/data/mockData";
import { CartItem, MenuItem, Order, OrderStatus, UserRole, Vendor } from "@/types";

interface AppContextType {
  role: UserRole | null;
  setRole: (role: UserRole | null) => void;
  vendor: Vendor;
  cart: CartItem[];
  addToCart: (item: MenuItem) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  orders: Order[];
  placeOrder: (vendorId: string, vendorName: string) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  currentTokenNumber: number;
  myOrders: Order[];
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<UserRole | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [tokenCounter, setTokenCounter] = useState(4);
  const [myOrderIds, setMyOrderIds] = useState<string[]>([]);

  const vendor = MOCK_VENDOR;

  useEffect(() => {
    AsyncStorage.getItem("role").then((r) => {
      if (r) setRoleState(r as UserRole);
    });
  }, []);

  const setRole = useCallback(async (r: UserRole | null) => {
    setRoleState(r);
    if (r) {
      await AsyncStorage.setItem("role", r);
    } else {
      await AsyncStorage.removeItem("role");
    }
  }, []);

  const addToCart = useCallback((item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((ci) => ci.menuItem.id === item.id);
      if (existing) {
        return prev.map((ci) =>
          ci.menuItem.id === item.id
            ? { ...ci, quantity: ci.quantity + 1 }
            : ci
        );
      }
      return [...prev, { menuItem: item, quantity: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((itemId: string) => {
    setCart((prev) => prev.filter((ci) => ci.menuItem.id !== itemId));
  }, []);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart((prev) => prev.filter((ci) => ci.menuItem.id !== itemId));
      return;
    }
    setCart((prev) =>
      prev.map((ci) =>
        ci.menuItem.id === itemId ? { ...ci, quantity } : ci
      )
    );
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const cartTotal = cart.reduce(
    (sum, ci) => sum + ci.menuItem.price * ci.quantity,
    0
  );
  const cartCount = cart.reduce((sum, ci) => sum + ci.quantity, 0);

  const placeOrder = useCallback(
    (vendorId: string, vendorName: string): Order => {
      const newOrder: Order = {
        id: `order_${Date.now()}`,
        tokenNumber: tokenCounter,
        vendorId,
        vendorName,
        items: [...cart],
        status: "pending",
        total: cartTotal,
        createdAt: new Date(),
        estimatedTime: Math.max(
          8,
          cart.reduce((max, ci) => Math.max(max, ci.menuItem.prepTime), 0)
        ),
      };
      setTokenCounter((t) => t + 1);
      setOrders((prev) => [...prev, newOrder]);
      setMyOrderIds((prev) => [...prev, newOrder.id]);
      setCart([]);
      return newOrder;
    },
    [cart, cartTotal, tokenCounter]
  );

  const updateOrderStatus = useCallback(
    (orderId: string, status: OrderStatus) => {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status } : o))
      );
    },
    []
  );

  const currentTokenNumber = tokenCounter;
  const myOrders = orders.filter((o) => myOrderIds.includes(o.id));

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        vendor,
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartCount,
        orders,
        placeOrder,
        updateOrderStatus,
        currentTokenNumber,
        myOrders,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
