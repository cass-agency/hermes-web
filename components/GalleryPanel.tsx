"use client";

import { useEffect, useState } from "react";

interface GalleryCard {
  id: number;
  image: string | null;
  quoteText: string;
  quoteAuthor: string;
  quoteBook: string;
  imageTitle: string;
  sentAt: number;
}

interface GalleryPanelProps {
  refreshTrigger?: number;
}

export default function GalleryPanel({ refreshTrigger }: GalleryPanelProps) {
  const [cards, setCards] = useState<GalleryCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<GalleryCard | null>(null);

  async function loadGallery() {
    setLoading(true);
    try {
      const res = await fetch("/api/gallery");
      const data = await res.json();
      setCards(data.cards ?? []);
    } catch {
      setCards([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadGallery();
  }, [refreshTrigger]);

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-[#2a1f28] flex items-center justify-between">
        <h2 className="font-display text-gold text-sm tracking-widest uppercase">
          The Alembic Gallery
        </h2>
        <button
          onClick={loadGallery}
          className="text-xs text-[#8a6a2a] hover:text-gold transition-colors font-serif"
        >
          Refresh
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {loading && (
          <div className="text-center text-[#8a6a2a] text-sm font-serif italic py-8">
            Consulting the archives...
          </div>
        )}

        {!loading && cards.length === 0 && (
          <div className="text-center py-8">
            <p className="text-[#8a6a2a] text-sm font-serif italic">
              No cards yet in the vault.
            </p>
            <p className="text-[#8a6a2a] text-xs font-serif mt-2">
              Ask Hermes to generate a wisdom card.
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          {cards.map((card) => (
            <button
              key={card.id}
              onClick={() => setSelected(card)}
              className="group relative rounded-lg overflow-hidden border border-[#2a1f28] hover:border-[#c9a84c66] transition-colors aspect-square bg-[#160f13]"
            >
              {card.image ? (
                <img
                  src={card.image}
                  alt={card.quoteAuthor}
                  className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-2">
                  <div className="text-gold text-2xl mb-1">⚗</div>
                  <p className="text-[#8a6a2a] text-xs text-center font-serif line-clamp-3">
                    {card.quoteText?.slice(0, 60)}...
                  </p>
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0a0608dd] to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-gold text-xs font-display truncate">
                  {card.quoteAuthor}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {selected && (
        <div
          className="fixed inset-0 bg-[#0a0608ee] flex items-center justify-center z-50 p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-[#160f13] border border-[#c9a84c44] rounded-xl max-w-lg w-full p-4"
            onClick={(e) => e.stopPropagation()}
          >
            {selected.image && (
              <img
                src={selected.image}
                alt={selected.quoteAuthor}
                className="w-full rounded-lg mb-3"
              />
            )}
            <blockquote className="text-[#e8d5a8] text-sm font-serif italic leading-relaxed mb-2">
              &ldquo;{selected.quoteText}&rdquo;
            </blockquote>
            <p className="text-gold text-xs font-display">
              — {selected.quoteAuthor}, <span className="italic">{selected.quoteBook}</span>
            </p>
            <button
              onClick={() => setSelected(null)}
              className="mt-3 w-full text-xs text-[#8a6a2a] hover:text-gold transition-colors font-serif"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
