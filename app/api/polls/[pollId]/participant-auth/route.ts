// app/api/polls/[pollId]/participant-auth/route.ts
import { NextRequest, NextResponse } from "next/server";
import admin, { firestore } from "@/lib/firebaseAdmin";
import bcrypt from "bcrypt";

interface AuthRequest {
  nickname: string;
  password?: string;
}

// 이 Params 인터페이스는 context.params의 구조를 나타냅니다.
interface RouteParams {
  pollId: string;
}

const SALT_ROUNDS = 10;

export async function POST(
  request: NextRequest,
  { params }: { params: RouteParams } // context 객체에서 params를 직접 구조 분해하고 타입 지정
) {
  let extractedPollId: string | undefined; // URL 파싱용 변수는 유지 가능
  try {
    const pollId = params.pollId; // context에서 직접 구조 분해한 params 사용

    // URL에서 추출하는 로직은 폴백 또는 추가 검증용으로 남겨둘 수 있으나,
    // params.pollId가 우선적으로 사용되어야 합니다.
    // const url = new URL(request.url);
    // const pathSegments = url.pathname.split('/');
    // extractedPollId = pathSegments.length > 2 ? pathSegments[pathSegments.length - 2] : undefined;
    // if (!pollId && extractedPollId) pollId = extractedPollId; // 폴백

    if (!pollId) {
      console.warn("[API /participant-auth] Poll ID is missing.");
      return NextResponse.json(
        { error: "투표 ID가 필요합니다." },
        { status: 400 }
      );
    }

    const body = (await request.json()) as AuthRequest;
    const { nickname, password } = body;

    console.log(
      `[API /participant-auth] Attempting auth for pollId: ${pollId}, nickname: ${nickname}`
    );

    // ... (나머지 로직은 이전과 동일하게 pollId 사용) ...
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
    } else {
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
      await participantDocRef.set({
        nickname: nickname,
        passwordHash: hashedPassword,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        selectedDates: [],
      });
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
    // params가 구조 분해 할당되었으므로, catch 블록에서는 직접 참조 불가 (필요시 try 블록 상단에서 pollId 변수에 할당하여 사용)
    // const pollIdForErrorLog = params?.pollId || extractedPollId || 'unknown';
    console.error(`[API /participant-auth] 참여자 인증 중 오류 발생:`, error); // Poll ID 로깅은 위에서 이미 처리됨
    let errorMessage = "참여자 인증에 실패했습니다.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
