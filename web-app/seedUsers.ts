async function seedUsers() {
  console.log("🚀 Seeding Dummy Users...");

  const BASE_URL = "http://localhost:3000/api/auth";
  const password = "Password123";

  const usersToCreate = [
    { name: "Devaang", email: "devaang@example.com", password, role: "INDIVIDUAL" },
    { name: "Dr. Ekansh", email: "ekansh@example.com", password, role: "DOCTOR" },
    { name: "Regency Hospital", email: "regency@example.com", password, role: "INSTITUTION" }
  ];

  for (const user of usersToCreate) {
    try {
      const res = await fetch(`${BASE_URL}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      });

      const data = await res.json();
      if (data.success) {
        console.log(`✅ Successfully created: ${user.name} (${user.role})`);
      } else if (data.message === "Email is already registered") {
        console.log(`⚠️ User already exists: ${user.name} (${user.email})`);
      } else {
        console.error(`❌ Failed to create ${user.name}:`, data);
      }
    } catch (error) {
      console.error(`❌ Error creating ${user.name}:`, error);
    }
  }
}

seedUsers().then(() => {
  console.log("\n🏁 Seeding process completed.");
  process.exit(0);
}).catch(console.error);
