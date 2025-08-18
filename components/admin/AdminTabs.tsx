"use client";
import React, { useState } from "react";
import { BarChart3, Calendar, Settings, CalendarDays } from "lucide-react";
import Dashboard from "./Dashboard";
import AdminPanel from "./AdminPanel";
import CalendarView from "./CalendarView";
import PerformanceMonitor from "./PerformanceMonitor";
import type { EventItem } from "@/lib/events";

interface AdminTabsProps {
  initialEvents: EventItem[];
}

type TabId = 'dashboard' | 'events' | 'calendar' | 'settings';

interface Tab {
  id: TabId;
  label: string;
  icon: React.ReactNode;
  component: React.ReactNode;
}

export default function AdminTabs({ initialEvents }: AdminTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [events, setEvents] = useState<EventItem[]>(initialEvents);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);

  const handleEventEdit = (event: EventItem) => {
    setEditingEvent(event);
    setActiveTab('events');
  };

  const handleEventDelete = async (eventId: string) => {
    // This will be handled by the calendar view
    setEvents(events.filter(e => e.id !== eventId));
  };

  const tabs: Tab[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <BarChart3 className="h-4 w-4" />,
      component: <Dashboard events={events} />
    },
    {
      id: 'events',
      label: 'Manage Events',
      icon: <Calendar className="h-4 w-4" />,
      component: <AdminPanel initialEvents={events} editingEvent={editingEvent} onEventUpdated={() => setEditingEvent(null)} />
    },
    {
      id: 'calendar',
      label: 'Calendar View',
      icon: <CalendarDays className="h-4 w-4" />,
      component: <CalendarView events={events} onEventEdit={handleEventEdit} onEventDelete={handleEventDelete} />
    },
    {
      id: 'settings',
      label: 'System Monitor',
      icon: <Settings className="h-4 w-4" />,
      component: (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">System Monitor</h2>
            <p className="text-gray-600">Monitor system performance, health, and analytics.</p>
          </div>
          <PerformanceMonitor />
        </div>
      )
    }
  ];

  const activeTabData = tabs.find(tab => tab.id === activeTab);

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors
                ${activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[600px]">
        {activeTabData?.component}
      </div>
    </div>
  );
}
