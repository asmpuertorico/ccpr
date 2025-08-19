"use client";
import Image from "next/image";
import Container from "@/components/Container";
import { useEffect, useState } from "react";

export default function SponsorsMarquee() {
  const [logos, setLogos] = useState<string[]>([]);
  useEffect(() => {
    let mounted = true;
    fetch("/api/sponsors")
      .then((r) => r.json())
      .then((data: { images: string[] }) => {
        if (!mounted) return;
        setLogos(data.images || []);
      })
      .catch(() => setLogos([]));
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className=" select-none">
      <Container>
        <div className="overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
          <div className="flex items-center gap-12 animate-[marquee_30s_linear_infinite] hover:[animation-play-state:paused] will-change-transform">
            {logos.concat(logos).map((src, i) => (
              <div key={i} className="h-12 relative w-40 shrink-0">
                <Image src={src} alt="Sponsor logo" fill sizes="160px" className="object-contain" />
              </div>
            ))}
          </div>
        </div>
      </Container>
      <style jsx>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}


