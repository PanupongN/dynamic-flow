import admin from 'firebase-admin';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs-extra';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Firebase Admin configuration
const serviceAccountPath = join(__dirname, '../../firebase-service-account.json');

let app: admin.app.App | undefined;

try {
  // Check if Firebase Admin is already initialized
  if (admin.apps.length === 0) {
    // Try to use service account file if it exists
    try {
      if (await fs.pathExists(serviceAccountPath)) {
        const serviceAccountData = await fs.readJson(serviceAccountPath);
        
        // Validate service account data
        if (!serviceAccountData.project_id) {
          throw new Error('Service account file is missing project_id');
        }
        
        app = admin.initializeApp({
          credential: admin.credential.cert(serviceAccountData),
          databaseURL: process.env.FIREBASE_DATABASE_URL
        });
        console.log('✅ Firebase Admin initialized with service account');
      } else {
        throw new Error('Service account file not found');
      }
    } catch (error: any) {
      console.warn('⚠️ Service account file error, trying environment variables:', error.message);
      
      // Fallback to environment variables
      const projectId = process.env.FIREBASE_PROJECT_ID;
      const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
      const privateKey = process.env.FIREBASE_PRIVATE_KEY;
      
      if (!projectId || !clientEmail || !privateKey) {
        throw new Error('Missing required Firebase environment variables: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY');
      }
      
      app = admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey: privateKey.replace(/\\n/g, '\n')
        }),
        databaseURL: process.env.FIREBASE_DATABASE_URL
      });
      console.log('✅ Firebase Admin initialized with environment variables');
    }
  } else {
    app = admin.app();
    console.log('✅ Firebase Admin already initialized');
  }
} catch (error: any) {
  console.error('❌ Failed to initialize Firebase Admin:', error);
  
  // For development, continue without Firebase Admin
  if (process.env.NODE_ENV === 'development') {
    console.warn('⚠️ Continuing without Firebase Admin in development mode');
    // Create a mock app to prevent crashes
    try {
      app = admin.initializeApp({
        projectId: 'mock-project',
        credential: admin.credential.applicationDefault()
      });
    } catch (mockError) {
      console.error('❌ Failed to create mock Firebase app:', mockError);
    }
  } else {
    throw error;
  }
}

// Ensure app is defined before exporting
if (!app) {
  throw new Error('Firebase Admin app could not be initialized');
}

export const auth = admin.auth(app);
export const firestore = admin.firestore(app);
export default app;
