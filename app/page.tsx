// app/page.tsx
"use client";

import React, { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation"; // useRouter import
import Button from "@/components/Button";
import Input from "@/components/Input"; // Input 컴포넌트 import
import { useUIStore } from "@/stores/useUIStore"; // showAlert 사용을 위해 import

const MainPage = () => {
  const router = useRouter();
  const showAlert = useUIStore((state) => state.showAlert);

  const [showPollIdInput, setShowPollIdInput] = useState(false);
  const [pollLinkInput, setPollLinkInput] = useState(""); // 투표 링크 또는 ID 입력

  const handleJoinPollClick = useCallback(() => {
    setShowPollIdInput(true); // 입력 필드 표시
  }, []);

  const extractPollId = (linkOrId: string): string | null => {
    if (!linkOrId) return null;
    // URL 형태인지 확인 (간단한 체크)
    if (linkOrId.includes("/vote/")) {
      const parts = linkOrId.split("/vote/");
      if (parts.length > 1) {
        // URL 뒤에 다른 경로가 있을 수 있으므로, 첫 번째 세그먼트만 가져옴
        return parts[1].split("/")[0];
      }
    }
    // URL 형태가 아니면 ID 자체로 간주 (간단한 유효성 검사 추가 가능)
    if (linkOrId.match(/^[a-zA-Z0-9-]+$/)) {
      // 예시: pickday-xxxx 또는 그냥 xxxx
      return linkOrId;
    }
    return null; // 유효하지 않은 형식이면 null 반환
  };

  const handleNavigateToPoll = useCallback(() => {
    const trimmedInput = pollLinkInput.trim();
    if (!trimmedInput) {
      showAlert(
        "입력 오류",
        "참여할 투표의 링크 또는 ID를 입력해주세요.",
        "error"
      );
      return;
    }

    const pollId = extractPollId(trimmedInput);

    if (pollId) {
      router.push(`/vote/${pollId}/join`); // /join 페이지로 이동
    } else {
      showAlert(
        "입력 오류",
        "유효한 투표 링크 또는 ID 형식이 아닙니다.",
        "error"
      );
    }
  }, [pollLinkInput, router, showAlert]);

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10">
        {/* 언어 선택 버튼 등 기존 UI 유지 가능 */}
      </div>

      <div className="flex flex-col items-center justify-center min-h-screen pt-20 pb-12 px-4">
        <div className="mb-12 sm:mb-16 text-center">
          <img
            src="/logo-pickday.png"
            alt="PickDay 로고"
            className="w-auto h-12 sm:h-16 mx-auto"
          />
          <p className="text-base sm:text-lg font-semibold text-gray-700 mt-4">
            간편하게 의견을 모아보세요!
          </p>
        </div>

        <div className="space-y-4 sm:space-y-5 w-full max-w-xs sm:max-w-sm">
          <Link
            href="/create"
            className="block w-full"
            aria-label="새 투표 만들기 페이지로 이동"
          >
            <Button variant="primary" size="lg" className="w-full">
              새 투표 만들기
            </Button>
          </Link>

          {/* "투표 참여/확인하기" 버튼 */}
          <Button
            variant="secondary"
            size="lg"
            className="w-full"
            onClick={handleJoinPollClick}
          >
            투표 참여/확인하기
          </Button>

          {/* 투표 ID 입력 필드 (조건부 렌더링) */}
          {showPollIdInput && (
            <div className="mt-6 p-4 bg-white rounded-md shadow-md border border-gray-200 animate-fadeIn">
              {" "}
              {/* 간단한 등장 애니메이션 */}
              <Input
                id="pollLinkInput"
                label="투표 링크 또는 ID 입력"
                placeholder="예: https://.../vote/ID 또는 ID"
                value={pollLinkInput}
                onChange={(e) => setPollLinkInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleNavigateToPoll();
                }} // 엔터키로 제출
              />
              <div className="mt-3 flex space-x-2">
                <Button
                  variant="primary"
                  onClick={handleNavigateToPoll}
                  className="flex-1"
                  disabled={!pollLinkInput.trim()}
                >
                  이동
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowPollIdInput(false);
                    setPollLinkInput("");
                  }}
                  className="flex-1"
                >
                  취소
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MainPage;
