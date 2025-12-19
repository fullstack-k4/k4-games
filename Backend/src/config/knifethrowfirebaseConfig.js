import admin from "firebase-admin"


const serviceAccount = {
    type: process.env.KNIFETHROW_FIREBASE_TYPE,
    project_id: process.env.KNIFETHROW_FIREBASE_PROJECT_ID,
    private_key: process.env.KNIFETHROW_FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    client_email: process.env.KNIFETHROW_FIREBASE_CLIENT_EMAIL
};





admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
},"knifethrow");



export default admin;