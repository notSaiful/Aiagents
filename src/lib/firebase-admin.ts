
import * as admin from 'firebase-admin';

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
  : undefined;

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    // You might not need databaseURL if you're only using Auth/Firestore
  });
}

export const adminApp = admin.app();
export const adminAuth = admin.auth();
export const adminDb = admin.firestore();

    