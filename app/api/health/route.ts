import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface HealthCheck {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  version: string;
  environment: string;
  checks: {
    database: {
      status: 'up' | 'down';
      responseTime?: number;
      error?: string;
    };
    storage: {
      status: 'up' | 'down';
      error?: string;
      local?: {
        used: number;
        path: string;
      };
      blob?: {
        used: number;
        limit: number;
        percentage: number;
      };
    };
    memory: {
      used: number;
      total: number;
      percentage: number;
    };
    uptime: number;
  };
}

export async function GET() {
  const startTime = Date.now();
  const healthCheck: HealthCheck = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    checks: {
      database: { status: 'down' },
      storage: { status: 'down' },
      memory: { used: 0, total: 0, percentage: 0 },
      uptime: process.uptime()
    }
  };

  // Check database connection
  try {
    const dbStart = Date.now();
    
    // Simple query to test database connectivity
    if (process.env.DATABASE_URL) {
      await db.execute('SELECT 1');
      healthCheck.checks.database = {
        status: 'up',
        responseTime: Date.now() - dbStart
      };
    } else {
      healthCheck.checks.database = {
        status: 'down',
        error: 'No database URL configured'
      };
    }
  } catch (error) {
    healthCheck.checks.database = {
      status: 'down',
      error: error instanceof Error ? error.message : 'Database connection failed'
    };
    healthCheck.status = 'degraded';
  }

  // Check storage (file system + Vercel Blob)
  try {
    const fs = await import('fs/promises');
    const path = await import('path');
    
    const uploadDir = path.join(process.cwd(), 'public', 'images', 'events');
    await fs.access(uploadDir);
    
    // Get local directory size
    const getDirectorySize = async (directory: string): Promise<number> => {
      let totalSize = 0;
      try {
        const files = await fs.readdir(directory, { withFileTypes: true });
        for (const file of files) {
          const filePath = path.join(directory, file.name);
          if (file.isFile()) {
            const stats = await fs.stat(filePath);
            totalSize += stats.size;
          } else if (file.isDirectory()) {
            totalSize += await getDirectorySize(filePath);
          }
        }
      } catch (error) {
        // Directory might not exist or be accessible
      }
      return totalSize;
    };

    const localStorageSize = await getDirectorySize(uploadDir);
    
    // Get Vercel Blob usage
    let blobUsage = {
      used: 0,
      limit: 1000, // 1 GB limit for your plan
      percentage: 0,
      count: 0,
      region: 'IAD1'
    };

    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const { list } = await import('@vercel/blob');
        const blobs = await list({
          token: process.env.BLOB_READ_WRITE_TOKEN,
        });
        
        const totalSizeBytes = blobs.blobs.reduce((acc, blob) => acc + blob.size, 0);
        const totalSizeMB = totalSizeBytes / (1024 * 1024);
        
        blobUsage = {
          used: Math.round(totalSizeMB * 100) / 100, // Round to 2 decimal places
          limit: 1000,
          percentage: Math.round((totalSizeMB / 1000) * 100),
          count: blobs.blobs.length,
          region: 'IAD1'
        };
      } catch (error) {
        console.error('Failed to fetch blob usage:', error);
        // Keep default values if fetch fails
      }
    }

    healthCheck.checks.storage = { 
      status: 'up',
      local: {
        used: Math.round(localStorageSize / 1024 / 1024), // MB
        path: uploadDir
      },
      blob: blobUsage
    };
  } catch (error) {
    healthCheck.checks.storage = {
      status: 'down',
      error: error instanceof Error ? error.message : 'Storage check failed'
    };
    healthCheck.status = 'degraded';
  }

  // Memory usage
  if (typeof process !== 'undefined' && process.memoryUsage) {
    const memUsage = process.memoryUsage();
    const totalMemory = memUsage.heapTotal + memUsage.external;
    const usedMemory = memUsage.heapUsed;
    
    healthCheck.checks.memory = {
      used: Math.round(usedMemory / 1024 / 1024), // MB
      total: Math.round(totalMemory / 1024 / 1024), // MB
      percentage: Math.round((usedMemory / totalMemory) * 100)
    };

    // Mark as unhealthy if memory usage is too high
    if (healthCheck.checks.memory.percentage > 90) {
      healthCheck.status = 'unhealthy';
    }
  }

  // Overall status determination
  if (healthCheck.checks.database.status === 'down') {
    healthCheck.status = 'unhealthy';
  }

  const responseTime = Date.now() - startTime;
  const statusCode = healthCheck.status === 'healthy' ? 200 : 
                    healthCheck.status === 'degraded' ? 200 : 503;

  return NextResponse.json({
    ...healthCheck,
    responseTime
  }, { 
    status: statusCode,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  });
}

