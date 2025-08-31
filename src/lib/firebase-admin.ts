
import * as admin from 'firebase-admin';

let adminApp: admin.app.App;
let adminAuth: admin.auth.Auth;
let adminDb: admin.firestore.Firestore;

try {
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
    : undefined;

  if (serviceAccount) {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }
    adminApp = admin.app();
    adminAuth = admin.auth();
    adminDb = admin.firestore();
  } else {
    console.warn("Firebase Admin SDK not initialized. Missing FIREBASE_SERVICE_ACCOUNT_KEY.");
  }
} catch (error) {
  console.error("Failed to initialize Firebase Admin SDK:", error);
}

// Export the initialized instances, which may be undefined if initialization failed.
// Code using these exports should handle the possibility of them being undefined.
export { adminApp, adminAuth, adminDb };
