"use client";

import { useState } from "react";
import SectionWrapper from "@/components/ui/SectionWrapper";
import Image from "next/image";
import { useGlitchReveal } from "@/hooks/useGlitchReveal";
import type { PhotoAlbum, Photo } from "@/types";

/**
 * ─── Photo Gallery ────────────────────────────────────────────────────────────
 *
 * Albums are displayed as camera/folder icons on a corkboard.
 * Clicking an album opens a film-strip lightbox where you can scroll
 * horizontally through the photos.
 *
 * TODO:
 *   1. Populate ALBUMS with real photo data from /public/images/photos/.
 *   2. Add camera-folder icons to /public/images/ui/camera-folder.png.
 *   3. Add a film-strip frame asset to /public/images/ui/film-frame.png.
 *   4. Apply your grungy font & textures.
 */

const ALBUMS: PhotoAlbum[] = [
  {
    id: "album-1",
    title: "Album One",              // TODO
    coverSrc: "/images/ui/camera-folder.png", // TODO
    photos: [
      { id: "p1", src: "/images/photos/album1/p1.jpg", alt: "Photo 1" },
      { id: "p2", src: "/images/photos/album1/p2.jpg", alt: "Photo 2" },
      { id: "p3", src: "/images/photos/album1/p3.jpg", alt: "Photo 3" },
      // TODO: add more photos
    ],
  },
  {
    id: "album-2",
    title: "Album Two",              // TODO
    coverSrc: "/images/ui/camera-folder.png",
    photos: [
      { id: "p4", src: "/images/photos/album2/p1.jpg", alt: "Photo 1" },
    ],
  },
  // TODO: add more albums ↓
];

// ── Film Strip Lightbox ────────────────────────────────────────────────────────
function FilmStrip({
  album,
  onClose,
}: {
  album: PhotoAlbum;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/85">
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute right-6 top-6 text-white opacity-60 transition-opacity hover:opacity-100 text-2xl"
        aria-label="Close album"
      >
        ✕
      </button>

      <h3 className="mb-6 text-lg uppercase tracking-widest text-white/70">
        {album.title}
      </h3>

      {/* Scrollable film strip */}
      <div className="flex w-full max-w-5xl gap-4 overflow-x-auto px-8 pb-4 pt-2"
           style={{ scrollSnapType: "x mandatory" }}>
        {album.photos.map((photo) => (
          <div
            key={photo.id}
            className="relative shrink-0"
            style={{ scrollSnapAlign: "center" }}
          >
            {/* Film frame decoration */}
            {/* TODO: overlay /public/images/ui/film-frame.png as a border
                      using a pseudo-element or a positioned <Image> */}
            <div className="relative h-64 w-48 overflow-hidden rounded-sm border-4 border-[#1a1a1a] bg-neutral-800">
              {/* TODO: uncomment once real photos are in /public */}
              {/* <Image src={photo.src} alt={photo.alt} fill className="object-cover" /> */}
              <div className="flex h-full w-full items-center justify-center text-xs text-white/30">
                {photo.src}
              </div>
            </div>
            {photo.caption && (
              <p className="mt-2 text-center text-xs text-white/50">
                {photo.caption}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Film perforations decoration — top & bottom strips */}
      <p className="mt-4 text-xs uppercase tracking-widest text-white/30">
        scroll to browse — click anywhere outside to close
      </p>
    </div>
  );
}

// ── Camera Folder Icon ─────────────────────────────────────────────────────────
function AlbumIcon({
  album,
  onClick,
}: {
  album: PhotoAlbum;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group flex flex-col items-center gap-2 transition-transform hover:scale-105"
    >
      <div className="relative h-24 w-24">
        {/* TODO: replace with actual camera-folder icon asset */}
        {/* <Image src={album.coverSrc} alt={album.title} fill className="object-contain" /> */}
        <div className="flex h-full w-full items-center justify-center rounded-lg border-2 border-dashed border-current/40 bg-current/5 text-3xl opacity-50">
          📷
        </div>
      </div>
      <span className="text-xs uppercase tracking-wider opacity-60 group-hover:opacity-100">
        {album.title}
      </span>
    </button>
  );
}

// ── Section ────────────────────────────────────────────────────────────────────
export default function PhotoGallery() {
  const [openAlbum, setOpenAlbum] = useState<PhotoAlbum | null>(null);
  const { sectionRef: glitchRef } = useGlitchReveal();

  return (
    <SectionWrapper id="photos">
      {/* Ref anchor — walks up to <section> for the glitch reveal observer */}
      <div
        ref={(el) => {
          if (el) glitchRef.current = el.closest("section") as HTMLElement | null;
        }}
        style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
        aria-hidden="true"
      />

      <div className="flex min-h-screen w-full flex-col items-center justify-center gap-12 px-8 py-24">
        <h2
          data-glitch-reveal=""
          data-glitch-delay="0"
          className="text-2xl uppercase tracking-widest opacity-60 glitch-hidden"
        >
          Photos
        </h2>

        {/* Albums grid */}
        <div
          data-glitch-reveal=""
          data-glitch-delay="200"
          className="flex flex-wrap items-center justify-center gap-10 glitch-hidden"
        >
          {ALBUMS.map((album) => (
            <AlbumIcon
              key={album.id}
              album={album}
              onClick={() => setOpenAlbum(album)}
            />
          ))}
        </div>
      </div>

      {/* Film strip lightbox */}
      {openAlbum && (
        <FilmStrip album={openAlbum} onClose={() => setOpenAlbum(null)} />
      )}
    </SectionWrapper>
  );
}
