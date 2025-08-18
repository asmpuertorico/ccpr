"use client";
import React, { useState, useEffect } from "react";
import { Activity, Cpu, HardDrive, Database, Wifi, AlertTriangle, CheckCircle, Cloud } from "lucide-react";

interface PerformanceMetrics {
  responseTime: number;
  memoryUsage: {
    used: number;
    total: number;
    percentage: number;
  };
  database: {
    status: 'up' | 'down';
    responseTime?: number;
  };
  storage?: {
    status: 'up' | 'down';
    local?: {
      used: number;
      path: string;
    };
    blob?: {
      used: number;
      limit: number;
      percentage: number;
      count: number;
      region: string;
    };
  };
  uptime: number;
  status: 'healthy' | 'degraded' | 'unhealthy';
  lastUpdated: string;
}

export default function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/health');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      setMetrics({
        responseTime: data.responseTime || 0,
        memoryUsage: data.checks.memory || { used: 0, total: 0, percentage: 0 },
        database: data.checks.database || { status: 'down' },
        storage: data.checks.storage || { status: 'down' },
        uptime: data.checks.uptime || 0,
        status: data.status || 'unhealthy',
        lastUpdated: data.timestamp || new Date().toISOString()
      });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    
    // Update metrics every 30 seconds
    const interval = setInterval(fetchMetrics, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'degraded': return 'text-yellow-600 bg-yellow-100';
      case 'unhealthy': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-5 w-5" />;
      case 'degraded': 
      case 'unhealthy': return <AlertTriangle className="h-5 w-5" />;
      default: return <Activity className="h-5 w-5" />;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow border p-6">
        <div className="flex items-center gap-3 mb-4">
          <Activity className="h-6 w-6 text-indigo-600" />
          <h3 className="text-lg font-semibold">System Performance</h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-3">
            <svg className="animate-spin h-6 w-6 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-gray-600">Loading performance metrics...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow border p-6">
        <div className="flex items-center gap-3 mb-4">
          <Activity className="h-6 w-6 text-red-600" />
          <h3 className="text-lg font-semibold">System Performance</h3>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <div>
              <p className="font-medium text-red-800">Monitoring Unavailable</p>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!metrics) return null;

  return (
    <div className="bg-white rounded-lg shadow border p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Activity className="h-6 w-6 text-indigo-600" />
          <h3 className="text-lg font-semibold">System Performance</h3>
        </div>
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(metrics.status)}`}>
          {getStatusIcon(metrics.status)}
          {metrics.status.charAt(0).toUpperCase() + metrics.status.slice(1)}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {/* Response Time */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <Wifi className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-600">Response Time</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {metrics.responseTime.toFixed(0)}ms
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {metrics.responseTime < 100 ? 'Excellent' : 
             metrics.responseTime < 300 ? 'Good' : 
             metrics.responseTime < 1000 ? 'Fair' : 'Poor'}
          </div>
        </div>

        {/* Server Memory */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <Cpu className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-gray-600">Server Memory</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {metrics.memoryUsage.percentage}%
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {metrics.memoryUsage.used}MB / {metrics.memoryUsage.total}MB
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div 
              className={`h-2 rounded-full ${
                metrics.memoryUsage.percentage > 80 ? 'bg-red-500' :
                metrics.memoryUsage.percentage > 60 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(metrics.memoryUsage.percentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Database Status */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <Database className="h-5 w-5 text-purple-600" />
            <span className="text-sm font-medium text-gray-600">Database</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${
              metrics.database.status === 'up' ? 'bg-green-500' : 'bg-red-500'
            }`} />
            <span className="text-sm font-medium">
              {metrics.database.status === 'up' ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          {metrics.database.responseTime && (
            <div className="text-xs text-gray-500 mt-1">
              {metrics.database.responseTime.toFixed(0)}ms response
            </div>
          )}
        </div>

        {/* Blob Storage */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <Cloud className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-600">Blob Storage</span>
          </div>
          <div className="text-lg font-bold text-gray-900">
            {metrics.storage?.blob?.used ? `${metrics.storage.blob.used} MB` : 'N/A'}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {metrics.storage?.blob ? `${metrics.storage.blob.percentage}% of ${metrics.storage.blob.limit}MB used` : 'No data'}
          </div>
          {metrics.storage?.blob && (
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className={`h-2 rounded-full ${
                  metrics.storage.blob.percentage > 80 ? 'bg-red-500' :
                  metrics.storage.blob.percentage > 60 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(metrics.storage.blob.percentage, 100)}%` }}
              />
            </div>
          )}
        </div>

        {/* Uptime */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <HardDrive className="h-5 w-5 text-indigo-600" />
            <span className="text-sm font-medium text-gray-600">Uptime</span>
          </div>
          <div className="text-lg font-bold text-gray-900">
            {formatUptime(metrics.uptime)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            System running
          </div>
        </div>
      </div>

      {/* Detailed Storage Information */}
      {metrics.storage?.blob && (
        <div className="bg-white rounded-lg border p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Cloud className="h-5 w-5 text-blue-600" />
            <h4 className="text-lg font-semibold">Blob Storage Details</h4>
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              {metrics.storage.blob.region} Region
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Storage Usage */}
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="font-medium text-gray-700">Storage Usage</span>
                <span className="text-gray-600">
                  {metrics.storage.blob.used} MB / {metrics.storage.blob.limit} MB
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full ${
                    metrics.storage.blob.percentage > 80 ? 'bg-red-500' :
                    metrics.storage.blob.percentage > 60 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(metrics.storage.blob.percentage, 100)}%` }}
                />
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {metrics.storage.blob.percentage}% used • {(metrics.storage.blob.limit - metrics.storage.blob.used).toFixed(1)} MB remaining
              </div>
            </div>

            {/* File Count */}
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="font-medium text-gray-700">Files Stored</span>
                <span className="text-gray-600">{metrics.storage.blob.count} files</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Average size: {metrics.storage.blob.count > 0 ? (metrics.storage.blob.used / metrics.storage.blob.count).toFixed(2) : '0'} MB per file
              </div>
            </div>
          </div>

          {/* Storage Health Status */}
          <div className="mt-6 flex items-center gap-2 text-sm">
            {metrics.storage.blob.percentage > 80 ? (
              <>
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span className="text-red-700 font-medium">Storage Warning</span>
                <span className="text-gray-500">• Approaching storage limit</span>
              </>
            ) : metrics.storage.blob.percentage > 60 ? (
              <>
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <span className="text-yellow-700 font-medium">Storage Monitoring</span>
                <span className="text-gray-500">• Usage above 60%</span>
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-green-700 font-medium">Storage Healthy</span>
                <span className="text-gray-500">• Usage well within limits</span>
              </>
            )}
          </div>

          {/* Local Storage Info */}
          {metrics.storage.local && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Local Storage (fallback):</span>
                <span className="text-gray-500">{metrics.storage.local.used} MB</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t">
        <div>
          Last updated: {new Date(metrics.lastUpdated).toLocaleTimeString()}
        </div>
        <button
          onClick={fetchMetrics}
          className="text-indigo-600 hover:text-indigo-800 font-medium"
        >
          Refresh
        </button>
      </div>
    </div>
  );
}

