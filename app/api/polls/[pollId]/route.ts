// app/api/polls/[pollId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { firestore } from "@/lib/firebaseAdmin";

interface Params {
  // 이 인터페이스는 context 타입 명시를 위해 유지할 수 있습니다.
  pollId: string;
}

export async function GET(request: NextRequest, context: { params: Params }) {
  let extractedPollId: string | undefined;
  try {
    const url = new URL(request.url);
    const pathSegments = url.pathname.split("/");
    extractedPollId = pathSegments[pathSegments.length - 1]; // /api/polls/[pollId]

    if (!extractedPollId) {
      console.warn(
        "[API GET /api/polls] Poll ID could not be extracted from URL."
      );
      // context.params.pollId를 폴백으로 사용해볼 수 있으나, 경고의 원인이 될 수 있음
      // extractedPollId = context.params.pollId;
      // if (!extractedPollId) {
      return NextResponse.json(
        { error: "투표 ID가 필요합니다." },
        { status: 400 }
      );
      // }
    }

    const pollId = extractedPollId; // 이제 이 pollId를 사용
    console.log(
      `[API GET /api/polls/${pollId}] Fetching poll data for ID: ${pollId}`
    );

    const pollDoc = await firestore.collection("polls").doc(pollId).get();

    if (!pollDoc.exists) {
      console.warn(`[API GET /api/polls/${pollId}] Poll not found.`);
      return NextResponse.json(
        { error: "해당 ID의 투표를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const pollDataFromDB = pollDoc.data();
    if (!pollDataFromDB) {
      console.error(
        `[API GET /api/polls/${pollId}] Poll data is undefined even though document exists.`
      );
      return NextResponse.json(
        { error: "투표 데이터를 찾을 수 없습니다." },
        { status: 500 }
      );
    }

    const pollDataForClient = {
      ...pollDataFromDB,
      createdAt: pollDataFromDB.createdAt?.toDate
        ? pollDataFromDB.createdAt.toDate().toISOString()
        : pollDataFromDB.createdAt,
    };

    return NextResponse.json(
      {
        id: pollDoc.id,
        ...pollDataForClient,
      },
      { status: 200 }
    );
  } catch (error) {
    // 에러 로깅 시 context.params를 사용하려면 동일한 경고 가능성 있음
    const pollIdForErrorLog =
      extractedPollId || context.params?.pollId || "unknown";
    console.error(
      `[API GET /api/polls/${pollIdForErrorLog}] 투표 정보 조회 중 오류 발생:`,
      error
    );
    let errorMessage = "투표 정보를 가져오는데 실패했습니다.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
