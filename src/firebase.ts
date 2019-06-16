// Firebase-Admin configuration
import * as admin from 'firebase-admin';
import dotenv from 'dotenv';
dotenv.config();

admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(<string>process.env.FIREBASE_CONFIG)),
  storageBucket: 'puyo-gg.appspot.com',
});

export default {
  db: admin.firestore(),
  bucket: admin.storage().bucket(),
};