import admin from "firebase-admin"


const serviceAccount = {
    type: process.env.OFFLINEGAMES_FIREBASE_TYPE,
    project_id: process.env.OFFLINEGAMES_FIREBASE_PROJECT_ID,
    private_key: process.env.OFFLINEGAMES_FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    client_email: process.env.OFFLINEGAMES_FIREBASE_CLIENT_EMAIL
}


admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
}, "offlinegames")


export default admin;