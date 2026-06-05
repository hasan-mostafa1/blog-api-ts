const { prisma } = require("../../lib/prisma");
const bcrypt = require("bcryptjs");

async function adminSeeder() {
  console.log("Running admin seeder...");
  const admin = await prisma.user.upsert({
    where: { email: "admin@admin.com" },
    update: {},
    create: {
      firstName: "Admin",
      lastName: "Admoon",
      email: "admin@admin.com",
      password: await bcrypt.hash("admin123", 10),
      role: "ADMIN",
    },
  });
  console.log("Done");
}

module.exports = adminSeeder;
