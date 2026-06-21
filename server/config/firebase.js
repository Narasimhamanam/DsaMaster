const admin = require('firebase-admin');

const initFirebase = () => {
  if (!admin.apps.length) {
    const config = {};
    if (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY && !process.env.FIREBASE_PRIVATE_KEY.includes('MOCK_PRIVATE_KEY')) {
      config.credential = admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      });
    } else {
      config.projectId = process.env.FIREBASE_PROJECT_ID;
    }
    admin.initializeApp(config);
    console.log('✅ Firebase Admin initialized');
  }
  return admin;
};

module.exports = { initFirebase, admin };
