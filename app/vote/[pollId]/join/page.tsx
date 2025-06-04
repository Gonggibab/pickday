// app/vote/[pollId]/join/page.tsx
"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useParams, useRouter } from "next/navigation"; // useSearchParams 제거
import Button from "@/components/Button";
import Input from "@/components/Input";
import { useUIStore } from "@/stores/useUIStore";

interface PollTitleData {
  title?: string;
}
interface ParticipantAuthResponse {
  // API 응답 타입 정의
  success: boolean;
  participant: { nickname: string };
  previousSelectedDates: string[] | null; // YYYY-MM-DD 형식의 배열 또는 null
  error?: string;
}

const JoinVotePage = () => {
  const params = useParams();
  const router = useRouter();
  const showAlert = useUIStore((state) => state.showAlert);
  const pollId = params.pollId as string;

  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [pollTitle, setPollTitle] = useState("투표 참여");

  useEffect(() => {
    // ... (투표 제목 가져오는 로직은 기존과 동일) ...
    if (pollId) {
      fetch(`/api/polls/${pollId}`)
        .then((res) => {
          if (res.ok) return res.json();
          return null;
        })
        .then((data: PollTitleData | null) => {
          if (data && data.title) setPollTitle(data.title);
        })
        .catch((err) => console.error("Failed to fetch poll title:", err));
    }
  }, [pollId]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!nickname.trim() || !password) {
        showAlert(
          "입력 오류",
          "닉네임과 비밀번호를 모두 입력해주세요.",
          "error"
        );
        return;
      }
      setLoading(true);

      try {
        const response = await fetch(`/api/polls/${pollId}/participant-auth`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nickname, password }),
        });
        const result = (await response.json()) as ParticipantAuthResponse; // 타입 적용

        if (!response.ok || !result.success) {
          showAlert(
            "인증 실패",
            result.error || "참여 정보를 확인하거나 등록하는데 실패했습니다.",
            "error"
          );
        } else {
          // 인증 성공 시 nickname과 previousSelectedDates를 localStorage에 저장
          const participantDataToStore = {
            nickname: result.participant.nickname,
            // previousSelectedDates가 null일 경우 빈 배열로 저장
            previousSelectedDates: result.previousSelectedDates || [],
          };
          localStorage.setItem(
            `pickday_participant_data_${pollId}`,
            JSON.stringify(participantDataToStore)
          );

          // 쿼리 파라미터 없이 투표 페이지로 이동
          router.replace(`/vote/${pollId}`);
        }
      } catch (err) {
        console.error("참여 API 호출 오류:", err);
        showAlert(
          "네트워크 오류",
          "요청 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
          "error"
        );
      } finally {
        setLoading(false);
      }
    },
    [pollId, nickname, password, router, showAlert]
  );

  return (
    // ... (JoinVotePage의 JSX는 이전과 동일) ...
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white p-6 sm:p-8 rounded-lg shadow-xl">
        <div className="text-center mb-8">
          <img
            src="/logo-pickday.png"
            alt="PickDay 로고"
            className="w-auto h-10 sm:h-12 mx-auto mb-4"
          />
          <h1
            className="text-xl sm:text-2xl font-bold text-gray-800 truncate px-4"
            title={pollTitle}
          >
            {pollTitle}
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            투표에 참여하려면 닉네임과 비밀번호를 입력하세요.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            id="nickname"
            label="닉네임"
            placeholder="사용할 닉네임"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            disabled={loading}
            required
          />
          <Input
            id="password"
            label="간단 비밀번호"
            type="password"
            placeholder="기억하기 쉬운 비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required
          />
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            disabled={loading || !nickname.trim() || !password}
          >
            {loading ? "처리 중..." : "참여하기 / 내 투표 확인"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default JoinVotePage;
