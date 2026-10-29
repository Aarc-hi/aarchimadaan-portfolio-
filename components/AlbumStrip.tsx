import React, { useEffect, useState } from 'react';

// A tile for the About page: the covers of the albums on repeat, side by side with no gap, sliding left for ever inside the box.
// Only the names and Apple's catalogue numbers are kept here: the cover pictures are loaded by the visitor's browser from Apple's own
// public catalogue (the iTunes lookup service), so no copy of any cover is stored in the project. A cover that cannot be loaded shows the
// album's name on a plain square instead.
type Album = { id: number; name: string; artist: string };

// in the order they were listed (the two albums by Peter Cat Recording Co. are still to come: their covers are not in the catalogue)
const ALBUMS: Album[] = [
  { id: 1695979461, name: 'Sunburn', artist: 'Dominic Fike' },
  { id: 601140186, name: 'Comedown Machine', artist: 'The Strokes' },
  { id: 1441164426, name: 'Abbey Road', artist: 'The Beatles' },
  { id: 1786351934, name: 'Awaaz', artist: 'Darzi' },
  { id: 1441133180, name: 'The Beatles (The White Album)', artist: 'The Beatles' },
  { id: 1878564522, name: 'Raani', artist: 'Shashwat Bulusu' },
  { id: 1623929720, name: 'French Exit', artist: 'TV Girl' },
  { id: 1448478213, name: 'Jaago', artist: 'Lifafa' },
  { id: 1109714933, name: 'In Rainbows', artist: 'Radiohead' },
];

const SECONDS_PER_COVER = 3.6;   // how long each cover takes to go by: the whole strip moves at one steady speed

export const AlbumStrip: React.FC = () => {
  const [art, setArt] = useState<Record<number, string>>({});
  useEffect(() => {
    let live = true;
    fetch(`https://itunes.apple.com/lookup?id=${ALBUMS.map((a) => a.id).join(',')}&country=in`)
      .then((r) => r.json())
      .then((j: { results: { collectionId: number; artworkUrl100?: string }[] }) => {
        if (!live) return;
        const m: Record<number, string> = {};
        j.results.forEach((x) => { if (x.artworkUrl100) m[x.collectionId] = x.artworkUrl100.replace(/\d+x\d+bb/, '400x400bb'); });
        setArt(m);
      })
      .catch(() => { /* no connection to the catalogue: the plain squares stay */ });
    return () => { live = false; };
  }, []);

  // the list twice in a row: when the first copy has gone by, the second sits exactly where the first began, so it never jumps
  const cover = (a: Album, copy: number) => (
    <div key={`${a.id}-${copy}`} className="relative flex-none h-full aspect-square bg-black/[0.06]" title={`${a.name}, ${a.artist}`} aria-hidden={copy === 1}>
      {art[a.id]
        ? <img src={art[a.id]} alt={copy === 0 ? `${a.name} by ${a.artist}` : ''} draggable={false} className="block w-full h-full object-cover select-none" />
        : <span className="absolute inset-0 p-3 font-display text-base leading-tight tracking-tight opacity-60">{a.name}</span>}
    </div>
  );

  return (
    <div className="album-strip group relative flex-1 basis-0 min-w-0 h-[104px] min-[1152px]:h-[140px] rounded-2xl overflow-hidden bg-paper shadow-[0_8px_24px_rgba(0,0,0,0.08)]" style={{ contain: 'layout paint' }}
      role="group" aria-label="Albums on repeat">
      <div className="album-track flex h-full w-max" style={{ animation: `albumSlide ${ALBUMS.length * SECONDS_PER_COVER}s linear infinite` }}>
        {ALBUMS.map((a) => cover(a, 0))}
        {ALBUMS.map((a) => cover(a, 1))}
      </div>
      {/* the name of the tile, in the same pill as "cat-a-logue" on the cat photo; it stays put while the covers slide behind it */}
      <span className="absolute left-3 bottom-3 z-10 bg-paper rounded-full px-3 py-1 font-display text-xs min-[1152px]:text-sm tracking-tight shadow-[0_2px_8px_rgba(0,0,0,0.12)] pointer-events-none">
        discography
      </span>
      <style>{`@keyframes albumSlide { from { transform: translateX(0) } to { transform: translateX(-50%) } }
      .album-strip:hover .album-track { animation-play-state: paused }
      @media (prefers-reduced-motion: reduce) { .album-track { animation: none !important } }`}</style>
    </div>
  );
};
