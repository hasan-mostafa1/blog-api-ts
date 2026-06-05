const adminSeeder = require("./adminSeeder");

async function main() {
  console.log("Seeding..");
  await adminSeeder();
  console.log("Seeding completed successfully.");
}

main().catch((err) => {
  console.log(err);
});
