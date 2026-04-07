import React from 'react'
import Image from 'next/image'

interface LogoCircleProps {
  width: number
  height: number
  className?: string
  priority?: boolean
}

export default function LogoCircle({ width, height, className = '', priority = false }: LogoCircleProps) {
  return (
    <div
      className={`relative inline-block ${className}`}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        borderRadius: '50%',
        overflow: 'hidden',
        backgroundColor: 'transparent',
      }}
    >
      <Image
        src="/logo.jpg"
        alt="Daniel Silva Photography"
        fill
        className="object-cover"
        priority={priority}
        sizes={`${width}px`}
      />
      {/* Subtle radial gradient vignette */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.15) 100%)',
          pointerEvents: 'none',
        }}
      />
    </div>
  )
}
