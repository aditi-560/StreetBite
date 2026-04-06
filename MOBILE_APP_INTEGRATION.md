# Mobile App Backend Integration Guide

## 🎯 Overview

This guide shows how to connect the StreetBite mobile app to the backend API, replacing mock data with real API calls.

---

## 📋 Prerequisites

1. Backend server running on `http://localhost:3000`
2. Database seeded with demo data
3. Mobile app dependencies installed

---

## 🔧 Step 1: Configure API Base URL

Create a configuration file for the API client:

```typescript
// artifacts/street-vendor-app/config/api.ts
import { setBaseUrl, setAuthTokenGetter } from '@workspace/api-client-react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// For local development, use your computer's IP address
// Find it with: ipconfig (Windows) or ifconfig (Mac/Linux)
const API_BASE_URL = __DEV__ 
  ? 'http://192.168.1.100:3000'  // Replace with your IP
  : process.env.EXPO_PUBLIC_API_URL || 'https://api.streetbite.com';

// Configure API client
setBaseUrl(API_BASE_URL);

// Attach auth token to all requests
setAuthTokenGetter(async () => {
  const token = await AsyncStorage.getItem('authToken');
  return token;
});

export { API_BASE_URL };
```

---

## 🔐 Step 2: Update Authentication Flow

### Update Vendor Login

Replace the mock login with real API calls:

```typescript
// artifacts/street-vendor-app/app/vendor/login.tsx

import { useSendOtp } from '@workspace/api-client-react';

export default function VendorLoginScreen() {
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  
  const sendOtpMutation = useSendOtp();

  const handleContinue = async () => {
    if (phone.length < 10) {
      setError("Please enter a valid 10-digit phone number");
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    
    try {
      await sendOtpMutation.mutateAsync({
        data: { phoneNumber: phone }
      });
      
      setError("");
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      // Store phone number for OTP verification
      await AsyncStorage.setItem('pendingPhone', phone);
      router.push("/vendor/otp");
    } catch (err: any) {
      setError(err.message || "Failed to send OTP");
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  // ... rest of component
}
```

### Update OTP Verification

```typescript
// artifacts/street-vendor-app/app/vendor/otp.tsx

import { useVerifyOtp } from '@workspace/api-client-react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function OTPScreen() {
  const { setRole } = useApp();
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const verifyOtpMutation = useVerifyOtp();

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length < OTP_LENGTH) {
      setError("Please enter the complete OTP");
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    
    setLoading(true);
    
    try {
      const phoneNumber = await AsyncStorage.getItem('pendingPhone');
      
      if (!phoneNumber) {
        throw new Error("Phone number not found");
      }
      
      const response = await verifyOtpMutation.mutateAsync({
        data: { phoneNumber, otp: code }
      });
      
      // Store auth token and vendor data
      await AsyncStorage.setItem('authToken', response.token);
      await AsyncStorage.setItem('vendorData', JSON.stringify(response.vendor));
      await AsyncStorage.removeItem('pendingPhone');
      
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await setRole("vendor");
      
      router.replace("/vendor/dashboard");
    } catch (err: any) {
      setError(err.message || "Invalid OTP");
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  // ... rest of component
}
```

---

## 🍽️ Step 3: Update Menu Screen

Replace mock menu data with API calls:

```typescript
// artifacts/street-vendor-app/app/customer/menu.tsx

import { useGetVendorMenu } from '@workspace/api-client-react';
import { useLocalSearchParams } from 'expo-router';

export default function MenuScreen() {
  const { vendorId } = useLocalSearchParams<{ vendorId: string }>();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  
  // Fetch menu from API
  const { data: menuItems = [], isLoading, error, refetch } = useGetVendorMenu(
    parseInt(vendorId || "1"),
    {
      category: selectedCategory === "all" ? undefined : selectedCategory,
      available: true,
    }
  );

  if (isLoading) {
    return <LoadingIndicator />;
  }

  if (error) {
    return (
      <View style={styles.error}>
        <Text>Failed to load menu</Text>
        <CustomButton title="Retry" onPress={() => refetch()} />
      </View>
    );
  }

  // ... rest of component using menuItems from API
}
```

