-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_scrapers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "name" TEXT NOT NULL,
    "default_url" TEXT,
    "description" TEXT,
    "owner_id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "parsingModel" JSONB NOT NULL,
    CONSTRAINT "scrapers_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "scrapers_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_scrapers" ("client_id", "created_at", "default_url", "description", "id", "name", "owner_id", "parsingModel", "updated_at") SELECT "client_id", "created_at", "default_url", "description", "id", "name", "owner_id", "parsingModel", "updated_at" FROM "scrapers";
DROP TABLE "scrapers";
ALTER TABLE "new_scrapers" RENAME TO "scrapers";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
