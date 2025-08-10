import express from 'express';
import { auth } from '../config/firebaseAdmin.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * GET /api/auth/me
 * Get current user information
 */
router.get('/me', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { uid } = req.user;
    
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
router.post('/refresh', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { uid } = req.user;
    
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
router.delete('/logout', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    // Note: Firebase doesn't support server-side logout
    // This endpoint is for logging purposes
    const { uid } = req.user;
    
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
  res.json({
    success: true,
    authenticated: true,
    user: {
      uid: req.user.uid,
      email: req.user.email,
      displayName: req.user.displayName
    }
  });
});

export default router;
