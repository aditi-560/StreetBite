# 📋 Backend Integration Checklist

Use this checklist to track your progress integrating the backend with the mobile app.

## ✅ Backend Setup

- [ ] PostgreSQL installed and running
- [ ] Database created (`createdb streetbite`)
- [ ] Environment variables configured (`.env` file)
- [ ] Database schema pushed (`pnpm run push`)
- [ ] Database seeded with demo data (`pnpm run seed`)
- [ ] Backend server starts without errors (`pnpm run dev`)
- [ ] Health check endpoint works (`curl http://localhost:3000/api/healthz`)

## ✅ API Testing

### Authentication
- [ ] Send OTP endpoint works (`POST /api/auth/send-otp`)
- [ ] Verify OTP endpoint works (`POST /api/auth/verify-otp`)
- [ ] JWT token is returned after verification
- [ ] Token can be used for authenticated requests

### Vendors
- [ ] Get vendor by ID works (`GET /api/vendors/1`)
- [ ] Get vendor profile works with auth (`GET /api/vendors/me`)
- [ ] Update vendor works with auth (`PUT /api/vendors/1`)

### Menu Items
- [ ] Get vendor menu works (`GET /api/vendors/1/menu`)
- [ ] Filter by category works (`?category=main`)
- [ ] Filter by availability works (`?available=true`)
- [ ] Create menu item works with auth (`POST /api/vendors/1/menu`)
- [ ] Update menu item works with auth (`PUT /api/menu/1`)
- [ ] Delete menu item works with auth (`DELETE /api/menu/1`)

### Orders
- [ ] Create order works (`POST /api/orders`)
- [ ] Get order by ID works (`GET /api/orders/1`)
- [ ] Update order status works with auth (`PATCH /api/orders/1/status`)
- [ ] Get vendor orders works with auth (`GET /api/vendors/1/orders`)
- [ ] Filter orders by status works (`?status=pending`)
- [ ] Get token counter works (`GET /api/vendors/1/token-counter`)

## ✅ Mobile App Configuration

- [ ] API client configuration file created (`config/api.ts`)
- [ ] Base URL set to backend server (use IP, not localhost)
- [ ] Auth token getter configured
- [ ] React Query provider added to app layout
- [ ] API configuration imported in `_layout.tsx`

## ✅ Authentication Integration

### Vendor Login Screen
- [ ] Import `useSendOtp` hook
- [ ] Replace mock OTP sending with API call
- [ ] Handle loading state
- [ ] Handle error messages
- [ ] Store phone number for OTP verification
- [ ] Navigate to OTP screen on success

### OTP Verification Screen
- [ ] Import `useVerifyOtp` hook
- [ ] Replace mock verification with API call
- [ ] Handle loading state
- [ ] Handle error messages
- [ ] Store JWT token in AsyncStorage
- [ ] Store vendor data in AsyncStorage
- [ ] Navigate to dashboard on success

### Logout
- [ ] Clear auth token from AsyncStorage
- [ ] Clear vendor data from AsyncStorage
- [ ] Navigate back to role selection

## ✅ Menu Integration

### Menu Screen
- [ ] Import `useGetVendorMenu` hook
- [ ] Replace mock menu data with API call
- [ ] Pass vendor ID from route params
- [ ] Handle loading state
- [ ] Handle error state with retry
- [ ] Apply category filter
- [ ] Apply availability filter
- [ ] Display menu items from API

### Menu Management (Vendor)
- [ ] Import menu CRUD hooks
- [ ] Implement create menu item
- [ ] Implement update menu item
- [ ] Implement delete menu item
- [ ] Handle loading states
- [ ] Handle error states
- [ ] Refresh menu after changes

## ✅ Order Integration

### Order Creation
- [ ] Import `useCreateOrder` hook
- [ ] Replace mock order creation with API call
- [ ] Format cart items for API
- [ ] Calculate total and estimated time
- [ ] Handle loading state
- [ ] Handle error state
- [ ] Store order ID for tracking
- [ ] Clear cart after successful order
- [ ] Navigate to token screen

### Order Tracking
- [ ] Import `useGetOrder` hook
- [ ] Replace mock order data with API call
- [ ] Enable polling (refetchInterval: 3000)
- [ ] Handle loading state
- [ ] Handle error state
- [ ] Display real-time status updates
- [ ] Show order details from API

### Vendor Dashboard
- [ ] Import `useGetVendorOrders` hook
- [ ] Replace mock orders with API call
- [ ] Load vendor ID from AsyncStorage
- [ ] Enable polling (refetchInterval: 5000)
- [ ] Handle loading state
- [ ] Handle error state
- [ ] Apply status filter
- [ ] Display orders from API

