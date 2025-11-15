import prisma from "../src/shared/prisma";

async function fixUsers() {
  console.log("🚀 Fixing existing users...");

  // 1️⃣ Ensure CUSTOMER role exists
  const customerRole = await prisma.role.findUnique({
    where: { name: "CUSTOMER" },
  });

  if (!customerRole) {
    console.error("❌ CUSTOMER role not found! Run seed first.");
    process.exit(1);
  }

  // 2️⃣ Ensure SUPER_ADMIN role exists
  const superAdminRole = await prisma.role.findUnique({
    where: { name: "SUPER_ADMIN" },
  });

  if (!superAdminRole) {
    console.error("❌ SUPER_ADMIN role not found! Run seed first.");
    process.exit(1);
  }

  // 3️⃣ Find your super admin user (from seed)
  const superAdminEmail = "admin@example.com"; // MUST MATCH SEED FILE
  const superAdminUser = await prisma.user.findUnique({
    where: { email: superAdminEmail },
  });

  if (!superAdminUser) {
    console.error(`❌ Super admin user not found → ${superAdminEmail}`);
    process.exit(1);
  }

  console.log(`✔ SUPER_ADMIN found: ${superAdminUser.email}`);

  // 4️⃣ Assign CUSTOMER role to all other users
  const allUsers = await prisma.user.findMany();

  for (const user of allUsers) {
    if (user.id === superAdminUser.id) continue; // skip SUPER_ADMIN

    // remove any old/broken roles
    await prisma.userRole.deleteMany({
      where: { userId: user.id },
    });

    // assign CUSTOMER
    await prisma.userRole.create({
      data: {
        userId: user.id,
        roleId: customerRole.id,
      },
    });

    console.log(`✔ CUSTOMER assigned to: ${user.email}`);
  }

  console.log("🎉 Done! All users are CUSTOMER except SUPER_ADMIN.");
  process.exit(0);
}

fixUsers().catch(err => {
  console.error(err);
  process.exit(1);
});
