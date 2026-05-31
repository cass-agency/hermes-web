import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import Database from "better-sqlite3";
import * as path from "path";
import * as fs from "fs";

const HERMES_PATH = process.env.HERMES_PROJECT_PATH ?? "/workspace/group/projects/hermes";
const DB_PATH = path.join(HERMES_PATH, "hermes.db");

interface CardRow {
  id: number;
  composed_path: string | null;
  imgur_url: string | null;
  sent_at: number;
  quote_text: string;
  quote_author: string;
  quote_book: string;
  image_title: string;
}

export async function GET() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      return NextResponse.json({ cards: [] });
    }

    const db = new Database(DB_PATH, { readonly: true });

    const rows = db.prepare(`
      SELECT
        ac.id,
        ac.composed_path,
        ac.imgur_url,
        ac.sent_at,
        aq.text as quote_text,
        aq.author as quote_author,
        aq.book as quote_book,
        ai.title as image_title
      FROM alembic_cards ac
      LEFT JOIN alembic_quotes aq ON aq.id = ac.quote_id
      LEFT JOIN alembic_images ai ON ai.id = ac.image_id
      ORDER BY ac.sent_at DESC
      LIMIT 12
    `).all() as CardRow[];

    db.close();

    const cards = rows.map((row) => {
      let imageData: string | null = null;

      // Try to read from composed_path
      if (row.composed_path && fs.existsSync(row.composed_path)) {
        const buf = fs.readFileSync(row.composed_path);
        imageData = `data:image/png;base64,${buf.toString("base64")}`;
      }

      return {
        id: row.id,
        image: imageData ?? row.imgur_url ?? null,
        quoteText: row.quote_text,
        quoteAuthor: row.quote_author,
        quoteBook: row.quote_book,
        imageTitle: row.image_title,
        sentAt: row.sent_at,
      };
    });

    return NextResponse.json({ cards });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Gallery error";
    return NextResponse.json({ error: msg, cards: [] }, { status: 500 });
  }
}
