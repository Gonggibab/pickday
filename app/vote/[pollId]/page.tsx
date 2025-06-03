// app/vote/[pollId]/page.tsx
"use client";

import { useParams, useRouter } from "next/navigation";
import React from "react";
// import { useTranslation } from 'react-i18next'; // 제거
import Button from "@/components/Button";

const VotePage = () => {
  const params = useParams();
  const router = useRouter();
  const { pollId } = params;
  // const { t } = useTranslation(); // 제거

  return (
    <div className="min-h-screen bg-gray-50 py-8 sm:py-12 flex flex-col items-center px-4">
      <div className="w-full max-w-2xl bg-white p-6 sm:p-8 rounded-lg shadow-xl">
        <Button
          onClick={() => router.push("/")}
          variant="ghost"
          size="sm"
          className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10 mb-4"
        >
          &larr; 메인으로
        </Button>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center pt-10 sm:pt-8">
          투표 참여하기
        </h1>
        <p className="text-center text-gray-600 mb-2">
          투표 ID:{" "}
          {typeof pollId === "string" ? pollId : JSON.stringify(pollId)}
        </p>
        <p className="text-center text-sm text-gray-500 mb-8">
          투표에 참여하여 의견을 공유해주세요!
        </p>

        <div className="text-center text-gray-700 border-t pt-8 mt-8">
          <p className="text-lg font-semibold mb-4">
            투표 참여 UI가 여기에 표시됩니다.
          </p>
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-700">
              현재 이 페이지는 기본 틀만 구성되어 있으며, 실제 투표 기능은 아직
              구현되지 않았습니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VotePage;
