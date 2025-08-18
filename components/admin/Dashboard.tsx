"use client";
import React, { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Calendar, Users, Image, TrendingUp, Clock, AlertCircle } from 'lucide-react';
import { useToast } from "./Toast";
import type { EventItem } from "@/lib/events";

interface DashboardStats {
  totalEvents: number;
  upcomingEvents: number;
  pastEvents: number;
  draftEvents: number;
  eventsThisMonth: number;
  eventsNextMonth: number;
  averageEventsPerMonth: number;
  mostActiveMonth: string;
  eventsByMonth: Array<{ month: string; count: number }>;
  eventsByPlanner: Array<{ planner: string; count: number }>;
  recentActivity: Array<{
    id: string;
    action: string;
    eventName: string;
    timestamp: string;
  }>;
}

export default function Dashboard({ events }: { events: EventItem[] }) {
  const { showToast } = useToast();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    calculateStats();
  }, [events]);

  const calculateStats = () => {
    try {
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      // Basic counts
      const totalEvents = events.length;
      const upcomingEvents = events.filter(e => new Date(e.date) >= now).length;
      const pastEvents = events.filter(e => new Date(e.date) < now).length;
      const draftEvents = 0; // Will be implemented with database

      // Monthly statistics
      const thisMonthStart = new Date(currentYear, currentMonth, 1);
      const nextMonthStart = new Date(currentYear, currentMonth + 1, 1);
      const nextMonthEnd = new Date(currentYear, currentMonth + 2, 1);

      const eventsThisMonth = events.filter(e => {
        const eventDate = new Date(e.date);
        return eventDate >= thisMonthStart && eventDate < nextMonthStart;
      }).length;

      const eventsNextMonth = events.filter(e => {
        const eventDate = new Date(e.date);
        return eventDate >= nextMonthStart && eventDate < nextMonthEnd;
      }).length;

      // Events by month (last 12 months)
      const eventsByMonth = [];
      for (let i = 11; i >= 0; i--) {
        const monthDate = new Date(currentYear, currentMonth - i, 1);
        const monthName = monthDate.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
        const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1);
        
        const count = events.filter(e => {
          const eventDate = new Date(e.date);
          return eventDate >= monthStart && eventDate < monthEnd;
        }).length;

        eventsByMonth.push({ month: monthName, count });
      }

      // Events by planner
      const plannerCounts = events.reduce((acc, event) => {
        acc[event.planner] = (acc[event.planner] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const eventsByPlanner = Object.entries(plannerCounts)
        .map(([planner, count]) => ({ planner, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10); // Top 10 planners

      // Calculate averages
      const averageEventsPerMonth = Math.round(totalEvents / 12);
      const mostActiveMonth = eventsByMonth.reduce((max, current) => 
        current.count > max.count ? current : max, eventsByMonth[0]
      ).month;

      // Recent activity (mock data - will be replaced with audit logs)
      const recentActivity = events
        .slice(0, 5)
        .map(event => ({
          id: event.id,
          action: 'Updated',
          eventName: event.name,
          timestamp: new Date().toISOString()
        }));

      setStats({
        totalEvents,
        upcomingEvents,
        pastEvents,
        draftEvents,
        eventsThisMonth,
        eventsNextMonth,
        averageEventsPerMonth,
        mostActiveMonth,
        eventsByMonth,
        eventsByPlanner,
        recentActivity
      });
    } catch (error) {
      showToast({
        type: "error",
        title: "Dashboard Error",
        message: "Failed to calculate dashboard statistics"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-lg text-gray-600">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Events"
          value={stats.totalEvents}
          icon={<Calendar className="h-6 w-6" />}
          color="bg-blue-500"
        />
        <MetricCard
          title="Upcoming Events"
          value={stats.upcomingEvents}
          icon={<Clock className="h-6 w-6" />}
          color="bg-green-500"
        />
        <MetricCard
          title="Events This Month"
          value={stats.eventsThisMonth}
          icon={<TrendingUp className="h-6 w-6" />}
          color="bg-purple-500"
        />
        <MetricCard
          title="Active Planners"
          value={stats.eventsByPlanner.length}
          icon={<Users className="h-6 w-6" />}
          color="bg-orange-500"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Events by Month Chart */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold mb-4">Events by Month</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.eventsByMonth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#6366f1" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Planners Chart */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold mb-4">Top Event Planners</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stats.eventsByPlanner.slice(0, 6)}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ planner, percent }) => `${planner} (${percent ? (percent * 100).toFixed(0) : 0}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {stats.eventsByPlanner.slice(0, 6).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Insights and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Key Insights */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold mb-4">Key Insights</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <TrendingUp className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium">Most Active Month</p>
                <p className="text-sm text-gray-600">{stats.mostActiveMonth} had the most events</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <p className="font-medium">Monthly Average</p>
                <p className="text-sm text-gray-600">{stats.averageEventsPerMonth} events per month on average</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 text-purple-500 mt-0.5" />
              <div>
                <p className="font-medium">Top Planner</p>
                <p className="text-sm text-gray-600">
                  {stats.eventsByPlanner[0]?.planner} with {stats.eventsByPlanner[0]?.count} events
                </p>
              </div>
            </div>
            {stats.eventsNextMonth > stats.eventsThisMonth && (
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5" />
                <div>
                  <p className="font-medium">Busy Month Ahead</p>
                  <p className="text-sm text-gray-600">
                    {stats.eventsNextMonth} events scheduled for next month
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {stats.recentActivity.length > 0 ? (
              stats.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-md">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.action} event</p>
                    <p className="text-xs text-gray-600">{activity.eventName}</p>
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(activity.timestamp).toLocaleDateString()}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-8">
                No recent activity to display
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ 
  title, 
  value, 
  icon, 
  color 
}: { 
  title: string; 
  value: number; 
  icon: React.ReactNode; 
  color: string; 
}) {
  return (
    <div className="bg-white p-6 rounded-lg shadow border">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`${color} p-3 rounded-full text-white`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

