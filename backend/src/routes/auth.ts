import { Router, Request, Response } from 'express';
import { authService } from '../services/auth';
import { auditLogService } from '../services/auditLog';
import { authenticateToken } from '../middleware/auth';
import { UserRole } from '@prisma/client';

const router = Router();

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, role } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required',
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format',
      });
    }

    // Validate role if provided
    if (role && !Object.values(UserRole).includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid role',
        validRoles: Object.values(UserRole),
      });
    }

    // Register user
    const result = await authService.register({
      email,
      password,
      firstName,
      lastName,
      role,
    });

    // Audit log: successful registration
    await auditLogService.logRegistration(
      result.user.id,
      result.user.email,
      result.user.role,
      req
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: result,
    });
  } catch (error) {
    console.error('Registration error:', error);

    // Audit log: failed registration
    if (req.body.email) {
      await auditLogService.logFailedRegistration(
        req.body.email,
        error instanceof Error ? error.message : 'Registration failed',
        req
      );
    }

    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Registration failed',
    });
  }
});

/**
 * POST /api/auth/login
 * Login a user
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required',
      });
    }

    // Login user
    const result = await authService.login({ email, password });

    // Audit log: successful login
    await auditLogService.logLogin(
      result.user.id,
      result.user.email,
      req
    );

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: result,
    });
  } catch (error) {
    console.error('Login error:', error);

    // Audit log: failed login attempt
    if (req.body.email) {
      await auditLogService.logFailedLogin(
        req.body.email,
        error instanceof Error ? error.message : 'Login failed',
        req
      );
    }

    res.status(401).json({
      success: false,
      error: error instanceof Error ? error.message : 'Login failed',
    });
  }
});

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 */
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: 'Refresh token is required',
      });
    }

    // Refresh tokens
    const tokens = await authService.refreshToken(refreshToken);

    // Get user ID from token to log the refresh
    const payload = authService.verifyToken(refreshToken);
    await auditLogService.logTokenRefresh(
      payload.userId,
      payload.email,
      req
    );

    res.status(200).json({
      success: true,
      message: 'Tokens refreshed successfully',
      data: tokens,
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({
      success: false,
      error: error instanceof Error ? error.message : 'Token refresh failed',
    });
  }
});

/**
 * GET /api/auth/me
 * Get current authenticated user
 */
router.get('/me', authenticateToken, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated',
      });
    }

    // Get user details
    const user = await authService.getUserById(req.user.userId);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(404).json({
      success: false,
      error: error instanceof Error ? error.message : 'User not found',
    });
  }
});

/**
 * POST /api/auth/change-password
 * Change user password
 */
router.post(
  '/change-password',
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Not authenticated',
        });
      }

      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          error: 'Current password and new password are required',
        });
      }

      // Update password
      const result = await authService.updatePassword(
        req.user.userId,
        currentPassword,
        newPassword
      );

      // Audit log: successful password change
      await auditLogService.logPasswordChange(
        req.user.userId,
        req.user.email,
        req
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('Change password error:', error);

      // Audit log: failed password change
      if (req.user) {
        await auditLogService.logFailedPasswordChange(
          req.user.userId,
          error instanceof Error ? error.message : 'Password change failed',
          req
        );
      }

      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Password change failed',
      });
    }
  }
);

/**
 * POST /api/auth/logout
 * Logout (client-side token removal, no server action needed)
 */
router.post('/logout', authenticateToken, async (req: Request, res: Response) => {
  // In a JWT-based system, logout is primarily client-side (remove token)
  // Server-side, we log the logout event for audit trail
  if (req.user) {
    await auditLogService.logLogout(
      req.user.userId,
      req.user.email,
      req
    );
  }

  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
});

export default router;
