// app/api/polls/route.ts
import { NextResponse } from "next/server";
import { firestore } from "@/lib/firebaseAdmin";
import admin from "firebase-admin";
// import { v4 as uuidv4 } from 'uuid'; // adminKey를 생성하지 않으므로 uuid 제거 가능

interface PollCreationRequest {
  title: string;
  voteType: "date" | "datetime";
  periodStartDate: string;
  periodEndDate: string;
}

const generateDateOptions = (startDateISO: string, endDateISO: string) => {
  // ... (이전과 동일)
  const options: Array<{ date: string; label: string; votes: any[] }> = [];
  const startDate = new Date(startDateISO);
  const endDate = new Date(endDateISO);
  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const isoDate = currentDate.toISOString().split("T")[0];
    options.push({
      date: isoDate,
      label: new Date(currentDate).toLocaleDateString("ko-KR", {
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

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as PollCreationRequest;
    const { title, voteType, periodStartDate, periodEndDate } = body;

    if (!title || !voteType || !periodStartDate || !periodEndDate) {
      return NextResponse.json(
        { error: "필수 항목이 누락되었습니다." },
        { status: 400 }
      );
    }

    const newPollRef = firestore.collection("polls").doc();
    const pollId = newPollRef.id;
    // const adminKey = uuidv4(); // adminKey 생성 제거

    let options: Array<any> = [];
    if (voteType === "date") {
      options = generateDateOptions(periodStartDate, periodEndDate);
    } else if (voteType === "datetime") {
      options = generateDateOptions(periodStartDate, periodEndDate).map(
        (opt) => ({ ...opt, timeSlots: [] })
      );
    }

    const pollDataToSave = {
      title,
      voteType,
      periodStartDate,
      periodEndDate,
      options,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      // adminKey: adminKey, // adminKey 저장 제거
    };

    await newPollRef.set(pollDataToSave);

    console.log(`Poll created with ID: ${pollId}`);

    return NextResponse.json(
      {
        message: "투표가 성공적으로 생성되었습니다.",
        pollId,
        // adminKey: adminKey, // adminKey 반환 제거
        shareableLink: `/vote/${pollId}`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("투표 생성 중 오류 발생:", error);
    let errorMessage = "투표 생성에 실패했습니다.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
