import { Router, type IRouter, Response } from "express";
import { db } from "@workspace/db";
import { menuItemsTable } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";
import { authenticate, AuthRequest } from "../middlewares/auth";

const router: IRouter = Router();

// Get vendor menu
router.get("/vendors/:vendorId/menu", async (req, res: Response) => {
  try {
    const vendorId = parseInt(req.params.vendorId);

    if (isNaN(vendorId)) {
      res.status(400).json({ 
        error: "Invalid vendor ID", 
        message: "Vendor ID must be a number" 
      });
      return;
    }

    const { category, available } = req.query;

    let query = db.select().from(menuItemsTable).where(eq(menuItemsTable.vendorId, vendorId));

    // Apply filters
    const conditions = [eq(menuItemsTable.vendorId, vendorId)];
    
    if (category) {
      conditions.push(eq(menuItemsTable.category, category as string));
    }
    
    if (available !== undefined) {
      conditions.push(eq(menuItemsTable.available, available === "true"));
    }

    const menuItems = await db
      .select()
      .from(menuItemsTable)
      .where(and(...conditions));

    res.json(menuItems);
  } catch (error) {
    console.error("Error fetching menu:", error);
    res.status(500).json({ 
      error: "Internal server error", 
      message: "Failed to fetch menu" 
    });
  }
});

// Create menu item
router.post("/vendors/:vendorId/menu", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const vendorId = parseInt(req.params.vendorId);

    if (isNaN(vendorId)) {
      res.status(400).json({ 
        error: "Invalid vendor ID", 
        message: "Vendor ID must be a number" 
      });
      return;
    }

    // Check if vendor owns this menu
    if (req.vendor!.vendorId !== vendorId) {
      res.status(403).json({ 
        error: "Forbidden", 
        message: "You can only add items to your own menu" 
      });
      return;
    }

    const { name, description, price, category, emoji, available, rating, prepTime } = req.body;

    if (!name || !description || !price || !category || !emoji || !prepTime) {
      res.status(400).json({ 
        error: "Missing required fields", 
        message: "name, description, price, category, emoji, and prepTime are required" 
      });
      return;
    }

    const [menuItem] = await db
      .insert(menuItemsTable)
      .values({
        vendorId,
        name,
        description,
        price,
        category,
        emoji,
        available: available ?? true,
        rating: rating ?? 4.5,
        prepTime,
      })
      .returning();

    res.status(201).json(menuItem);
  } catch (error) {
    console.error("Error creating menu item:", error);
    res.status(500).json({ 
      error: "Internal server error", 
      message: "Failed to create menu item" 
    });
  }
});

// Update menu item
router.put("/menu/:menuItemId", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const menuItemId = parseInt(req.params.menuItemId);

    if (isNaN(menuItemId)) {
      res.status(400).json({ 
        error: "Invalid menu item ID", 
        message: "Menu item ID must be a number" 
      });
      return;
    }

    // Check if menu item exists and belongs to vendor
    const [existingItem] = await db
      .select()
      .from(menuItemsTable)
      .where(eq(menuItemsTable.id, menuItemId))
      .limit(1);

    if (!existingItem) {
      res.status(404).json({ 
        error: "Not found", 
        message: "Menu item not found" 
      });
      return;
    }

    if (existingItem.vendorId !== req.vendor!.vendorId) {
      res.status(403).json({ 
        error: "Forbidden", 
        message: "You can only update your own menu items" 
      });
      return;
    }

    const { name, description, price, category, emoji, available, rating, prepTime } = req.body;
    const updates: any = { updatedAt: new Date() };

    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (price !== undefined) updates.price = price;
    if (category !== undefined) updates.category = category;
    if (emoji !== undefined) updates.emoji = emoji;
    if (available !== undefined) updates.available = available;
    if (rating !== undefined) updates.rating = rating;
    if (prepTime !== undefined) updates.prepTime = prepTime;

    const [updatedItem] = await db
      .update(menuItemsTable)
      .set(updates)
      .where(eq(menuItemsTable.id, menuItemId))
      .returning();

    res.json(updatedItem);
  } catch (error) {
    console.error("Error updating menu item:", error);
    res.status(500).json({ 
      error: "Internal server error", 
      message: "Failed to update menu item" 
    });
  }
});

// Delete menu item
router.delete("/menu/:menuItemId", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const menuItemId = parseInt(req.params.menuItemId);

    if (isNaN(menuItemId)) {
      res.status(400).json({ 
        error: "Invalid menu item ID", 
        message: "Menu item ID must be a number" 
      });
      return;
    }

    // Check if menu item exists and belongs to vendor
    const [existingItem] = await db
      .select()
      .from(menuItemsTable)
      .where(eq(menuItemsTable.id, menuItemId))
      .limit(1);

    if (!existingItem) {
      res.status(404).json({ 
        error: "Not found", 
        message: "Menu item not found" 
      });
      return;
    }

    if (existingItem.vendorId !== req.vendor!.vendorId) {
      res.status(403).json({ 
        error: "Forbidden", 
        message: "You can only delete your own menu items" 
      });
      return;
    }

    await db.delete(menuItemsTable).where(eq(menuItemsTable.id, menuItemId));

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting menu item:", error);
    res.status(500).json({ 
      error: "Internal server error", 
      message: "Failed to delete menu item" 
    });
  }
});

export default router;
