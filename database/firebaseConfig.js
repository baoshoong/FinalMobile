const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');



// Khởi tạo Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: `${serviceAccount.project_id}.appspot.com`
  });
}

const db = admin.firestore();
const storage = admin.storage();

module.exports = { admin, db, storage };
