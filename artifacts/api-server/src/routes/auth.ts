import { Router, type IRouter, Request, Response } from "express";
import { db } from "@workspace/db";
import { otpsTable, vendorsTable } from "@workspace/db/schema";
import { eq, and, gt } from "drizzle-orm";
import { generateOtp, getOtpExpiry, sendOtpSms } from "../lib/otp";
import { generateToken } from "../lib/jwt";

const router: IRouter = Router();

// Send OTP
router.post("/auth/send-otp", async (req: Request, res: Response) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber || !/^\d{10}$/.test(phoneNumber)) {
      res.status(400).json({ 
        error: "Invalid phone number", 
        message: "Phone number must be 10 digits" 
      });
      return;
    }

    // Generate OTP (in demo mode, always use 123456)
    const otp = process.env.NODE_ENV === "development" ? "123456" : generateOtp();
    const expiresAt = getOtpExpiry();

    // Store OTP in database
    await db.insert(otpsTable).values({
      phoneNumber,
      otp,
      expiresAt,
    });

    // Send OTP via SMS
    await sendOtpSms(phoneNumber, otp);

    res.json({
      message: "OTP sent successfully",
      expiresIn: 300, // 5 minutes
    });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ 
      error: "Internal server error", 
      message: "Failed to send OTP" 
    });
  }
});

// Verify OTP
router.post("/auth/verify-otp", async (req: Request, res: Response) => {
  try {
    const { phoneNumber, otp } = req.body;

    if (!phoneNumber || !/^\d{10}$/.test(phoneNumber)) {
      res.status(400).json({ 
        error: "Invalid phone number", 
        message: "Phone number must be 10 digits" 
      });
      return;
    }

    if (!otp || !/^\d{6}$/.test(otp)) {
      res.status(400).json({ 
        error: "Invalid OTP", 
        message: "OTP must be 6 digits" 
      });
      return;
    }

    // Find valid OTP
    const [otpRecord] = await db
      .select()
      .from(otpsTable)
      .where(
        and(
          eq(otpsTable.phoneNumber, phoneNumber),
          eq(otpsTable.otp, otp),
          eq(otpsTable.verified, "false"),
          gt(otpsTable.expiresAt, new Date())
        )
      )
      .orderBy(otpsTable.createdAt)
      .limit(1);

    if (!otpRecord) {
      res.status(400).json({ 
        error: "Invalid OTP", 
        message: "OTP is invalid or expired" 
      });
      return;
    }

    // Mark OTP as verified
    await db
      .update(otpsTable)
      .set({ verified: "true" })
      .where(eq(otpsTable.id, otpRecord.id));

    // Find or create vendor
    let [vendor] = await db
      .select()
      .from(vendorsTable)
      .where(eq(vendorsTable.phoneNumber, phoneNumber))
      .limit(1);

    if (!vendor) {
      // Create new vendor with default values
      [vendor] = await db
        .insert(vendorsTable)
        .values({
          phoneNumber,
          name: `Vendor ${phoneNumber.slice(-4)}`,
          description: "New street food vendor",
          category: "Street Food",
          rating: 4.5,
          isOpen: true,
        })
        .returning();
    }

    // Generate JWT token
    const token = generateToken(vendor.id, vendor.phoneNumber);

    res.json({
      token,
      vendor: {
        id: vendor.id,
        phoneNumber: vendor.phoneNumber,
        name: vendor.name,
        description: vendor.description,
        category: vendor.category,
        rating: vendor.rating,
        isOpen: vendor.isOpen,
        createdAt: vendor.createdAt,
        updatedAt: vendor.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ 
      error: "Internal server error", 
      message: "Failed to verify OTP" 
    });
  }
});

export default router;
