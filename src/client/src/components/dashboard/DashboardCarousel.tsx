"use client";

import * as React from "react";

import Image from "next/image";

import Autoplay from "embla-carousel-autoplay";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const CAROUSEL_IMAGES = [
  { id: 1, src: "/images/banner-1.png", alt: "Banner 1" },
  { id: 2, src: "/images/banner-2.png", alt: "Banner 2" },
  { id: 3, src: "/images/banner-3.png", alt: "Banner 3" },
];

export function DashboardCarousel() {
  const plugin = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  );

  return (
    <div className="mx-auto mb-6 w-full max-w-[1498px] px-12 sm:mb-8 md:px-14">
      <Carousel
        plugins={[plugin.current]}
        className="w-full"
        onMouseEnter={plugin.current.stop}
        onMouseLeave={plugin.current.reset}
        opts={{
          loop: true,
        }}
      >
        <CarouselContent className="-ml-0">
          {CAROUSEL_IMAGES.map((img) => (
            <CarouselItem key={img.id} className="pl-0">
              <div className="relative aspect-[1498/417] w-full overflow-hidden rounded-xl border bg-card shadow-sm">
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  className="object-cover"
                  priority={img.id === 1}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
}
