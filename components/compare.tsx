"use client";

import { useState, type CSSProperties } from "react";
import { ChevronsLeftRight } from "lucide-react";
import type { Photo } from "../lib/portfolio";

export default function Compare({before, after}: {before: Photo; after: Photo}) {
  const [position, setPosition] = useState(50);
  return <figure className="comparison-figure">
    <div className="comparison" style={{"--split": `${position}%`} as CSSProperties}>
      {/* eslint-disable @next/next/no-img-element */}
      <img src={after.src} alt={`After: ${after.alt}`} loading="lazy"/>
      <img className="before-image" src={before.src} alt={`Before: ${before.alt}`} loading="lazy"/>
      {/* eslint-enable @next/next/no-img-element */}
      <span className="compare-label label-before" aria-hidden="true">Before</span>
      <span className="compare-label label-after" aria-hidden="true">After</span>
      <div className="compare-line" aria-hidden="true"><div className="compare-grip"><ChevronsLeftRight size={19}/></div></div>
      <input type="range" min="0" max="100" value={position} onChange={(event) => setPosition(event.target.valueAsNumber)}
        aria-label="Before and after comparison" aria-valuetext={`${position}% before, ${100 - position}% after`}/>
    </div>
    {(before.credit || after.credit) && <figcaption>{before.credit === after.credit ? before.credit : [before.credit && `Before: ${before.credit}`, after.credit && `After: ${after.credit}`].filter(Boolean).join(" / ")}</figcaption>}
  </figure>;
}
