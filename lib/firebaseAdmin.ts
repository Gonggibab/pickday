// lib/firebaseAdmin.ts
import admin from "firebase-admin";

// 환경 변수에서 Firebase 서비스 계정 정보 가져오기
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  // privateKey는 .env 파일 등에 저장 시 '\n'이 '\\n'으로 이스케이프될 수 있으므로, 실제 개행 문자로 바꿔줍니다.
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
};

// Firebase 앱이 이미 초기화되지 않았을 경우에만 초기화
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      // Firestore를 주로 사용한다면 databaseURL은 필수는 아닙니다.
      // Realtime Database 사용 시 필요:
      // databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`
    });
    console.log("Firebase Admin SDK initialized successfully.");
  } catch (error: any) {
    // 실제 운영 환경에서는 에러 로깅 시스템(Sentry 등)을 사용하는 것이 좋습니다.
    console.error("Firebase Admin SDK initialization error:", error.stack);
  }
}

// Firestore 인스턴스를 export
export const firestore = admin.firestore();

// admin 객체 전체를 export (FieldValue.serverTimestamp() 등을 사용하기 위해)
export default admin;