### Order Status Updates
- [ ] Import `useUpdateOrderStatus` hook
- [ ] Replace mock status updates with API call
- [ ] Handle accept order (→ preparing)
- [ ] Handle mark ready (→ ready)
- [ ] Handle mark delivered (→ delivered)
- [ ] Refresh orders after update
- [ ] Handle loading state
- [ ] Handle error state

## ✅ Context Updates

### AppContext
- [ ] Remove mock data imports
- [ ] Remove mock vendor data
- [ ] Remove mock orders state
- [ ] Keep cart state (local only)
- [ ] Update placeOrder to use API
- [ ] Remove updateOrderStatus (use hook directly)
- [ ] Keep role management
- [ ] Keep cart management functions

## ✅ Error Handling

- [ ] Network error handling
- [ ] API error messages displayed
- [ ] Retry mechanisms for failed requests
- [ ] Offline state detection
- [ ] Token expiry handling
- [ ] Loading states for all API calls
- [ ] Empty states for no data

## ✅ Testing

### End-to-End Vendor Flow
- [ ] Open app
- [ ] Select "Vendor" role
- [ ] Enter phone number (9876543210)
- [ ] Receive OTP (check backend logs)
- [ ] Enter OTP (123456)
- [ ] Successfully login
- [ ] See dashboard with real orders
- [ ] Filter orders by status
- [ ] Accept an order
- [ ] Mark order as ready
- [ ] Mark order as delivered
- [ ] Logout successfully

### End-to-End Customer Flow
- [ ] Open app
- [ ] Select "Customer" role
- [ ] Enter vendor ID or scan QR
- [ ] See menu loaded from API
- [ ] Filter by category
- [ ] Add items to cart
- [ ] View cart
- [ ] Place order
- [ ] Receive token number
- [ ] Track order status
- [ ] See status updates in real-time

### Edge Cases
- [ ] Test with no internet connection
- [ ] Test with invalid phone number
- [ ] Test with wrong OTP
- [ ] Test with expired token
- [ ] Test with empty menu
- [ ] Test with no orders
- [ ] Test with unavailable items
- [ ] Test order with multiple items

## ✅ Performance

- [ ] API calls are debounced where needed
- [ ] Polling intervals are reasonable (3-5 seconds)
- [ ] Loading states prevent multiple submissions
- [ ] Images are optimized (if added)
- [ ] Large lists are virtualized
- [ ] Cache is properly configured
- [ ] Stale data is refetched appropriately

## ✅ Security

- [ ] Auth token stored securely (AsyncStorage)
- [ ] Token sent in Authorization header
- [ ] Sensitive data not logged
- [ ] API base URL configurable
- [ ] No hardcoded credentials
- [ ] HTTPS used in production

## ✅ Documentation

- [ ] README updated with setup instructions
- [ ] API endpoints documented
- [ ] Environment variables documented
- [ ] Troubleshooting guide created
- [ ] Code comments added where needed

## ✅ Production Readiness

- [ ] Environment variables for production
- [ ] API base URL points to production server
- [ ] Error monitoring configured (Sentry)
- [ ] Analytics configured
- [ ] Push notifications configured
- [ ] App icons and splash screens
- [ ] App store metadata
- [ ] Privacy policy
- [ ] Terms of service

## 📊 Progress Tracking

**Backend Setup:** __ / 7 completed
**API Testing:** __ / 16 completed
**Mobile App Configuration:** __ / 5 completed
**Authentication Integration:** __ / 13 completed
**Menu Integration:** __ / 14 completed
**Order Integration:** __ / 24 completed
**Context Updates:** __ / 8 completed
**Error Handling:** __ / 7 completed
**Testing:** __ / 26 completed
**Performance:** __ / 7 completed
**Security:** __ / 6 completed
**Documentation:** __ / 5 completed
**Production Readiness:** __ / 10 completed

**Total Progress:** __ / 148 tasks completed

---

## 🎯 Priority Order

1. **Backend Setup** (Required first)
2. **API Testing** (Verify backend works)
3. **Mobile App Configuration** (Setup API client)
4. **Authentication Integration** (Login flow)
5. **Menu Integration** (Browse menu)
6. **Order Integration** (Place and track orders)
7. **Context Updates** (Remove mock data)
8. **Error Handling** (Improve UX)
9. **Testing** (Verify everything works)
10. **Performance** (Optimize)
11. **Security** (Secure the app)
12. **Documentation** (Help others)
13. **Production Readiness** (Deploy)

---

## 💡 Tips

- Complete tasks in order for best results
- Test each section before moving to next
- Use backend logs to debug API issues
- Check network tab in React Native Debugger
- Keep this checklist updated as you progress

---

## 🆘 Need Help?

If stuck on any task:
1. Check the relevant documentation file
2. Review the code examples
3. Check backend logs for errors
4. Test API endpoints with curl
5. Open an issue with details

---

**Good luck with the integration! 🚀**
