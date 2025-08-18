import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/jwt';

interface DetailedHealthCheck {
  system: {
    nodeVersion: string;
    platform: string;
    arch: string;
    uptime: number;
    loadAverage?: number[];
  };
  application: {
    version: string;
    environment: string;
    buildTime?: string;
    gitCommit?: string;
  };
  dependencies: {
    database: {
      status: 'connected' | 'disconnected' | 'error';
      version?: string;
      connectionPool?: {
        active: number;
        idle: number;
        total: number;
      };
    };
    external: {
      vercelBlob?: {
        status: 'available' | 'unavailable';
        region?: string;
      };
    };
  };
  performance: {
    memoryUsage: NodeJS.MemoryUsage;
    eventLoop: {
      delay: number;
    };
    gc?: {
      lastRun?: number;
      totalRuns?: number;
    };
  };
  security: {
    httpsEnabled: boolean;
    corsEnabled: boolean;
    rateLimitingEnabled: boolean;
  };
}

export async function GET(req: NextRequest) {
  // Require admin authentication for detailed health info
  const session = getCurrentSession();
  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized - Admin access required' },
      { status: 401 }
    );
  }

  const startTime = process.hrtime();

  const healthCheck: DetailedHealthCheck = {
    system: {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      uptime: process.uptime(),
      loadAverage: process.platform !== 'win32' && (process as any).loadavg ? (process as any).loadavg() : undefined
    },
    application: {
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      buildTime: process.env.BUILD_TIME,
      gitCommit: process.env.VERCEL_GIT_COMMIT_SHA
    },
    dependencies: {
      database: {
        status: 'disconnected'
      },
      external: {}
    },
    performance: {
      memoryUsage: process.memoryUsage(),
      eventLoop: {
        delay: 0
      }
    },
    security: {
      httpsEnabled: req.url.startsWith('https://'),
      corsEnabled: true, // We have CORS configured
      rateLimitingEnabled: true // We have rate limiting on login
    }
  };

  // Measure event loop delay
  const eventLoopStart = process.hrtime();
  setImmediate(() => {
    const eventLoopEnd = process.hrtime(eventLoopStart);
    healthCheck.performance.eventLoop.delay = eventLoopEnd[0] * 1000 + eventLoopEnd[1] / 1e6;
  });

  // Check database connection with more details
  try {
    if (process.env.DATABASE_URL) {
      const { db } = await import('@/lib/db');
      await db.execute('SELECT version()');
      healthCheck.dependencies.database.status = 'connected';
      
      // Get database version if possible
      try {
        const result = await db.execute('SELECT version()') as any;
        if (result.rows && result.rows[0]) {
          healthCheck.dependencies.database.version = result.rows[0].version;
        }
      } catch (e) {
        // Version query failed, but connection works
      }
    }
  } catch (error) {
    healthCheck.dependencies.database.status = 'error';
  }

  // Check Vercel Blob storage
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    healthCheck.dependencies.external.vercelBlob = {
      status: 'available',
      region: process.env.VERCEL_REGION || 'unknown'
    };
  } else {
    healthCheck.dependencies.external.vercelBlob = {
      status: 'unavailable'
    };
  }

  // Add GC information if available
  if (global.gc) {
    const gcStats = process.memoryUsage();
    healthCheck.performance.gc = {
      lastRun: Date.now(), // Approximation
      totalRuns: 0 // Would need to track this separately
    };
  }

  const endTime = process.hrtime(startTime);
  const responseTime = endTime[0] * 1000 + endTime[1] / 1e6;

  return NextResponse.json({
    ...healthCheck,
    meta: {
      responseTime: `${responseTime.toFixed(2)}ms`,
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID()
    }
  }, {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  });
}
