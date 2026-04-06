import { db } from "@workspace/db";
import { vendorsTable, menuItemsTable, ordersTable } from "@workspace/db/schema";

async function seed() {
  console.log("🌱 Seeding database...");

  try {
    // Create a demo vendor
    const [vendor] = await db
      .insert(vendorsTable)
      .values({
        phoneNumber: "9876543210",
        name: "Sharma's Street Kitchen",
        description: "Authentic North Indian street food",
        category: "North Indian",
        rating: 4.8,
        isOpen: true,
      })
      .returning();

    console.log(`✅ Created vendor: ${vendor.name} (ID: ${vendor.id})`);

    // Create menu items
    const menuItems = [
      {
        vendorId: vendor.id,
        name: "Chole Bhature",
        description: "Fluffy deep-fried bread with spiced chickpea curry",
        price: 80,
        category: "main",
        emoji: "🫓",
        available: true,
        rating: 4.9,
        prepTime: 8,
      },
      {
        vendorId: vendor.id,
        name: "Pav Bhaji",
        description: "Spiced mashed vegetables with buttered bread rolls",
        price: 70,
        category: "main",
        emoji: "🍞",
        available: true,
        rating: 4.7,
        prepTime: 6,
      },
      {
        vendorId: vendor.id,
        name: "Paneer Tikka",
        description: "Grilled cottage cheese with aromatic spices",
        price: 120,
        category: "main",
        emoji: "🧆",
        available: true,
        rating: 4.8,
        prepTime: 10,
      },
      {
        vendorId: vendor.id,
        name: "Aloo Tikki",
        description: "Crispy potato patties with chutneys",
        price: 50,
        category: "side",
        emoji: "🥔",
        available: true,
        rating: 4.6,
        prepTime: 5,
      },
      {
        vendorId: vendor.id,
        name: "Masala Chai",
        description: "Spiced Indian milk tea",
        price: 20,
        category: "drink",
        emoji: "🍵",
        available: true,
        rating: 4.9,
        prepTime: 3,
      },
      {
        vendorId: vendor.id,
        name: "Lassi",
        description: "Chilled yogurt-based drink, sweet or salted",
        price: 40,
        category: "drink",
        emoji: "🥛",
        available: true,
        rating: 4.7,
        prepTime: 2,
      },
      {
        vendorId: vendor.id,
        name: "Samosa (2 pcs)",
        description: "Crispy fried pastry filled with spiced potatoes",
        price: 30,
        category: "side",
        emoji: "🥟",
        available: true,
        rating: 4.8,
        prepTime: 3,
      },
      {
        vendorId: vendor.id,
        name: "Gulab Jamun",
        description: "Soft milk dumplings soaked in rose syrup",
        price: 40,
        category: "dessert",
        emoji: "🍮",
        available: true,
        rating: 4.9,
        prepTime: 2,
      },
      {
        vendorId: vendor.id,
        name: "Dal Makhani",
        description: "Slow-cooked black lentils in buttery tomato gravy",
        price: 90,
        category: "main",
        emoji: "🍛",
        available: false,
        rating: 4.8,
        prepTime: 12,
      },
      {
        vendorId: vendor.id,
        name: "Jalebi",
        description: "Crispy orange-colored sweet spirals in sugar syrup",
        price: 35,
        category: "dessert",
        emoji: "🍩",
        available: true,
        rating: 4.7,
        prepTime: 4,
      },
    ];

    const createdMenuItems = await db
      .insert(menuItemsTable)
      .values(menuItems as any)
      .returning();

    console.log(`✅ Created ${createdMenuItems.length} menu items`);

    // Create some demo orders
    const demoOrders = [
      {
        tokenNumber: 1,
        vendorId: vendor.id,
        customerId: "customer_001",
        items: [
          { menuItemId: createdMenuItems[0].id, name: createdMenuItems[0].name, price: createdMenuItems[0].price, quantity: 2 },
          { menuItemId: createdMenuItems[4].id, name: createdMenuItems[4].name, price: createdMenuItems[4].price, quantity: 2 },
        ],
        status: "preparing",
        total: 200,
        estimatedTime: 8,
      },
      {
        tokenNumber: 2,
        vendorId: vendor.id,
        customerId: "customer_002",
        items: [
          { menuItemId: createdMenuItems[6].id, name: createdMenuItems[6].name, price: createdMenuItems[6].price, quantity: 1 },
          { menuItemId: createdMenuItems[5].id, name: createdMenuItems[5].name, price: createdMenuItems[5].price, quantity: 2 },
        ],
        status: "pending",
        total: 110,
        estimatedTime: 10,
      },
      {
        tokenNumber: 3,
        vendorId: vendor.id,
        customerId: "customer_003",
        items: [
          { menuItemId: createdMenuItems[2].id, name: createdMenuItems[2].name, price: createdMenuItems[2].price, quantity: 1 },
        ],
        status: "pending",
        total: 120,
        estimatedTime: 12,
      },
    ];

    const createdOrders = await db
      .insert(ordersTable)
      .values(demoOrders as any)
      .returning();

    console.log(`✅ Created ${createdOrders.length} demo orders`);

    console.log("\n🎉 Database seeded successfully!");
    console.log("\n📱 Demo Credentials:");
    console.log(`   Phone: ${vendor.phoneNumber}`);
    console.log(`   OTP: 123456 (demo mode)`);
    console.log(`   Vendor ID: ${vendor.id}`);

  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

seed()
  .then(() => {
    console.log("\n✨ Seed completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Seed failed:", error);
    process.exit(1);
  });
