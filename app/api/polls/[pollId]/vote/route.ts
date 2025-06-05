// app/api/polls/[pollId]/vote/route.ts
import { NextRequest, NextResponse } from "next/server";
import admin, { firestore } from "@/lib/firebaseAdmin"; ///vote/route.ts]
import bcrypt from "bcrypt";

// types/index.ts 또는 이 파일 내에 VoteRequest 타입 정의
interface VoteRequest {
  nickname: string;
  password?: string;
  selectedDates?: string[]; // YYYY-MM-DD 형식
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
        "[API /vote] Poll ID could not be resolved from params promise."
      );
      return NextResponse.json(
        { error: "투표 ID가 필요합니다." },
        { status: 400 }
      );
    }

    const body = (await request.json()) as VoteRequest;
    const { nickname, password, selectedDates } = body;

    console.log(`[API /vote] Attempting vote for pollId: ${pollId}`, body);

    const hasValidSelectedDates =
      selectedDates && Array.isArray(selectedDates) && selectedDates.length > 0;

    if (!nickname || !hasValidSelectedDates) {
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

    const pollRef = firestore.collection("polls").doc(pollId); ///vote/route.ts]
    const participantsRef = pollRef.collection("participants"); ///vote/route.ts]
    const participantDocRef = participantsRef.doc(nickname); ///vote/route.ts]
    const participantDoc = await participantDocRef.get(); ///vote/route.ts]

    if (!participantDoc.exists) {
      console.error(
        `[API /vote] Participant not registered: ${nickname} for poll ${pollId}`
      ); ///vote/route.ts]
      return NextResponse.json(
        { error: "등록되지 않은 참여자입니다. 먼저 참여 등록을 해주세요." },
        { status: 403 }
      ); ///vote/route.ts]
    }

    const participantData = participantDoc.data(); ///vote/route.ts]
    if (!participantData || !participantData.passwordHash) {
      console.error(
        `[API /vote] Participant data error for nickname: ${nickname}`
      ); ///vote/route.ts]
      return NextResponse.json(
        { error: "참여자 정보가 올바르지 않습니다." },
        { status: 401 }
      ); ///vote/route.ts]
    }

    const passwordMatch = await bcrypt.compare(
      password,
      participantData.passwordHash
    ); ///vote/route.ts]
    if (!passwordMatch) {
      console.error(`[API /vote] Password mismatch for nickname: ${nickname}`); ///vote/route.ts]
      return NextResponse.json(
        { error: "비밀번호가 일치하지 않습니다." },
        { status: 401 }
      ); ///vote/route.ts]
    }

    await firestore.runTransaction(async (transaction) => {
      const currentPollDocInTransaction = await transaction.get(pollRef); ///vote/route.ts]
      if (!currentPollDocInTransaction.exists) {
        throw new Error("투표를 찾을 수 없습니다 (Transaction).");
      }
      const currentPollData = currentPollDocInTransaction.data(); ///vote/route.ts]
      if (!currentPollData || !Array.isArray(currentPollData.options)) {
        throw new Error("투표 옵션 데이터가 올바르지 않습니다 (Transaction).");
      }

      const optionsWithoutOldVotes = currentPollData.options.map(
        (option: any) => ({
          // TODO: PollOption 타입 사용 고려
          ...option,
          votes: Array.isArray(option.votes)
            ? option.votes.filter(
                (voterNickname: string) => voterNickname !== nickname
              )
            : [],
        })
      ); ///vote/route.ts]

      const newOptionsWithVote = optionsWithoutOldVotes.map((option: any) => {
        // TODO: PollOption 타입 사용 고려
        if (selectedDates!.includes(option.date)) {
          const updatedVotes = Array.isArray(option.votes)
            ? [...option.votes, nickname]
            : [nickname];
          return { ...option, votes: Array.from(new Set(updatedVotes)) };
        }
        return option;
      }); ///vote/route.ts]

      transaction.update(pollRef, { options: newOptionsWithVote }); ///vote/route.ts]

      transaction.update(participantDocRef, {
        selectedDates: selectedDates, // YYYY-MM-DD 형식으로 저장
        lastVotedAt: admin.firestore.FieldValue.serverTimestamp(),
      }); ///vote/route.ts]
    });

    console.log(
      `[API /vote] Vote successfully recorded/updated for ${nickname} on poll ${pollId}`
    ); ///vote/route.ts]
    return NextResponse.json(
      { message: "투표가 성공적으로 기록(수정)되었습니다." },
      { status: 200 }
    ); ///vote/route.ts]
  } catch (error) {
    const pollIdForErrorLog = pollIdFromParams || "unknown";
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
