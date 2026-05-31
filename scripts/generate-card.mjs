/**
 * Wrapper script to generate an alembic card from the Hermes project.
 * Called via child_process from the card API route.
 */
import { createRequire } from "module";
import path from "path";

const HERMES_PATH = process.env.HERMES_PROJECT_PATH ?? "/workspace/group/projects/hermes";
const DB_PATH = path.join(HERMES_PATH, "hermes.db");

process.env.ALEMBIC_DB_PATH = DB_PATH;

const require = createRequire(import.meta.url);
const alembic = require(path.join(HERMES_PATH, "dist", "alembic.js"));

try {
  await alembic.initAlembicTables();
  await alembic.sendAlembicCard();
  console.log("CARD_DONE:/tmp/alembic-card.png");
  process.exit(0);
} catch (err) {
  console.error("CARD_ERROR:" + err.message);
  process.exit(1);
}
