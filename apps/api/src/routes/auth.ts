import express from 'express';
import { auth } from '../config/firebaseAdmin.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Type guard to ensure user exists after authentication
const ensureUser = (req: any): { uid: string; email?: string; displayName?: string; photoURL?: string } => {
  if (!req.user) {
    throw new Error('User not found in request');
  }
  return req.user;
};

// Type assertion for authenticated requests
const assertAuthenticated = (req: any) => req as any;

// Helper function to get user from authenticated request
const getUserFromRequest = (req: any) => {
  const authenticatedReq = assertAuthenticated(req);
  return ensureUser(authenticatedReq);
};

// Type assertion for Express Request with user property
interface AuthenticatedRequest extends Request {
  user: {
    uid: string;
    email?: string;
    displayName?: string;
    photoURL?: string;
  };
}

// Type assertion for Express Request with user property
type AuthenticatedRequestHandler = (
  req: AuthenticatedRequest,
  res: Response
) => void | Promise<void>;

// Helper function to cast request to authenticated request
const castToAuthenticated = (req: Request): AuthenticatedRequest => {
  return req as AuthenticatedRequest;
};

/**
 * GET /api/auth/me
 * Get current user information
 */
router.get('/me', authenticateToken, async (req: Request, res) => {
  try {
    const { uid } = getUserFromRequest(castToAuthenticated(req));
    
    // Get user record from Firebase Auth
    const userRecord = await auth.getUser(uid);
    
    res.json({
      success: true,
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
        photoURL: userRecord.photoURL,
        emailVerified: userRecord.emailVerified,
        disabled: userRecord.disabled,
        metadata: {
          creationTime: userRecord.metadata.creationTime,
          lastSignInTime: userRecord.metadata.lastSignInTime
        }
      }
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user information'
    });
  }
});

/**
 * POST /api/auth/verify
 * Verify Firebase ID token
 */
router.post('/verify', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Token is required'
      });
    }
    
    const decodedToken = await auth.verifyIdToken(token);
    
    res.json({
      success: true,
      user: {
        uid: decodedToken.uid,
        email: decodedToken.email,
        emailVerified: decodedToken.email_verified,
        name: decodedToken.name,
        picture: decodedToken.picture
      }
    });
  } catch (error) {
    console.error('Token verification failed:', error);
    res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }
});

/**
 * POST /api/auth/refresh
 * Refresh user session (optional - Firebase handles this automatically)
 */
router.post('/refresh', authenticateToken, async (req: Request, res) => {
  try {
    const { uid } = getUserFromRequest(castToAuthenticated(req));
    
    // Get fresh user data
    const userRecord = await auth.getUser(uid);
    
    res.json({
      success: true,
      message: 'Session refreshed',
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
        photoURL: userRecord.photoURL
      }
    });
  } catch (error) {
    console.error('Error refreshing session:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to refresh session'
    });
  }
});

/**
 * DELETE /api/auth/logout
 * Logout user (client-side should clear the token)
 */
router.delete('/logout', authenticateToken, async (req: Request, res) => {
  try {
    // Note: Firebase doesn't support server-side logout
    // This endpoint is for logging purposes
    const { uid } = getUserFromRequest(castToAuthenticated(req));
    
    console.log(`User ${uid} logged out`);
    
    res.json({
      success: true,
      message: 'Logout successful (clear token on client)'
    });
  } catch (error) {
    console.error('Error during logout:', error);
    res.status(500).json({
      success: false,
      error: 'Logout failed'
    });
  }
});

/**
 * GET /api/auth/status
 * Check authentication status
 */
router.get('/status', authenticateToken, (req: AuthenticatedRequest, res) => {
  const user = getUserFromRequest(req);
  res.json({
    success: true,
    authenticated: true,
    user: {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName
    }
  });
});

export default router;
