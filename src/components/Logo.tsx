"use client";

import Image from 'next/image';

export function Logo() {
  return (
    <div className="flex items-center">
      {/* Logo MQMCrypto - Imagem real */}
      <Image 
        src="/images/logo.png"
        alt="MQMCrypto Logo"
        width={4000}
        height={2250}
        className="h-24 w-auto"
        priority
        quality={100}
        unoptimized
      />
    </div>
  );
}
