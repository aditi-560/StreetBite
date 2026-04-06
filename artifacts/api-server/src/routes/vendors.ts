import { Router, type IRouter, Response } from "express";
import { db } from "@workspace/db";
import { vendorsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { authenticate, AuthRequest } from "../middlewares/auth";

const router: IRouter = Router();

// Get vendor by ID
router.get("/vendors/:vendorId", async (req, res: Response) => {
  try {
    const vendorId = parseInt(req.params.vendorId);

    if (isNaN(vendorId)) {
      res.status(400).json({ 
        error: "Invalid vendor ID", 
        message: "Vendor ID must be a number" 
      });
      return;
    }

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

    res.json(vendor);
  } catch (error) {
    console.error("Error fetching vendor:", error);
    res.status(500).json({ 
      error: "Internal server error", 
      message: "Failed to fetch vendor" 
    });
  }
});

// Get authenticated vendor profile
router.get("/vendors/me", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const [vendor] = await db
      .select()
      .from(vendorsTable)
      .where(eq(vendorsTable.id, req.vendor!.vendorId))
      .limit(1);

    if (!vendor) {
      res.status(404).json({ 
        error: "Not found", 
        message: "Vendor not found" 
      });
      return;
    }

    res.json(vendor);
  } catch (error) {
    console.error("Error fetching vendor profile:", error);
    res.status(500).json({ 
      error: "Internal server error", 
      message: "Failed to fetch vendor profile" 
    });
  }
});

// Update vendor
router.put("/vendors/:vendorId", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const vendorId = parseInt(req.params.vendorId);

    if (isNaN(vendorId)) {
      res.status(400).json({ 
        error: "Invalid vendor ID", 
        message: "Vendor ID must be a number" 
      });
      return;
    }

    // Check if vendor owns this profile
    if (req.vendor!.vendorId !== vendorId) {
      res.status(403).json({ 
        error: "Forbidden", 
        message: "You can only update your own profile" 
      });
      return;
    }

    const { name, description, category, isOpen } = req.body;
    const updates: any = { updatedAt: new Date() };

    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (category !== undefined) updates.category = category;
    if (isOpen !== undefined) updates.isOpen = isOpen;

    const [updatedVendor] = await db
      .update(vendorsTable)
      .set(updates)
      .where(eq(vendorsTable.id, vendorId))
      .returning();

    if (!updatedVendor) {
      res.status(404).json({ 
        error: "Not found", 
        message: "Vendor not found" 
      });
      return;
    }

    res.json(updatedVendor);
  } catch (error) {
    console.error("Error updating vendor:", error);
    res.status(500).json({ 
      error: "Internal server error", 
      message: "Failed to update vendor" 
    });
  }
});

export default router;
