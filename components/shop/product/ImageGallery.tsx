'use client'

import { useState } from 'react'

interface Props {
  images: string[]
  alt: string
}

export default function ImageGallery({ images, alt }: Props) {
  const [active, setActive] = useState(0)
  const hasImages = images.length > 0

  return (
    <div className="flex flex-col gap-3">
      {/* Main image */}
      <div className="aspect-square bg-[#EDE0D0] relative overflow-hidden">
        {hasImages ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={images[active]}
            alt={`${alt} — εικόνα ${active + 1}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-8xl opacity-20">
            🥩
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`aspect-square overflow-hidden border-2 transition-colors ${
                i === active ? 'border-[#C8102E]' : 'border-transparent hover:border-[#EDE0D0]'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={`${alt} thumbnail ${i + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
