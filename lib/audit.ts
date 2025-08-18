import { db, auditLogs, type NewAuditLog } from './db';
import { getCurrentSession } from './jwt';
import { NextRequest } from 'next/server';

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'RESTORE' | 'LOGIN' | 'LOGOUT';

interface AuditContext {
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  reason?: string;
  metadata?: Record<string, any>;
}

/**
 * Creates an audit log entry
 */
export async function createAuditLog({
  tableName,
  recordId,
  action,
  oldValues,
  newValues,
  changedFields,
  context
}: {
  tableName: string;
  recordId: string;
  action: AuditAction;
  oldValues?: any;
  newValues?: any;
  changedFields?: string[];
  context: AuditContext;
}): Promise<void> {
  try {
    const auditEntry: NewAuditLog = {
      tableName,
      recordId,
      action,
      oldValues: oldValues || null,
      newValues: newValues || null,
      changedFields: changedFields || null,
      userId: context.userId || 'system',
      userAgent: context.userAgent || null,
      ipAddress: context.ipAddress || null,
      reason: context.reason || null,
      metadata: context.metadata || null,
    };

    await db.insert(auditLogs).values(auditEntry);
  } catch (error) {
    console.error('Failed to create audit log:', error);
    // Don't throw - audit logging should not break the main operation
  }
}

/**
 * Gets audit context from request and session
 */
export function getAuditContext(req?: NextRequest): AuditContext {
  const session = getCurrentSession();
  
  return {
    userId: session?.userId || 'anonymous',
    ipAddress: req ? getClientIP(req) : undefined,
    userAgent: req?.headers.get('user-agent') || undefined,
  };
}

/**
 * Extracts client IP from request
 */
function getClientIP(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  const realIP = req.headers.get('x-real-ip');
  return forwarded?.split(',')[0] || realIP || 'unknown';
}

/**
 * Compares two objects and returns changed fields
 */
export function getChangedFields(oldData: any, newData: any): string[] {
  const changes: string[] = [];
  
  if (!oldData || !newData) return changes;
  
  const allKeys = new Set([...Object.keys(oldData), ...Object.keys(newData)]);
  
  for (const key of allKeys) {
    if (oldData[key] !== newData[key]) {
      changes.push(key);
    }
  }
  
  return changes;
}

/**
 * Audit decorator for database operations
 */
export function withAudit<T extends any[], R>(
  tableName: string,
  action: AuditAction,
  getRecordId: (args: T, result?: R) => string,
  getOldValues?: (args: T) => Promise<any> | any,
  getNewValues?: (args: T, result?: R) => any
) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: T): Promise<R> {
      const context = getAuditContext();
      let oldValues: any = null;
      let recordId: string = '';

      try {
        // Get old values before operation (for UPDATE/DELETE)
        if (getOldValues && (action === 'UPDATE' || action === 'DELETE')) {
          oldValues = await getOldValues(args);
        }

        // Execute the original method
        const result: R = await originalMethod.apply(this, args);

        // Get record ID and new values after operation
        recordId = getRecordId(args, result);
        const newValues = getNewValues ? getNewValues(args, result) : null;

        // Determine changed fields for UPDATE operations
        let changedFields: string[] | undefined;
        if (action === 'UPDATE' && oldValues && newValues) {
          changedFields = getChangedFields(oldValues, newValues);
        }

        // Create audit log
        await createAuditLog({
          tableName,
          recordId,
          action,
          oldValues,
          newValues,
          changedFields,
          context
        });

        return result;
      } catch (error) {
        // Log failed operations too
        if (recordId) {
          await createAuditLog({
            tableName,
            recordId,
            action,
            oldValues,
            newValues: null,
            context: {
              ...context,
              metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
            }
          });
        }
        throw error;
      }
    };

    return descriptor;
  };
}

/**
 * Logs authentication events
 */
export async function logAuthEvent(
  action: 'LOGIN' | 'LOGOUT',
  userId: string,
  req?: NextRequest,
  metadata?: Record<string, any>
): Promise<void> {
  const context = {
    userId,
    ipAddress: req ? getClientIP(req) : undefined,
    userAgent: req?.headers.get('user-agent') || undefined,
    metadata
  };

  await createAuditLog({
    tableName: 'auth',
    recordId: userId,
    action,
    context
  });
}

