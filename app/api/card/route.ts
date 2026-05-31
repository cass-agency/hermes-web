import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import * as fs from "fs";
import * as path from "path";

const CARD_PATH = "/tmp/alembic-card.png";
const SCRIPT_PATH = path.join(process.cwd(), "scripts", "generate-card.mjs");

function runCardScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    const env = {
      ...process.env,
      HERMES_PROJECT_PATH: process.env.HERMES_PROJECT_PATH ?? "/workspace/group/projects/hermes",
    };

    const child = spawn("node", [SCRIPT_PATH], { env });

    let stderr = "";
    child.stderr.on("data", (d) => { stderr += d.toString(); });
    child.stdout.on("data", (d) => {
      const line = d.toString();
      if (line.includes("CARD_ERROR:")) {
        reject(new Error(line.replace("CARD_ERROR:", "").trim()));
      }
    });

    child.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(stderr || `Script exited with code ${code}`));
      }
    });
  });
}

export async function POST(_req: NextRequest) {
  try {
    await runCardScript();

    if (!fs.existsSync(CARD_PATH)) {
      return NextResponse.json({ error: "Card was not generated" }, { status: 500 });
    }

    const imageBuffer = fs.readFileSync(CARD_PATH);
    const base64 = imageBuffer.toString("base64");

    return NextResponse.json({
      image: `data:image/png;base64,${base64}`,
      path: CARD_PATH,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Card generation failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
