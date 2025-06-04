// app/api/polls/[pollId]/participant-auth/route.ts
import { NextRequest, NextResponse } from "next/server"; // NextRequest 임포트
import admin, { firestore } from "@/lib/firebaseAdmin";
import bcrypt from "bcrypt";

interface AuthRequest {
  nickname: string;
  password?: string;
}

interface Params {
  // context 타입 명시를 위해 유지
  pollId: string;
}

const SALT_ROUNDS = 10;

export async function POST(request: NextRequest, context: { params: Params }) {
  let extractedPollId: string | undefined;
  try {
    const url = new URL(request.url);
    const pathSegments = url.pathname.split("/"); // ['', 'api', 'polls', 'some-poll-id', 'participant-auth']
    extractedPollId =
      pathSegments.length > 2
        ? pathSegments[pathSegments.length - 2]
        : undefined;

    if (!extractedPollId) {
      console.warn(
        "[API /participant-auth] Poll ID could not be extracted from URL."
      );
      // extractedPollId = context.params.pollId; // 폴백으로 사용 시 경고 발생 가능성
      // if (!extractedPollId) {
      return NextResponse.json(
        { error: "투표 ID가 필요합니다." },
        { status: 400 }
      );
      // }
    }

    const pollId = extractedPollId; // 이제 이 pollId를 사용
    const body = (await request.json()) as AuthRequest;
    const { nickname, password } = body;

    console.log(
      `[API /participant-auth] Attempting auth for pollId: ${pollId}, nickname: ${nickname}`
    );

    if (!nickname || !password) {
      console.warn(
        `[API /participant-auth] Missing nickname or password for pollId: ${pollId}`
      );
      return NextResponse.json(
        { error: "필수 항목(닉네임, 비밀번호)이 누락되었습니다." },
        { status: 400 }
      );
    }

    const pollRef = firestore.collection("polls").doc(pollId);
    const pollDoc = await pollRef.get();

    if (!pollDoc.exists) {
      console.warn(`[API /participant-auth] Poll not found: ${pollId}`);
      return NextResponse.json(
        { error: "해당 ID의 투표를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const participantsRef = pollRef.collection("participants");
    const participantDocRef = participantsRef.doc(nickname);
    const participantDoc = await participantDocRef.get();

    let previousSelectedDates: string[] | null = null;

    if (participantDoc.exists) {
      const participantData = participantDoc.data();
      if (!participantData || !participantData.passwordHash) {
        console.error(
          `[API /participant-auth] Participant data error for nickname: ${nickname}, pollId: ${pollId}`
        );
        return NextResponse.json(
          { error: "참여자 정보가 올바르지 않습니다." },
          { status: 500 }
        );
      }
      const passwordMatch = await bcrypt.compare(
        password,
        participantData.passwordHash
      );
      if (!passwordMatch) {
        console.warn(
          `[API /participant-auth] Password mismatch for nickname: ${nickname}, pollId: ${pollId}`
        );
        return NextResponse.json(
          { error: "비밀번호가 일치하지 않습니다." },
          { status: 401 }
        );
      }
      previousSelectedDates = Array.isArray(participantData.selectedDates)
        ? participantData.selectedDates
        : null;
      console.log(
        `[API /participant-auth] Participant ${nickname} authenticated for poll ${pollId}. Previous selected dates:`,
        previousSelectedDates
      );
    } else {
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
      await participantDocRef.set({
        nickname: nickname,
        passwordHash: hashedPassword,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        selectedDates: [],
      });
      console.log(
        `[API /participant-auth] Participant ${nickname} registered for poll ${pollId}.`
      );
      previousSelectedDates = [];
    }

    return NextResponse.json(
      {
        success: true,
        participant: { nickname },
        previousSelectedDates: previousSelectedDates,
      },
      { status: 200 }
    );
  } catch (error) {
    const pollIdForErrorLog =
      extractedPollId || context.params?.pollId || "unknown";
    console.error(
      `[API /participant-auth] 참여자 인증 중 오류 발생 (Poll ID: ${pollIdForErrorLog}):`,
      error
    );
    let errorMessage = "참여자 인증에 실패했습니다.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
