import { NextResponse } from "next/server";
import * as fs from "fs";
import * as path from "path";

export const dynamic = "force-dynamic";

// In-memory card store for deployed environments
// Cards are added when generated via POST /api/card
const GALLERY_FILE = "/tmp/hermes-gallery.json";

interface GalleryCard {
  id: number;
  image: string;
  quoteText: string;
  quoteAuthor: string;
  quoteBook: string;
  sentAt: number;
}

export function addToGallery(card: GalleryCard) {
  try {
    const existing: GalleryCard[] = fs.existsSync(GALLERY_FILE)
      ? JSON.parse(fs.readFileSync(GALLERY_FILE, "utf-8"))
      : [];
    existing.unshift(card);
    fs.writeFileSync(GALLERY_FILE, JSON.stringify(existing.slice(0, 50)));
  } catch {}
}

export async function GET() {
  try {
    // Try to read from local hermes DB if available (local dev)
    const HERMES_PATH = process.env.HERMES_PROJECT_PATH ?? "/workspace/group/projects/hermes";
    const DB_PATH = path.join(HERMES_PATH, "hermes.db");

    if (fs.existsSync(DB_PATH)) {
      try {
        // Dynamic import to avoid build-time failure when native module unavailable
        const Database = (await import("better-sqlite3")).default;
        const db = new Database(DB_PATH, { readonly: true });
        const rows = db.prepare(`
          SELECT ac.id, ac.imgur_url, ac.sent_at,
                 aq.text as quote_text, aq.author as quote_author, aq.book as quote_book
          FROM alembic_cards ac
          LEFT JOIN alembic_quotes aq ON aq.id = ac.quote_id
          ORDER BY ac.sent_at DESC LIMIT 20
        `).all() as Array<{id: number; imgur_url: string|null; sent_at: number; quote_text: string; quote_author: string; quote_book: string}>;
        db.close();
        const cards = rows.map(r => ({
          id: r.id, image: r.imgur_url, quoteText: r.quote_text,
          quoteAuthor: r.quote_author, quoteBook: r.quote_book, sentAt: r.sent_at,
        }));
        return NextResponse.json({ cards });
      } catch { /* native module not available, fall through */ }
    }

    // Fallback: in-memory gallery (deployed environment)
    const cards: GalleryCard[] = fs.existsSync(GALLERY_FILE)
      ? JSON.parse(fs.readFileSync(GALLERY_FILE, "utf-8"))
      : [];
    return NextResponse.json({ cards });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Gallery error";
    return NextResponse.json({ error: msg, cards: [] }, { status: 500 });
  }
}
