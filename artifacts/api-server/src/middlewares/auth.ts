import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../lib/jwt";
import { verifyFirebaseToken } from "../lib/firebase";
import { db } from "@workspace/db";
import { vendorsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

export interface AuthRequest extends Request {
  vendor?: {
    vendorId: number;
    phoneNumber: string;
  };
  firebaseUid?: string;
}

export async function authenticate(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized", message: "Missing or invalid authorization header" });
    return;
  }

  const token = authHeader.substring(7); // Remove "Bearer " prefix
  
  // Try JWT first (for backward compatibility)
  const jwtPayload = verifyToken(token);
  
  if (jwtPayload) {
    req.vendor = {
      vendorId: jwtPayload.vendorId,
      phoneNumber: jwtPayload.phoneNumber,
    };
    next();
    return;
  }
  
  // Try Firebase token
  try {
    const firebasePayload = await verifyFirebaseToken(token);
    
    if (firebasePayload && firebasePayload.phone_number) {
      // Find vendor by phone number
      const [vendor] = await db
        .select()
        .from(vendorsTable)
        .where(eq(vendorsTable.phoneNumber, firebasePayload.phone_number))
        .limit(1);
      
      if (!vendor) {
        res.status(401).json({ error: "Unauthorized", message: "Vendor not found" });
        return;
      }
      
      req.vendor = {
        vendorId: vendor.id,
        phoneNumber: vendor.phoneNumber,
      };
      req.firebaseUid = firebasePayload.uid;
      next();
      return;
    }
  } catch (error) {
    console.error("Error verifying Firebase token:", error);
  }

  res.status(401).json({ error: "Unauthorized", message: "Invalid or expired token" });
}