---

## 🛒 Step 4: Update Order Creation

Replace mock order creation with API calls:

```typescript
// artifacts/street-vendor-app/context/AppContext.tsx

import { useCreateOrder } from '@workspace/api-client-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function AppProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  
  // ... existing state
  
  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create order');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate orders cache
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  const placeOrder = useCallback(
    async (vendorId: string, vendorName: string): Promise<Order> => {
      try {
        // Prepare order items
        const items = cart.map(ci => ({
          menuItemId: parseInt(ci.menuItem.id.replace('item_', '')),
          name: ci.menuItem.name,
          price: ci.menuItem.price,
          quantity: ci.quantity,
        }));
        
        // Calculate estimated time
        const estimatedTime = Math.max(
          8,
          cart.reduce((max, ci) => Math.max(max, ci.menuItem.prepTime), 0)
        );
        
        // Create order via API
        const order = await createOrderMutation.mutateAsync({
          vendorId: parseInt(vendorId),
          customerId: await AsyncStorage.getItem('customerId') || undefined,
          items,
          total: cartTotal,
          estimatedTime,
        });
        
        // Clear cart
        setCart([]);
        
        // Store order ID for tracking
        const myOrderIds = JSON.parse(
          await AsyncStorage.getItem('myOrderIds') || '[]'
        );
        myOrderIds.push(order.id.toString());
        await AsyncStorage.setItem('myOrderIds', JSON.stringify(myOrderIds));
        
        return {
          id: order.id.toString(),
          tokenNumber: order.tokenNumber,
          vendorId: order.vendorId.toString(),
          vendorName,
          items: cart,
          status: order.status,
          total: order.total,
          createdAt: new Date(order.createdAt),
          estimatedTime: order.estimatedTime,
        };
      } catch (error) {
        console.error('Failed to place order:', error);
        throw error;
      }
    },
    [cart, cartTotal, createOrderMutation]
  );

  // ... rest of context
}
```

---

## 📊 Step 5: Update Vendor Dashboard

Replace mock orders with API calls:

```typescript
// artifacts/street-vendor-app/app/vendor/dashboard.tsx

import { useGetVendorOrders, useUpdateOrderStatus } from '@workspace/api-client-react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function VendorDashboardScreen() {
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");
  const [vendorId, setVendorId] = useState<number | null>(null);
  
  // Load vendor ID from storage
  useEffect(() => {
    AsyncStorage.getItem('vendorData').then(data => {
      if (data) {
        const vendor = JSON.parse(data);
        setVendorId(vendor.id);
      }
    });
  }, []);
  
  // Fetch orders from API
  const { data: orders = [], isLoading, refetch } = useGetVendorOrders(
    vendorId!,
    {
      status: activeFilter === "all" ? undefined : activeFilter,
    },
    {
      enabled: !!vendorId,
      refetchInterval: 5000, // Poll every 5 seconds
    }
  );
  
  const updateStatusMutation = useUpdateOrderStatus();

  const handleAccept = async (orderId: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    try {
      await updateStatusMutation.mutateAsync({
        orderId: parseInt(orderId),
        data: { status: "preparing" },
      });
      refetch();
    } catch (error) {
      console.error('Failed to update order:', error);
    }
  };

  const handleReady = async (orderId: string) => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    try {
      await updateStatusMutation.mutateAsync({
        orderId: parseInt(orderId),
        data: { status: "ready" },
      });
      refetch();
    } catch (error) {
      console.error('Failed to update order:', error);
    }
  };

  if (isLoading) {
    return <LoadingIndicator />;
  }

  // Filter orders based on active filter
  const filtered = activeFilter === "all"
    ? orders.filter((o: any) => o.status !== "delivered")
    : orders;

  // ... rest of component
}
```

---

## 🔄 Step 6: Update Order Tracking

```typescript
// artifacts/street-vendor-app/app/customer/tracking.tsx

import { useGetOrder } from '@workspace/api-client-react';
import { useLocalSearchParams } from 'expo-router';

export default function TrackingScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  
  // Fetch order with polling
  const { data: order, isLoading } = useGetOrder(
    parseInt(orderId),
    {
      refetchInterval: 3000, // Poll every 3 seconds
    }
  );

  if (isLoading || !order) {
    return <LoadingIndicator />;
  }

  // ... rest of component using order from API
}
```

