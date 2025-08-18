"use client";
import React, { useState } from "react";
import { File, Plus, Star, Calendar, Users, Building } from "lucide-react";
import { useToast } from "./Toast";
import type { EventItem } from "@/lib/events";

interface EventTemplate {
  id: string;
  name: string;
  description: string;
  category: 'conference' | 'workshop' | 'networking' | 'exhibition' | 'ceremony' | 'other';
  template: Partial<EventItem>;
  isDefault?: boolean;
  usageCount?: number;
}

interface EventTemplatesProps {
  onUseTemplate: (template: Partial<EventItem>) => void;
  onClose: () => void;
}

const defaultTemplates: EventTemplate[] = [
  {
    id: 'conference-template',
    name: 'Conference Event',
    description: 'Professional conference with multiple sessions',
    category: 'conference',
    template: {
      name: 'Annual Conference 2024',
      planner: 'Conference Organizers',
      time: '09:00',
      description: '<p>Join us for our annual conference featuring keynote speakers, breakout sessions, and networking opportunities.</p><p><strong>Agenda:</strong></p><ul><li>9:00 AM - Registration & Welcome</li><li>10:00 AM - Keynote Presentation</li><li>11:30 AM - Breakout Sessions</li><li>1:00 PM - Networking Lunch</li><li>3:00 PM - Panel Discussion</li><li>5:00 PM - Closing Remarks</li></ul>',
      image: '/images/events/placeholder-conference.jpg'
    },
    isDefault: true,
    usageCount: 15
  },
  {
    id: 'workshop-template',
    name: 'Workshop/Training',
    description: 'Educational workshop or training session',
    category: 'workshop',
    template: {
      name: 'Professional Development Workshop',
      planner: 'Training Department',
      time: '14:00',
      description: '<p>Interactive workshop designed to enhance your professional skills.</p><p><strong>What you\'ll learn:</strong></p><ul><li>Key industry best practices</li><li>Hands-on practical exercises</li><li>Networking with peers</li><li>Certificate of completion</li></ul><p><strong>Requirements:</strong> Please bring a laptop and notebook.</p>',
      image: '/images/events/placeholder-workshop.jpg'
    },
    isDefault: true,
    usageCount: 8
  },
  {
    id: 'networking-template',
    name: 'Networking Event',
    description: 'Social networking and relationship building',
    category: 'networking',
    template: {
      name: 'Professional Networking Mixer',
      planner: 'Business Network',
      time: '18:00',
      description: '<p>Connect with professionals from various industries in a relaxed, social environment.</p><p><strong>Event Features:</strong></p><ul><li>Welcome reception</li><li>Speed networking sessions</li><li>Light refreshments</li><li>Business card exchange</li><li>Door prizes</li></ul><p>Dress code: Business casual</p>',
      image: '/images/events/placeholder-networking.jpg'
    },
    isDefault: true,
    usageCount: 12
  },
  {
    id: 'exhibition-template',
    name: 'Trade Show/Exhibition',
    description: 'Product showcase and trade exhibition',
    category: 'exhibition',
    template: {
      name: 'Industry Trade Show',
      planner: 'Trade Association',
      time: '10:00',
      description: '<p>Discover the latest products, services, and innovations in our industry.</p><p><strong>Exhibition Highlights:</strong></p><ul><li>100+ exhibitor booths</li><li>Product demonstrations</li><li>Industry expert presentations</li><li>Buyer-seller meetings</li><li>Innovation showcase</li></ul><p>Free admission with registration.</p>',
      image: '/images/events/placeholder-exhibition.jpg'
    },
    isDefault: true,
    usageCount: 6
  },
  {
    id: 'ceremony-template',
    name: 'Awards/Ceremony',
    description: 'Formal ceremony or awards event',
    category: 'ceremony',
    template: {
      name: 'Annual Awards Ceremony',
      planner: 'Event Committee',
      time: '19:00',
      description: '<p>Join us for an elegant evening celebrating excellence and achievement.</p><p><strong>Program:</strong></p><ul><li>7:00 PM - Cocktail reception</li><li>8:00 PM - Welcome remarks</li><li>8:30 PM - Award presentations</li><li>9:30 PM - Entertainment</li><li>10:00 PM - Closing reception</li></ul><p>Formal attire required.</p>',
      image: '/images/events/placeholder-ceremony.jpg'
    },
    isDefault: true,
    usageCount: 4
  }
];

export default function EventTemplates({ onUseTemplate, onClose }: EventTemplatesProps) {
  const { showToast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [templates] = useState<EventTemplate[]>(defaultTemplates);

  const categories = [
    { id: 'all', label: 'All Templates', icon: File },
    { id: 'conference', label: 'Conferences', icon: Users },
    { id: 'workshop', label: 'Workshops', icon: Building },
    { id: 'networking', label: 'Networking', icon: Users },
    { id: 'exhibition', label: 'Exhibitions', icon: Building },
    { id: 'ceremony', label: 'Ceremonies', icon: Star }
  ];

  const filteredTemplates = selectedCategory === 'all' 
    ? templates 
    : templates.filter(t => t.category === selectedCategory);

  const handleUseTemplate = (template: EventTemplate) => {
    onUseTemplate(template.template);
    showToast({
      type: "success",
      title: "Template Applied",
      message: `"${template.name}" template has been applied to the form.`
    });
    onClose();
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'conference': return <Users className="h-4 w-4" />;
      case 'workshop': return <Building className="h-4 w-4" />;
      case 'networking': return <Users className="h-4 w-4" />;
      case 'exhibition': return <Building className="h-4 w-4" />;
      case 'ceremony': return <Star className="h-4 w-4" />;
      default: return <File className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'conference': return 'bg-blue-100 text-blue-800';
      case 'workshop': return 'bg-green-100 text-green-800';
      case 'networking': return 'bg-purple-100 text-purple-800';
      case 'exhibition': return 'bg-orange-100 text-orange-800';
      case 'ceremony': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <FileTemplate className="h-6 w-6 text-indigo-600" />
            <h2 className="text-xl font-semibold text-gray-900">Event Templates</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Category Sidebar */}
          <div className="w-64 bg-gray-50 border-r p-4 overflow-y-auto">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Categories</h3>
            <div className="space-y-1">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors
                      ${selectedCategory === category.id
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'text-gray-600 hover:bg-gray-100'
                      }
                    `}
                  >
                    <Icon className="h-4 w-4" />
                    {category.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Templates Grid */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleUseTemplate(template)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(template.category)}
                      <h3 className="font-medium text-gray-900">{template.name}</h3>
                      {template.isDefault && (
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      )}
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(template.category)}`}>
                      {template.category}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 mb-3">
                    {template.description}
                  </p>

                  <div className="space-y-2 mb-4">
                    <div className="text-xs text-gray-500">
                      <strong>Sample Name:</strong> {template.template.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      <strong>Default Time:</strong> {template.template.time}
                    </div>
                    {template.usageCount && (
                      <div className="text-xs text-gray-500">
                        Used {template.usageCount} times
                      </div>
                    )}
                  </div>

                  <button
                    className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUseTemplate(template);
                    }}
                  >
                    Use This Template
                  </button>
                </div>
              ))}
            </div>

            {filteredTemplates.length === 0 && (
              <div className="text-center py-12">
                <File className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Templates Found</h3>
                <p className="text-gray-600">No templates available for the selected category.</p>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 bg-gray-50 border-t">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div>
              Select a template to quickly create events with pre-filled content
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{filteredTemplates.length} templates available</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
