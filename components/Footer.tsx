"use client";
import Container from "@/components/Container";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function Footer() {
  const [, setPartners] = useState<string[]>([]);
  useEffect(() => {
    let mounted = true;
    fetch("/api/sponsors")
      .then((r) => r.json())
      .then((data: { images: string[] }) => {
        if (!mounted) return;
        setPartners(data.images || []);
      })
      .catch(() => setPartners([]));
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <footer className="bg-black text-white border-t border-black mt-12">
      <Container className="py-10">
        <div className="flex flex-col md:flex-row justify-between gap-10">
          <div className="flex items-center gap-6">
            <Image src="/images/ui/CCPR%20LOGO%20WHITE4%20(1).png" alt="PRCC" width={140} height={36} />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 text-sm">
            <ul className="space-y-2">
              <li><a className="hover:underline" href="#">Terms of Use</a></li>
              <li><a className="hover:underline" href="#">Privacy Policy</a></li>
              <li><a className="hover:underline" href="#">Do Not Sell/Share</a></li>
            </ul>
            <ul className="space-y-2">
              <li>
                <a
                  className="hover:underline"
                  href="#"
                  onClick={(e) => { e.preventDefault(); window.dispatchEvent(new Event("open-chat-modal")); }}
                >
                  Contact Us
                </a>
              </li>
              <li><a className="hover:underline" href="#">Awards</a></li>
              <li><a className="hover:underline" href="#">Press Room</a></li>
            </ul>
            <ul className="space-y-2">
              <li><a className="hover:underline" href="#">Discover Puerto Rico</a></li>
              <li><a className="hover:underline" href="#">Quick Links</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-6 border-t border-white/10 pt-6 flex items-center justify-between text-xs text-white/70">
          <p>© {new Date().getFullYear()} Puerto Rico Convention Center</p>
          <div className="flex items-center gap-4">
            <a className="hover:text-sky" href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram">Instagram</a>
            <a className="hover:text-sky" href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook">Facebook</a>
            <a className="hover:text-sky" href="https://x.com" target="_blank" rel="noreferrer" aria-label="X">X</a>
          </div>
        </div>
      </Container>
    </footer>
  );
}


