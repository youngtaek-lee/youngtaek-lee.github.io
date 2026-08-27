// Firebase 콘솔 > 프로젝트 설정 > 일반 > "앱 추가"(웹)에서 나오는 값으로 아래를 교체하세요.
// 이 값들은 공개돼도 안전한 "공개 웹 앱 config"입니다 — 실제 접근 제어는
// Firestore/Storage 보안 규칙(request.auth != null)이 담당합니다.
const firebaseConfig = {
  apiKey: 'AIzaSyB5u0th5l3WVJ9fANFjLzYvjpTXXytLy9o',
  authDomain: 'home-inventory-f7bae.firebaseapp.com',
  projectId: 'home-inventory-f7bae',
  storageBucket: 'home-inventory-f7bae.firebasestorage.app',
  messagingSenderId: '192286504732',
  appId: '1:192286504732:web:e61575c8bc176e2b356cd9',
};

// 로그인 화면엔 PIN만 보이지만, 내부적으로는 이 고정 이메일 + 입력받은 PIN으로
// Firebase Authentication(이메일/비밀번호)에 로그인합니다.
// Firebase 콘솔 > Authentication > Users에서 이 이메일로 계정을 하나 만들어 두세요.
export const FAMILY_LOGIN_EMAIL = 'family@home-inventory.local';

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
// 사진은 Firebase Storage 대신 Firestore 문서 안에 base64로 직접 저장한다
// (Storage는 Blaze 유료 플랜 업그레이드가 필요해서 제외함)
