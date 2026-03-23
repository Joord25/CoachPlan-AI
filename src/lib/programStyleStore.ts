import { db } from "./firebase";
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import type { ProgramStructure } from "./analyzeProgram";

export interface ProgramStyle extends ProgramStructure {
  id?: string;
  version: number;
  createdAt?: unknown;
  updatedAt?: unknown;
}

// 현재 스타일 저장 (새로 만들기)
export async function saveProgramStyle(userId: string, structure: ProgramStructure): Promise<string> {
  const stylesRef = collection(db, "users", userId, "programStyles");
  const docRef = await addDoc(stylesRef, {
    ...structure,
    version: 1,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return docRef.id;
}

// 스타일 업데이트 (버전 올리기)
export async function updateProgramStyle(
  userId: string,
  styleId: string,
  structure: ProgramStructure
): Promise<number> {
  const styleRef = doc(db, "users", userId, "programStyles", styleId);
  const current = await getDoc(styleRef);
  const newVersion = (current.data()?.version || 0) + 1;

  await setDoc(styleRef, {
    ...structure,
    version: newVersion,
    updatedAt: serverTimestamp(),
  }, { merge: true });

  return newVersion;
}

// 최신 스타일 가져오기
export async function getLatestStyle(userId: string): Promise<ProgramStyle | null> {
  const stylesRef = collection(db, "users", userId, "programStyles");
  const q = query(stylesRef, orderBy("updatedAt", "desc"), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const docSnap = snap.docs[0];
  return { id: docSnap.id, ...docSnap.data() } as ProgramStyle;
}

// 특정 스타일 가져오기
export async function getStyleById(userId: string, styleId: string): Promise<ProgramStyle | null> {
  const docSnap = await getDoc(doc(db, "users", userId, "programStyles", styleId));
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() } as ProgramStyle;
}

// 모든 스타일 목록
export async function getAllStyles(userId: string): Promise<ProgramStyle[]> {
  const stylesRef = collection(db, "users", userId, "programStyles");
  const q = query(stylesRef, orderBy("updatedAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as ProgramStyle);
}
