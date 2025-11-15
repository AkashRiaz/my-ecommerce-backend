import { Permission, UserRole } from './../src/enums/user';
import prisma from "../src/shared/prisma";
import bcrypt from "bcrypt";

async function seed() {
  console.log("🌱 Seeding started...");

  // -----------------------------------------
  // 1️⃣ Create all roles from UserRole enum
  // -----------------------------------------
  for (const roleName of Object.values(UserRole)) {
    await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: {
        name: roleName,
        description: `${roleName} role`,
      },
    });
  }

  console.log("✔ All roles synced from UserRole enum");

  // -----------------------------------------
  // 2️⃣ Create permissions from Permission enum
  // -----------------------------------------
  for (const permission of Object.values(Permission)) {
    await prisma.permission.upsert({
      where: {
        module_action: {
          module: permission.split("_")[0].toLowerCase(), // e.g PRODUCT -> product
          action: permission.toLowerCase(),               // product_create
        },
      },
      update: {},
      create: {
        module: permission.split("_")[0].toLowerCase(),
        action: permission.toLowerCase(),
      },
    });
  }

  console.log("✔ Permissions synced from Permission enum");


  // -----------------------------------------------------
  // 3️⃣ Create Super Admin User (FIRST ADMIN)
  // -----------------------------------------------------
  const adminEmail = "admin@example.com";
  const adminPassword = "Admin@123";

  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });

  let adminUser;

  if (!existingAdmin) {
    adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        name: "Super Admin",
        phone: "0000000000",
        passwordHash: await bcrypt.hash(adminPassword, 10),
      },
    });
    console.log(`✔ Super Admin created → ${adminEmail}`);
  } else {
    adminUser = existingAdmin;
    console.log(`ℹ Super Admin already exists → ${adminEmail}`);
  }

  // -----------------------------------------------------
  // 4️⃣ Assign SUPER_ADMIN Role to Super Admin User
  // -----------------------------------------------------
  const superAdminRole = await prisma.role.findUnique({
    where: { name: UserRole.SUPER_ADMIN },
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: adminUser.id,
        roleId: superAdminRole!.id,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      roleId: superAdminRole!.id,
    },
  });

  console.log("✔ SUPER_ADMIN role assigned to Super Admin");

  console.log("🌱 Seeding complete!");
}

seed()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });