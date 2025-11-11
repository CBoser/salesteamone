import { db } from './database';
import { Request } from 'express';

/**
 * Audit Log Service
 *
 * Tracks all authentication and authorization events for security monitoring
 * and compliance purposes.
 *
 * Features:
 * - Captures user actions (login, logout, registration, etc.)
 * - Records IP address and user agent for security tracking
 * - Stores before/after changes for audit trail
 * - Handles both successful and failed operations
 */

/**
 * Audit Action Types
 * Enum-like constants for consistent action naming
 */
export const AuditAction = {
  USER_LOGIN: 'USER_LOGIN',
  USER_LOGOUT: 'USER_LOGOUT',
  USER_REGISTER: 'USER_REGISTER',
  PASSWORD_CHANGE: 'PASSWORD_CHANGE',
  PASSWORD_RESET_REQUEST: 'PASSWORD_RESET_REQUEST',
  PASSWORD_RESET_COMPLETE: 'PASSWORD_RESET_COMPLETE',
  ROLE_CHANGE: 'ROLE_CHANGE',
  FAILED_LOGIN: 'FAILED_LOGIN',
  FAILED_REGISTRATION: 'FAILED_REGISTRATION',
  FAILED_PASSWORD_CHANGE: 'FAILED_PASSWORD_CHANGE',
  TOKEN_REFRESH: 'TOKEN_REFRESH',
  ACCOUNT_DISABLED: 'ACCOUNT_DISABLED',
  ACCOUNT_ENABLED: 'ACCOUNT_ENABLED',
} as const;

export type AuditActionType = typeof AuditAction[keyof typeof AuditAction];

/**
 * Audit Log Data Interface
 */
export interface AuditLogData {
  userId?: string;
  action: AuditActionType;
  entityType: string;
  entityId: string;
  changes?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  success?: boolean;
  errorMessage?: string;
  metadata?: Record<string, any>;
}

/**
 * Extract IP address from request
 */
function getIpAddress(req?: Request): string | undefined {
  if (!req) return undefined;

  // Check for proxied requests
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const ips = Array.isArray(forwarded) ? forwarded[0] : forwarded;
    return ips.split(',')[0].trim();
  }

  // Check for real IP header
  const realIp = req.headers['x-real-ip'];
  if (realIp) {
    return Array.isArray(realIp) ? realIp[0] : realIp;
  }

  // Fallback to connection remote address
  return req.ip || req.socket?.remoteAddress;
}

/**
 * Extract user agent from request
 */
function getUserAgent(req?: Request): string | undefined {
  if (!req) return undefined;
  const userAgent = req.headers['user-agent'];
  return Array.isArray(userAgent) ? userAgent[0] : userAgent;
}

class AuditLogService {
  /**
   * Create an audit log entry
   */
  async createAuditLog(data: AuditLogData): Promise<void> {
    try {
      await db.auditLog.create({
        data: {
          userId: data.userId,
          action: data.action,
          entityType: data.entityType,
          entityId: data.entityId,
          changes: data.changes || {},
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
        },
      });

      // Log to console for monitoring (in development)
      if (process.env.NODE_ENV !== 'production') {
        console.log(`📝 [audit]: ${data.action} - User: ${data.userId || 'anonymous'} - IP: ${data.ipAddress || 'unknown'}`);
      }
    } catch (error) {
      // Audit logging should never crash the application
      // Log error but don't throw
      console.error('❌ [audit]: Failed to create audit log:', error);
    }
  }

  /**
   * Log user login (successful)
   */
  async logLogin(userId: string, email: string, req?: Request): Promise<void> {
    await this.createAuditLog({
      userId,
      action: AuditAction.USER_LOGIN,
      entityType: 'User',
      entityId: userId,
      changes: {
        email,
        timestamp: new Date().toISOString(),
        success: true,
      },
      ipAddress: getIpAddress(req),
      userAgent: getUserAgent(req),
    });
  }

  /**
   * Log failed login attempt
   */
  async logFailedLogin(email: string, reason: string, req?: Request): Promise<void> {
    await this.createAuditLog({
      userId: undefined, // No user ID for failed logins
      action: AuditAction.FAILED_LOGIN,
      entityType: 'User',
      entityId: email, // Use email as identifier
      changes: {
        email,
        reason,
        timestamp: new Date().toISOString(),
        success: false,
      },
      ipAddress: getIpAddress(req),
      userAgent: getUserAgent(req),
    });
  }

  /**
   * Log user logout
   */
  async logLogout(userId: string, email: string, req?: Request): Promise<void> {
    await this.createAuditLog({
      userId,
      action: AuditAction.USER_LOGOUT,
      entityType: 'User',
      entityId: userId,
      changes: {
        email,
        timestamp: new Date().toISOString(),
      },
      ipAddress: getIpAddress(req),
      userAgent: getUserAgent(req),
    });
  }

  /**
   * Log user registration
   */
  async logRegistration(userId: string, email: string, role: string, req?: Request): Promise<void> {
    await this.createAuditLog({
      userId,
      action: AuditAction.USER_REGISTER,
      entityType: 'User',
      entityId: userId,
      changes: {
        email,
        role,
        timestamp: new Date().toISOString(),
        success: true,
      },
      ipAddress: getIpAddress(req),
      userAgent: getUserAgent(req),
    });
  }

  /**
   * Log failed registration attempt
   */
  async logFailedRegistration(email: string, reason: string, req?: Request): Promise<void> {
    await this.createAuditLog({
      userId: undefined,
      action: AuditAction.FAILED_REGISTRATION,
      entityType: 'User',
      entityId: email,
      changes: {
        email,
        reason,
        timestamp: new Date().toISOString(),
        success: false,
      },
      ipAddress: getIpAddress(req),
      userAgent: getUserAgent(req),
    });
  }

  /**
   * Log password change
   */
  async logPasswordChange(userId: string, email: string, req?: Request): Promise<void> {
    await this.createAuditLog({
      userId,
      action: AuditAction.PASSWORD_CHANGE,
      entityType: 'User',
      entityId: userId,
      changes: {
        email,
        timestamp: new Date().toISOString(),
        // Never log actual passwords
        message: 'Password changed successfully',
      },
      ipAddress: getIpAddress(req),
      userAgent: getUserAgent(req),
    });
  }

  /**
   * Log failed password change
   */
  async logFailedPasswordChange(userId: string, reason: string, req?: Request): Promise<void> {
    await this.createAuditLog({
      userId,
      action: AuditAction.FAILED_PASSWORD_CHANGE,
      entityType: 'User',
      entityId: userId,
      changes: {
        reason,
        timestamp: new Date().toISOString(),
        success: false,
      },
      ipAddress: getIpAddress(req),
      userAgent: getUserAgent(req),
    });
  }

  /**
   * Log token refresh
   */
  async logTokenRefresh(userId: string, email: string, req?: Request): Promise<void> {
    await this.createAuditLog({
      userId,
      action: AuditAction.TOKEN_REFRESH,
      entityType: 'User',
      entityId: userId,
      changes: {
        email,
        timestamp: new Date().toISOString(),
      },
      ipAddress: getIpAddress(req),
      userAgent: getUserAgent(req),
    });
  }

  /**
   * Query audit logs by user
   */
  async getAuditLogsByUser(userId: string, limit: number = 50) {
    return db.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Query audit logs by action
   */
  async getAuditLogsByAction(action: AuditActionType, limit: number = 50) {
    return db.auditLog.findMany({
      where: { action },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Query recent audit logs
   */
  async getRecentAuditLogs(limit: number = 100) {
    return db.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  /**
   * Query failed login attempts (security monitoring)
   */
  async getFailedLoginAttempts(hours: number = 24, limit: number = 100) {
    const since = new Date();
    since.setHours(since.getHours() - hours);

    return db.auditLog.findMany({
      where: {
        action: AuditAction.FAILED_LOGIN,
        createdAt: {
          gte: since,
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Get audit log statistics
   */
  async getAuditStats(hours: number = 24) {
    const since = new Date();
    since.setHours(since.getHours() - hours);

    const logs = await db.auditLog.findMany({
      where: {
        createdAt: {
          gte: since,
        },
      },
      select: {
        action: true,
      },
    });

    // Count by action type
    const stats: Record<string, number> = {};
    logs.forEach((log: any) => {
      stats[log.action] = (stats[log.action] || 0) + 1;
    });

    return {
      period: `Last ${hours} hours`,
      totalEvents: logs.length,
      byAction: stats,
    };
  }
}

// Export singleton instance
export const auditLogService = new AuditLogService();
export default AuditLogService;
