import React from "react";
import Image from "next/image";
import { Mail, Phone } from "lucide-react";

interface TeamMemberCardProps {
  name: string;
  title: string;
  email: string;
  phone?: string;
  image: string;
  qrCode: string;
  downloadText: string;
}

export default function TeamMemberCard({ 
  name, 
  title, 
  email, 
  phone, 
  image, 
  qrCode, 
  downloadText 
}: TeamMemberCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow duration-300">
      {/* Profile Image */}
      <div className="aspect-square relative bg-gray-100">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover grayscale hover:grayscale-0 transition-all duration-300"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>
      
      {/* Content */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{name}</h3>
        <p className="text-gray-600 mb-4 font-medium">{title}</p>
        
        {/* Contact Info */}
        <div className="space-y-3 mb-6">
          <a 
            href={`mailto:${email}`}
            className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition-colors group"
          >
            <Mail className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
            <span className="text-sm break-all">{email}</span>
          </a>
          
          {phone && (
            <a 
              href={`tel:${phone}`}
              className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition-colors group"
            >
              <Phone className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
              <span className="text-sm">{phone}</span>
            </a>
          )}
        </div>
        
        {/* QR Code Section */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs text-gray-500 mb-2">{downloadText}</p>
              <div className="w-16 h-16 bg-white p-1 rounded-lg border">
                <Image
                  src={qrCode}
                  alt={`${name} vCard QR Code`}
                  width={64}
                  height={64}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
