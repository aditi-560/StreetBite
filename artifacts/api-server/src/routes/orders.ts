import { Router, type IRouter, Response } from "express";
import { db } from "@workspace/db";
import { ordersTable, vendorsTable } from "@workspace/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { authenticate, AuthRequest } from "../middlewares/auth";

const router: IRouter = Router();

// Create order
router.post("/orders", async (req, res: Response) => {
  try {
    const { vendorId, customerId, items, total, estimatedTime } = req.body;

    if (!vendorId || !items || !Array.isArray(items) || items.length === 0 || !total || !estimatedTime) {
      res.status(400).json({ 
        error: "Invalid order data", 
        message: "vendorId, items (non-empty array), total, and estimatedTime are required" 
      });
      return;
    }

    // Validate items structure
    for (const item of items) {
      if (!item.menuItemId || !item.name || !item.price || !item.quantity) {
        res.status(400).json({ 
          error: "Invalid item data", 
          message: "Each item must have menuItemId, name, price, and quantity" 
        });
        return;
      }
    }

    // Check if vendor exists
    const [vendor] = await db
      .select()
      .from(vendorsTable)
      .where(eq(vendorsTable.id, vendorId))
      .limit(1);

    if (!vendor) {
      res.status(404).json({ 
        error: "Not found", 
        message: "Vendor not found" 
      });
      return;
    }

    // Get next token number for this vendor
    const [lastOrder] = await db
      .select({ maxToken: sql<number>`COALESCE(MAX(${ordersTable.tokenNumber}), 0)` })
      .from(ordersTable)
      .where(eq(ordersTable.vendorId, vendorId));

    const tokenNumber = (lastOrder?.maxToken || 0) + 1;

    // Create order
    const [order] = await db
      .insert(ordersTable)
      .values({
        tokenNumber,
        vendorId,
        customerId: customerId || null,
        items: items as any,
        status: "pending",
        total,
        estimatedTime,
      })
      .returning();

    res.status(201).json(order);
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ 
      error: "Internal server error", 
      message: "Failed to create order" 
    });
  }
});

// Get order by ID
router.get("/orders/:orderId", async (req, res: Response) => {
  try {
    const orderId = parseInt(req.params.orderId);

    if (isNaN(orderId)) {
      res.status(400).json({ 
        error: "Invalid order ID", 
        message: "Order ID must be a number" 
      });
      return;
    }

    const [order] = await db
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.id, orderId))
      .limit(1);

    if (!order) {
      res.status(404).json({ 
        error: "Not found", 
        message: "Order not found" 
      });
      return;
    }

    res.json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ 
      error: "Internal server error", 
      message: "Failed to fetch order" 
    });
  }
});

// Update order status
router.patch("/orders/:orderId/status", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const orderId = parseInt(req.params.orderId);

    if (isNaN(orderId)) {
      res.status(400).json({ 
        error: "Invalid order ID", 
        message: "Order ID must be a number" 
      });
      return;
    }

    const { status } = req.body;

    if (!status || !["pending", "preparing", "ready", "delivered"].includes(status)) {
      res.status(400).json({ 
        error: "Invalid status", 
        message: "Status must be one of: pending, preparing, ready, delivered" 
      });
      return;
    }

    // Check if order exists and belongs to vendor
    const [existingOrder] = await db
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.id, orderId))
      .limit(1);

    if (!existingOrder) {
      res.status(404).json({ 
        error: "Not found", 
        message: "Order not found" 
      });
      return;
    }

    if (existingOrder.vendorId !== req.vendor!.vendorId) {
      res.status(403).json({ 
        error: "Forbidden", 
        message: "You can only update your own orders" 
      });
      return;
    }

    // Update order status
    const [updatedOrder] = await db
      .update(ordersTable)
      .set({ 
        status, 
        updatedAt: new Date() 
      })
      .where(eq(ordersTable.id, orderId))
      .returning();

    res.json(updatedOrder);
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ 
      error: "Internal server error", 
      message: "Failed to update order status" 
    });
  }
});

// Get vendor orders
router.get("/vendors/:vendorId/orders", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const vendorId = parseInt(req.params.vendorId);

    if (isNaN(vendorId)) {
      res.status(400).json({ 
        error: "Invalid vendor ID", 
        message: "Vendor ID must be a number" 
      });
      return;
    }

    // Check if vendor owns these orders
    if (req.vendor!.vendorId !== vendorId) {
      res.status(403).json({ 
        error: "Forbidden", 
        message: "You can only view your own orders" 
      });
      return;
    }

    const { status } = req.query;

    const conditions = [eq(ordersTable.vendorId, vendorId)];
    
    if (status) {
      conditions.push(eq(ordersTable.status, status as string));
    }

    const orders = await db
      .select()
      .from(ordersTable)
      .where(and(...conditions))
      .orderBy(desc(ordersTable.createdAt));

    res.json(orders);
  } catch (error) {
    console.error("Error fetching vendor orders:", error);
    res.status(500).json({ 
      error: "Internal server error", 
      message: "Failed to fetch orders" 
    });
  }
});

// Get token counter
router.get("/vendors/:vendorId/token-counter", async (req, res: Response) => {
  try {
    const vendorId = parseInt(req.params.vendorId);

    if (isNaN(vendorId)) {
      res.status(400).json({ 
        error: "Invalid vendor ID", 
        message: "Vendor ID must be a number" 
      });
      return;
    }

    // Get next token number for this vendor
    const [lastOrder] = await db
      .select({ maxToken: sql<number>`COALESCE(MAX(${ordersTable.tokenNumber}), 0)` })
      .from(ordersTable)
      .where(eq(ordersTable.vendorId, vendorId));

    const nextToken = (lastOrder?.maxToken || 0) + 1;

    res.json({ nextToken });
  } catch (error) {
    console.error("Error fetching token counter:", error);
    res.status(500).json({ 
      error: "Internal server error", 
      message: "Failed to fetch token counter" 
    });
  }
});

export default router;
