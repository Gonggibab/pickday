// app/api/polls/[pollId]/participant-auth/route.ts
import { NextRequest, NextResponse } from "next/server";
import admin, { firestore } from "@/lib/firebaseAdmin"; ///participant-auth/route.ts]
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10; ///participant-auth/route.ts]

// 요청 본문 타입을 명확히 정의 (types/index.ts로 옮기거나 여기서 사용)
interface ParticipantAuthRequest {
  nickname: string;
  password?: string;
}

export async function POST(
  request: NextRequest,
  { params: paramsPromise }: { params: Promise<{ pollId: string }> }
) {
  let pollIdFromParams: string | undefined;
  try {
    const { pollId } = await paramsPromise; // await 사용
    pollIdFromParams = pollId;

    if (!pollId) {
      console.warn(
        "[API /participant-auth] Poll ID could not be resolved from params promise."
      );
      return NextResponse.json(
        { error: "투표 ID가 필요합니다." },
        { status: 400 }
      ); ///participant-auth/route.ts]
    }

    const body = (await request.json()) as ParticipantAuthRequest; ///participant-auth/route.ts]
    const { nickname, password } = body;

    console.log(
      `[API /participant-auth] Attempting auth for pollId: ${pollId}, nickname: ${nickname}`
    ); ///participant-auth/route.ts]

    if (!nickname || !password) {
      console.warn(
        `[API /participant-auth] Missing nickname or password for pollId: ${pollId}`
      ); ///participant-auth/route.ts]
      return NextResponse.json(
        { error: "필수 항목(닉네임, 비밀번호)이 누락되었습니다." },
        { status: 400 }
      ); ///participant-auth/route.ts]
    }

    const pollRef = firestore.collection("polls").doc(pollId); ///participant-auth/route.ts]
    const pollDoc = await pollRef.get();

    if (!pollDoc.exists) {
      console.warn(`[API /participant-auth] Poll not found: ${pollId}`); ///participant-auth/route.ts]
      return NextResponse.json(
        { error: "해당 ID의 투표를 찾을 수 없습니다." },
        { status: 404 }
      ); ///participant-auth/route.ts]
    }

    const participantsRef = pollRef.collection("participants"); ///participant-auth/route.ts]
    const participantDocRef = participantsRef.doc(nickname); ///participant-auth/route.ts]
    const participantDoc = await participantDocRef.get(); ///participant-auth/route.ts]

    let previousSelectedDates: string[] | null = null;

    if (participantDoc.exists) {
      const participantData = participantDoc.data(); ///participant-auth/route.ts]
      if (!participantData || !participantData.passwordHash) {
        console.error(
          `[API /participant-auth] Participant data error for nickname: ${nickname}, pollId: ${pollId}`
        ); ///participant-auth/route.ts]
        return NextResponse.json(
          { error: "참여자 정보가 올바르지 않습니다." },
          { status: 500 }
        ); ///participant-auth/route.ts]
      }
      const passwordMatch = await bcrypt.compare(
        password,
        participantData.passwordHash
      ); ///participant-auth/route.ts]
      if (!passwordMatch) {
        console.warn(
          `[API /participant-auth] Password mismatch for nickname: ${nickname}, pollId: ${pollId}`
        ); ///participant-auth/route.ts]
        return NextResponse.json(
          { error: "비밀번호가 일치하지 않습니다." },
          { status: 401 }
        ); ///participant-auth/route.ts]
      }
      previousSelectedDates = Array.isArray(participantData.selectedDates)
        ? participantData.selectedDates
        : null; ///participant-auth/route.ts]
    } else {
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS); ///participant-auth/route.ts]
      await participantDocRef.set({
        nickname: nickname,
        passwordHash: hashedPassword,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        selectedDates: [], // 신규 참여자는 빈 배열로 시작
      }); ///participant-auth/route.ts]
      previousSelectedDates = []; // 신규 참여자의 경우 빈 배열 반환/participant-auth/route.ts]
    }

    return NextResponse.json(
      {
        success: true,
        participant: { nickname },
        previousSelectedDates: previousSelectedDates,
      },
      { status: 200 }
    ); ///participant-auth/route.ts]
  } catch (error) {
    const pollIdForErrorLog = pollIdFromParams || "unknown";
    console.error(
      `[API /participant-auth] 참여자 인증 중 오류 발생 (Poll ID: ${pollIdForErrorLog}):`,
      error
    ); ///participant-auth/route.ts]
    let errorMessage = "참여자 인증에 실패했습니다.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
