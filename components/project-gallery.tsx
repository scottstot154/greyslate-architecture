"use client";

import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";
import type { Photo } from "../lib/portfolio";

export default function ProjectGallery({photos}: {photos: Photo[]}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [index, setIndex] = useState(0);
  if (!photos.length) return null;
  const go = (delta: number) => setIndex((value) => (value + delta + photos.length) % photos.length);
  return <>
    <div className="gallery-grid">
      {photos.map((photo, i) => <figure key={`${photo.src}-${i}`}>
        <button type="button" className="gallery-open" onClick={() => {setIndex(i); dialog.current?.showModal();}} aria-label={`Enlarge image: ${photo.alt}`}>
          <img src={photo.src} alt={photo.alt} loading="lazy"/><span><Maximize2 size={17}/></span>
        </button>
        <figcaption>{[photo.kind, photo.credit].filter(Boolean).join(" / ")}</figcaption>
      </figure>)}
    </div>
    <dialog ref={dialog} className="lightbox" aria-label="Project image" onKeyDown={(event) => {
      if (event.key === "ArrowLeft") go(-1);
      if (event.key === "ArrowRight") go(1);
    }}>
      <div className="lightbox-bar">
        <span>{index + 1} / {photos.length}</span>
        <button className="icon-button" type="button" onClick={() => dialog.current?.close()} aria-label="Close gallery" title="Close gallery"><X size={22}/></button>
      </div>
      <img src={photos[index].src} alt={photos[index].alt} loading="lazy"/>
      <div className="lightbox-bar">
        {photos.length > 1 && <button className="icon-button" type="button" onClick={() => go(-1)} aria-label="Previous image" title="Previous image"><ChevronLeft/></button>}
        <p aria-live="polite">{photos[index].alt}</p>
        {photos.length > 1 && <button className="icon-button" type="button" onClick={() => go(1)} aria-label="Next image" title="Next image"><ChevronRight/></button>}
      </div>
    </dialog>
  </>;
}