---

## 🎨 Step 7: Setup React Query Provider

Wrap your app with QueryClientProvider:

```typescript
// artifacts/street-vendor-app/app/_layout.tsx

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppProvider } from '@/context/AppContext';
import '@/config/api'; // Import API configuration

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 30000, // 30 seconds
    },
  },
});

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        {/* Your app content */}
      </AppProvider>
    </QueryClientProvider>
  );
}
```

---

## 🧪 Testing the Integration

### 1. Start Backend
```bash
cd artifacts/api-server
pnpm run dev
```

### 2. Start Mobile App
```bash
cd artifacts/street-vendor-app
pnpm run dev
```

### 3. Test Flow

**Vendor Flow:**
1. Open app → Select "Vendor"
2. Enter phone: `9876543210`
3. Enter OTP: `123456`
4. View dashboard with real orders
5. Accept/update order status

**Customer Flow:**
1. Open app → Select "Customer"
2. Scan QR or enter vendor ID: `1`
3. Browse menu (loaded from API)
4. Add items to cart
5. Place order (creates in database)
6. Track order (polls for updates)

---

## 🐛 Troubleshooting

### Cannot connect to backend

**Problem:** Mobile app can't reach `localhost:3000`

**Solution:**
1. Use your computer's IP address instead of localhost
2. Find IP:
   - Windows: `ipconfig` → Look for IPv4 Address
   - Mac/Linux: `ifconfig` → Look for inet address
3. Update API_BASE_URL: `http://192.168.1.100:3000`
4. Ensure backend and mobile app are on same network

### CORS errors

**Problem:** Browser/web version shows CORS errors

**Solution:** Backend already has CORS enabled in `src/app.ts`:
```typescript
app.use(cors());
```

### Authentication errors

**Problem:** "Unauthorized" errors

**Solution:**
1. Check token is stored: `AsyncStorage.getItem('authToken')`
2. Verify token is sent in headers
3. Re-authenticate if token expired

### Orders not updating

**Problem:** Dashboard doesn't show new orders

**Solution:**
1. Check polling is enabled: `refetchInterval: 5000`
2. Verify vendor ID matches
3. Check network tab for API calls

---

## 🚀 Production Checklist

- [ ] Update API_BASE_URL to production URL
- [ ] Enable proper error handling and retry logic
- [ ] Add loading states for all API calls
- [ ] Implement offline support with React Query
- [ ] Add push notifications for order updates
- [ ] Secure sensitive data in AsyncStorage
- [ ] Add analytics tracking
- [ ] Test on real devices
- [ ] Handle network failures gracefully
- [ ] Add rate limiting on backend

---

## 📚 Available API Hooks

All hooks are auto-generated from OpenAPI spec:

### Authentication
- `useSendOtp()` - Send OTP to phone
- `useVerifyOtp()` - Verify OTP and login

### Vendors
- `useGetVendor(vendorId)` - Get vendor details
- `useGetMyVendorProfile()` - Get authenticated vendor
- `useUpdateVendor(vendorId)` - Update vendor profile

### Menu
- `useGetVendorMenu(vendorId, params)` - Get menu items
- `useCreateMenuItem(vendorId)` - Create menu item
- `useUpdateMenuItem(menuItemId)` - Update menu item
- `useDeleteMenuItem(menuItemId)` - Delete menu item

### Orders
- `useCreateOrder()` - Create new order
- `useGetOrder(orderId)` - Get order details
- `useUpdateOrderStatus(orderId)` - Update order status
- `useGetVendorOrders(vendorId, params)` - Get vendor orders
- `useGetTokenCounter(vendorId)` - Get next token number

---

## 🎯 Next Steps

1. ✅ Backend integrated with mobile app
2. 🔥 Add Firebase push notifications
3. 📸 Add image upload for menu items
4. 💳 Integrate payment gateway
5. 🗺️ Add location tracking
6. ⭐ Add ratings and reviews
7. 📊 Add vendor analytics dashboard
