"use client";
import { QRCodeSVG } from "qrcode.react";

export default function SalesRepQRCode({ url }: { url: string }) {
  return (
    <div className="bg-white p-3 rounded-xl inline-block">
      <QRCodeSVG value={url} size={120} level="H" includeMargin={false} />
    </div>
  );
}
