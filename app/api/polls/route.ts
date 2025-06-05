// app/api/polls/route.ts
import { NextResponse, NextRequest } from "next/server"; // NextRequest 추가
import { firestore } from "@/lib/firebaseAdmin"; //
import admin from "firebase-admin"; //
// import { v4 as uuidv4 } from 'uuid'; // adminKey를 생성하지 않으므로 uuid 제거 가능

// types/index.ts 또는 이 파일 내에 PollCreationRequest 타입 정의
interface PollCreationRequest {
  title: string;
  voteType: "date" | "datetime";
  periodStartDate: string; // ISO 문자열 또는 YYYY-MM-DD
  periodEndDate: string; // ISO 문자열 또는 YYYY-MM-DD
}

// types/index.ts 또는 이 파일 내에 PollOption 타입 정의 (또는 PollOptionFromAPI)
interface PollOptionAPI {
  date: string;
  label: string;
  votes: any[];
  timeSlots?: any[]; // datetime 유형에 사용
}

const generateDateOptions = (
  startDateISO: string,
  endDateISO: string
): PollOptionAPI[] => {
  const options: PollOptionAPI[] = [];
  // Date 객체 생성 시, YYYY-MM-DD 형식이라면 new Date('YYYY-MM-DD')는 UTC 자정을 기준으로 해석될 수 있음.
  // 명확성을 위해 new Date(year, monthIndex, day) 형식을 사용하거나, date-fns와 같은 라이브러리 사용 고려.
  // 여기서는 전달된 ISO 문자열이 Date 생성자에 유효하다고 가정합니다.
  const startDate = new Date(startDateISO.split("T")[0]); // 시간 부분 제거
  const endDate = new Date(endDateISO.split("T")[0]); // 시간 부분 제거
  let currentDate = new Date(startDate);

  // endDate가 startDate보다 이전이 아닌지 확인 (간단한 방어 코드)
  if (endDate < startDate) {
    return options;
  }

  while (currentDate <= endDate) {
    const isoDate = currentDate.toISOString().split("T")[0]; //
    options.push({
      date: isoDate,
      label: new Date(currentDate).toLocaleDateString("ko-KR", {
        // toLocaleDateString은 서버의 로캘에 영향받을 수 있음. 일관성을 위해 date-fns 사용 고려
        year: "numeric", // label은 예시이므로 필요에 따라 조정
        month: "long",
        day: "numeric",
        weekday: "short",
      }),
      votes: [],
    });
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return options;
};

export async function POST(request: NextRequest) {
  // NextRequest 타입 명시
  try {
    const body = (await request.json()) as PollCreationRequest;
    const { title, voteType, periodStartDate, periodEndDate } = body;

    if (!title || !voteType || !periodStartDate || !periodEndDate) {
      return NextResponse.json(
        { error: "필수 항목이 누락되었습니다." },
        { status: 400 }
      ); //
    }

    // 입력된 날짜 유효성 검사 (간단 예시)
    if (new Date(periodEndDate) < new Date(periodStartDate)) {
      return NextResponse.json(
        { error: "종료일은 시작일보다 이전일 수 없습니다." },
        { status: 400 }
      );
    }

    const newPollRef = firestore.collection("polls").doc(); //
    const pollId = newPollRef.id; //

    let options: PollOptionAPI[] = []; //
    if (voteType === "date") {
      options = generateDateOptions(periodStartDate, periodEndDate);
    } else if (voteType === "datetime") {
      // datetime의 경우 timeSlots를 포함한 옵션 생성 로직 필요 (현재 generateDateOptions는 date만 고려)
      // 예시: 각 날짜에 대해 기본 시간 슬롯을 추가하거나, 요청에서 시간 정보를 받아 처리
      options = generateDateOptions(periodStartDate, periodEndDate).map(
        (opt) => ({ ...opt, timeSlots: [] }) // 기본 빈 timeSlots 추가
      );
    }

    const pollDataToSave = {
      title,
      voteType,
      periodStartDate, // 클라이언트에서 받은 문자열 그대로 저장
      periodEndDate, // 클라이언트에서 받은 문자열 그대로 저장
      options,
      createdAt: admin.firestore.FieldValue.serverTimestamp(), //
    };

    await newPollRef.set(pollDataToSave); //

    console.log(`Poll created with ID: ${pollId}`); //

    return NextResponse.json(
      {
        message: "투표가 성공적으로 생성되었습니다.",
        pollId,
        shareableLink: `/vote/${pollId}`, //
      },
      { status: 201 }
    ); //
  } catch (error) {
    console.error("투표 생성 중 오류 발생:", error); //
    let errorMessage = "투표 생성에 실패했습니다.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 }); //
  }
}
