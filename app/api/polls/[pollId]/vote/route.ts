// app/api/polls/[pollId]/vote/route.ts
import { NextRequest, NextResponse } from "next/server"; // NextRequest 임포트
import admin, { firestore } from "@/lib/firebaseAdmin";
import bcrypt from "bcrypt";

interface VoteRequest {
  nickname: string;
  password?: string;
  selectedDates?: string[];
}

interface Params {
  // context 타입 명시를 위해 유지
  pollId: string;
}

export async function POST(request: NextRequest, context: { params: Params }) {
  let extractedPollId: string | undefined;
  try {
    const url = new URL(request.url);
    const pathSegments = url.pathname.split("/"); // ['', 'api', 'polls', 'some-poll-id', 'vote']
    extractedPollId =
      pathSegments.length > 2
        ? pathSegments[pathSegments.length - 2]
        : undefined;

    if (!extractedPollId) {
      console.warn("[API /vote] Poll ID could not be extracted from URL.");
      // extractedPollId = context.params.pollId; // 폴백으로 사용 시 경고 발생 가능성
      // if (!extractedPollId) {
      return NextResponse.json(
        { error: "투표 ID가 필요합니다." },
        { status: 400 }
      );
      // }
    }

    const pollId = extractedPollId; // 이제 이 pollId를 사용
    const body = (await request.json()) as VoteRequest;
    const { nickname, password, selectedDates } = body;

    console.log(`[API /vote] Attempting vote for pollId: ${pollId}`, body);

    const hasValidSelectedDates =
      selectedDates && Array.isArray(selectedDates) && selectedDates.length > 0;

    if (!nickname || !hasValidSelectedDates) {
      // pollId는 URL에서 이미 확인
      console.error(
        "[API /vote] Validation Failed: Missing nickname or selectedDates.",
        { pollId, nickname, selectedDates }
      );
      return NextResponse.json(
        { error: "필수 항목(닉네임, 선택 날짜)이 누락되었습니다." },
        { status: 400 }
      );
    }
    if (!password) {
      console.error("[API /vote] Validation Failed: Missing password.");
      return NextResponse.json(
        { error: "비밀번호가 필요합니다." },
        { status: 400 }
      );
    }

    const pollRef = firestore.collection("polls").doc(pollId);
    // const pollDocSnapshot = await pollRef.get(); // 트랜잭션 내에서 읽을 것이므로 여기서는 제거 가능

    // 참여자 인증
    const participantsRef = pollRef.collection("participants");
    const participantDocRef = participantsRef.doc(nickname);
    const participantDoc = await participantDocRef.get();

    if (!participantDoc.exists) {
      console.error(
        `[API /vote] Participant not registered: ${nickname} for poll ${pollId}`
      );
      return NextResponse.json(
        { error: "등록되지 않은 참여자입니다. 먼저 참여 등록을 해주세요." },
        { status: 403 }
      );
    }

    const participantData = participantDoc.data();
    if (!participantData || !participantData.passwordHash) {
      console.error(
        `[API /vote] Participant data error for nickname: ${nickname}`
      );
      return NextResponse.json(
        { error: "참여자 정보가 올바르지 않습니다." },
        { status: 401 }
      );
    }
    const passwordMatch = await bcrypt.compare(
      password,
      participantData.passwordHash
    );
    if (!passwordMatch) {
      console.error(`[API /vote] Password mismatch for nickname: ${nickname}`);
      return NextResponse.json(
        { error: "비밀번호가 일치하지 않습니다." },
        { status: 401 }
      );
    }

    await firestore.runTransaction(async (transaction) => {
      const currentPollDocInTransaction = await transaction.get(pollRef);
      if (!currentPollDocInTransaction.exists) {
        throw new Error("투표를 찾을 수 없습니다 (Transaction).");
      }
      const currentPollData = currentPollDocInTransaction.data();
      if (!currentPollData || !Array.isArray(currentPollData.options)) {
        throw new Error("투표 옵션 데이터가 올바르지 않습니다 (Transaction).");
      }

      const optionsWithoutOldVotes = currentPollData.options.map(
        (option: any) => ({
          ...option,
          votes: Array.isArray(option.votes)
            ? option.votes.filter(
                (voterNickname: string) => voterNickname !== nickname
              )
            : [],
        })
      );

      const newOptionsWithVote = optionsWithoutOldVotes.map((option: any) => {
        if (selectedDates.includes(option.date)) {
          const updatedVotes = Array.isArray(option.votes)
            ? [...option.votes, nickname]
            : [nickname];
          return { ...option, votes: Array.from(new Set(updatedVotes)) };
        }
        return option;
      });

      transaction.update(pollRef, { options: newOptionsWithVote });

      transaction.update(participantDocRef, {
        selectedDates: selectedDates,
        lastVotedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });

    console.log(
      `[API /vote] Vote successfully recorded/updated for ${nickname} on poll ${pollId}`
    );
    return NextResponse.json(
      { message: "투표가 성공적으로 기록(수정)되었습니다." },
      { status: 200 }
    );
  } catch (error) {
    const pollIdForErrorLog =
      extractedPollId || context.params?.pollId || "unknown";
    console.error(
      `[API /vote] Exception during vote submission (Poll ID: ${pollIdForErrorLog}):`,
      error
    );
    let errorMessage = "투표 제출에 실패했습니다.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
