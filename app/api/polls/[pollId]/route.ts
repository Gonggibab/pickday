// app/api/polls/[pollId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { firestore } from "@/lib/firebaseAdmin"; ///route.ts]

export async function GET(
  request: NextRequest,
  { params: paramsPromise }: { params: Promise<{ pollId: string }> }
) {
  let pollIdFromParams: string | undefined;
  try {
    const { pollId } = await paramsPromise; // await 사용
    pollIdFromParams = pollId;

    if (!pollId) {
      console.warn(
        "[API GET /api/polls] Poll ID is missing from params promise."
      );
      return NextResponse.json(
        { error: "투표 ID가 필요합니다." },
        { status: 400 }
      );
    }

    console.log(
      `[API GET /api/polls/${pollId}] Fetching poll data for ID: ${pollId}`
    ); ///route.ts]

    const pollDoc = await firestore.collection("polls").doc(pollId).get(); ///route.ts]

    if (!pollDoc.exists) {
      console.warn(`[API GET /api/polls/${pollId}] Poll not found.`); ///route.ts]
      return NextResponse.json(
        { error: "해당 ID의 투표를 찾을 수 없습니다." },
        { status: 404 }
      ); ///route.ts]
    }

    const pollDataFromDB = pollDoc.data(); ///route.ts]
    if (!pollDataFromDB) {
      console.error(
        `[API GET /api/polls/${pollId}] Poll data is undefined even though document exists.`
      ); ///route.ts]
      return NextResponse.json(
        { error: "투표 데이터를 찾을 수 없습니다." },
        { status: 500 }
      ); ///route.ts]
    }

    // Firestore 타임스탬프를 ISO 문자열로 변환
    const pollDataForClient = {
      ...pollDataFromDB,
      createdAt: pollDataFromDB.createdAt?.toDate
        ? pollDataFromDB.createdAt.toDate().toISOString()
        : pollDataFromDB.createdAt,
      // periodStartDate와 periodEndDate도 Date 객체라면 toISOString()으로 변환 필요할 수 있음
      // (현재는 문자열로 저장되는 것으로 보임)
    };

    return NextResponse.json(
      {
        id: pollDoc.id,
        ...pollDataForClient,
      },
      { status: 200 }
    ); ///route.ts]
  } catch (error) {
    const pollIdForErrorLog = pollIdFromParams || "unknown";
    console.error(
      `[API GET /api/polls/${pollIdForErrorLog}] 투표 정보 조회 중 오류 발생:`,
      error
    ); ///route.ts]
    let errorMessage = "투표 정보를 가져오는데 실패했습니다.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
