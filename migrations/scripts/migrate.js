// eslint-disable-next-line @typescript-eslint/no-require-imports
const { runMigrations } = require("./migration-runner")
if (require.main === module) {
  runMigrations()
    .then(() => {
      console.log('Migration complete');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}
