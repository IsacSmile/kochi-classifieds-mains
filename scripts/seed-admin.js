const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || "postgresql://neondb_owner:npg_XGPvM1i2alzg@50.16.189.237:5432/neondb?sslmode=require&options=endpoint%3Dep-rapid-pond-avlt9dfu-pooler",
    },
  },
});

async function main() {
  console.log("Seeding default Admin user...");

  const adminEmail = "admin@kochiclassifieds.in";
  const rawPassword = "AdminPassword123!";

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    // Ensure role is admin
    await prisma.user.update({
      where: { email: adminEmail },
      data: { role: "admin", status: "active" },
    });
    console.log("✓ Existing admin user updated to role=admin:", adminEmail);
    return;
  }

  const passwordHash = await bcrypt.hash(rawPassword, 10);

  const adminUser = await prisma.user.create({
    data: {
      name: "Admin",
      email: adminEmail,
      phone: "+91 9876543210",
      passwordHash,
      role: "admin",
      status: "active",
    },
  });

  console.log("✓ Admin user created successfully!");
  console.log("-----------------------------------------");
  console.log("Email:    ", adminUser.email);
  console.log("Password: ", rawPassword);
  console.log("Role:     ", adminUser.role);
  console.log("-----------------------------------------");
}

main()
  .catch((e) => {
    console.error("Failed to seed admin user:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
