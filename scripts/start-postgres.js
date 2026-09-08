const path = require("path");

async function startPg() {
  console.log("Initializing local PostgreSQL server on port 5432...");
  const { default: EmbeddedPostgres } = await import("embedded-postgres");

  const databasePath = path.join(__dirname, "../.postgres_data");

  const pg = new EmbeddedPostgres({
    port: 5432,
    user: "kochi",
    password: "kochi_dev_pass",
    database: "kochiclassifieds",
    databasePath,
  });

  try {
    await pg.initialise();
  } catch (e) {
    // Already initialised
  }

  await pg.start();
  console.log("PostgreSQL server is running on postgresql://kochi:kochi_dev_pass@localhost:5432/kochiclassifieds");
  
  // Keep alive
  setInterval(() => {}, 1000 * 60 * 60);
}

startPg().catch((err) => {
  console.error("Failed to start PostgreSQL:", err);
  process.exit(1);
});
