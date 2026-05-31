"use client";

import { useState } from "react";
import ChatPanel from "@/components/ChatPanel";
import GalleryPanel from "@/components/GalleryPanel";

export default function Home() {
  const [galleryRefresh, setGalleryRefresh] = useState(0);

  function handleCardGenerated() {
    setGalleryRefresh((n) => n + 1);
  }

  return (
    <div className="flex flex-col h-screen bg-bg">
      {/* Header */}
      <header className="border-b border-[#2a1f28] px-6 py-3 flex items-center gap-4 shrink-0">
        <div className="text-gold text-xl">☿</div>
        <div>
          <h1 className="font-display text-gold text-base tracking-widest uppercase leading-none">
            Hermes Trismegistus
          </h1>
          <p className="text-[#8a6a2a] text-xs font-serif italic">
            Alchemical Oracle — Master of the Three Parts
          </p>
        </div>
      </header>

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Chat — main column */}
        <main className="flex-1 flex flex-col overflow-hidden border-r border-[#2a1f28]">
          <ChatPanel onCardGenerated={handleCardGenerated} />
        </main>

        {/* Gallery — side column */}
        <aside className="w-72 shrink-0 flex flex-col overflow-hidden">
          <GalleryPanel refreshTrigger={galleryRefresh} />
        </aside>
      </div>
    </div>
  );
}
