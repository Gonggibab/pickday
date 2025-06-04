// app/vote/[pollId]/page.tsx
"use client";

import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState, useCallback } from "react";
import Button from "@/components/Button";
import CalendarPicker from "@/components/CalendarPicker";
import Input from "@/components/Input";
import { useUIStore } from "@/stores/useUIStore";

// API 응답 및 페이지 내부에서 사용할 데이터 타입 정의
interface VoteOption {
  date: string; // YYYY-MM-DD
  label: string;
  votes: string[];
  timeSlots?: Array<{ time: string; votes: string[] }>;
}
interface PollDataFromAPI {
  id: string;
  title: string;
  voteType: "date" | "datetime";
  periodStartDate: string; // API에서는 ISO 문자열 또는 YYYY-MM-DD로 받음
  periodEndDate: string; // API에서는 ISO 문자열 또는 YYYY-MM-DD로 받음
  options?: VoteOption[];
  createdAt?: string; // API에서는 ISO 문자열로 받음
}
interface TransformedPollData
  extends Omit<
    PollDataFromAPI,
    "createdAt" | "periodStartDate" | "periodEndDate"
  > {
  periodStartDateObj?: Date; // Date 객체로 변환된 필드
  periodEndDateObj?: Date;
  createdAtObj?: Date;
}
interface StoredParticipantData {
  nickname: string;
  previousSelectedDates?: string[]; // YYYY-MM-DD 형식의 문자열 배열
}

const VotePage = () => {
  const params = useParams();
  const router = useRouter();
  const showAlert = useUIStore((state) => state.showAlert);
  const pollId = params.pollId as string;

  const [currentUserNickname, setCurrentUserNickname] = useState<string | null>(
    null
  );
  const [pollData, setPollData] = useState<TransformedPollData | null>(null);
  const [loading, setLoading] = useState(true); // 초기에는 항상 로딩 상태
  const [error, setError] = useState<string | null>(null);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [password, setPassword] = useState("");

  // 날짜 문자열 (YYYY-MM-DD)을 로컬 타임존 기준으로 Date 객체로 변환하는 헬퍼 함수
  const parseDateString = (dateStr: string): Date | null => {
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
      const day = parseInt(parts[2], 10);
      const dateObj = new Date(year, month, day);
      if (!isNaN(dateObj.getTime())) {
        return dateObj;
      }
    }
    console.warn("Invalid date string received:", dateStr);
    return null;
  };

  useEffect(() => {
    if (!pollId) {
      setError("유효하지 않은 투표 접근입니다. (Poll ID 없음)");
      setLoading(false);
      return;
    }

    let isActive = true; // 비동기 작업 중 컴포넌트 unmount 시 상태 업데이트 방지용
    setLoading(true);
    setError(null); // 이전 에러 초기화

    const storedDataString = localStorage.getItem(
      `pickday_participant_data_${pollId}`
    );

    if (storedDataString) {
      try {
        const storedData = JSON.parse(
          storedDataString
        ) as StoredParticipantData;
        if (storedData && storedData.nickname) {
          if (isActive) setCurrentUserNickname(storedData.nickname);

          if (Array.isArray(storedData.previousSelectedDates)) {
            const prevDates = storedData.previousSelectedDates
              .map((dateStr) => parseDateString(dateStr)) // 헬퍼 함수 사용
              .filter((date) => date !== null) as Date[];
            if (isActive) setSelectedDates(prevDates);
            console.log(
              "Restored selected dates from localStorage:",
              prevDates
            );
          }

          // 사용자 정보 로드 후 투표 데이터 fetch
          fetch(`/api/polls/${pollId}`)
            .then(async (res) => {
              if (!isActive) return null; // 컴포넌트 unmounted
              if (!res.ok) {
                const errorData = await res
                  .json()
                  .catch(() => ({ error: "응답 처리 중 오류 발생" }));
                throw new Error(errorData.error || `오류: ${res.status}`);
              }
              return res.json();
            })
            .then((data: PollDataFromAPI | null) => {
              if (!isActive || !data) return;
              console.log("API로부터 받은 투표 데이터:", data);
              if (!data.periodStartDate || !data.periodEndDate) {
                throw new Error("필수 투표 기간 정보가 누락되었습니다.");
              }

              const startDateObj = parseDateString(
                data.periodStartDate.split("T")[0]
              ); // YYYY-MM-DD 부분만 사용
              const endDateObj = parseDateString(
                data.periodEndDate.split("T")[0]
              ); // YYYY-MM-DD 부분만 사용

              if (!startDateObj || !endDateObj) {
                throw new Error("투표 기간 날짜 형식이 올바르지 않습니다.");
              }

              setPollData({
                ...data,
                periodStartDateObj: startDateObj,
                periodEndDateObj: endDateObj,
                createdAtObj: data.createdAt
                  ? new Date(data.createdAt)
                  : undefined,
              });
            })
            .catch((err) => {
              if (!isActive) return;
              console.error("투표 데이터 로딩 실패:", err);
              setError(err.message || "투표 정보를 불러오는데 실패했습니다.");
            })
            .finally(() => {
              if (isActive) setLoading(false);
            });
        } else {
          // localStorage 데이터가 유효하지 않으면 join 페이지로
          if (isActive) router.replace(`/vote/${pollId}/join`);
        }
      } catch (e) {
        if (!isActive) return;
        console.error("localStorage 파싱 오류 또는 데이터 설정 오류:", e);
        localStorage.removeItem(`pickday_participant_data_${pollId}`);
        router.replace(`/vote/${pollId}/join`);
      }
    } else {
      // localStorage에 정보 없으면 join 페이지로
      if (isActive) router.replace(`/vote/${pollId}/join`);
    }
    return () => {
      // cleanup 함수
      isActive = false;
    };
  }, [pollId, router]);

  const handleMultipleDatesSelect = useCallback((dates: Date[]) => {
    setSelectedDates(dates);
  }, []);

  const handleSubmitVote = useCallback(async () => {
    if (!currentUserNickname) {
      showAlert(
        "인증 필요",
        "참여자 정보가 없습니다. 다시 참여해주세요.",
        "error",
        () => router.push(`/vote/${pollId}/join`)
      );
      return;
    }
    if (!password) {
      showAlert(
        "입력 필요",
        "투표/수정 하려면 비밀번호를 입력해주세요.",
        "error"
      );
      return;
    }
    if (selectedDates.length === 0) {
      showAlert("선택 필요", "투표할 날짜를 하나 이상 선택해주세요.", "error");
      return;
    }

    const voteData = {
      nickname: currentUserNickname,
      password,
      selectedDates: selectedDates.map((date) => {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const day = date.getDate().toString().padStart(2, "0");
        return `${year}-${month}-${day}`;
      }),
    };

    setLoading(true); // 투표 제출 중 로딩 상태
    try {
      const response = await fetch(`/api/polls/${pollId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(voteData),
      });
      const result = await response.json();

      if (!response.ok) {
        showAlert(
          "투표 제출 실패",
          result.error || "투표를 제출하는 중 오류가 발생했습니다.",
          "error"
        );
      } else {
        showAlert(
          "투표 완료",
          "투표가 성공적으로 제출(또는 수정)되었습니다!",
          "success",
          () => {
            const storedDataString = localStorage.getItem(
              `pickday_participant_data_${pollId}`
            );
            if (storedDataString) {
              try {
                const storedData = JSON.parse(
                  storedDataString
                ) as StoredParticipantData;
                storedData.previousSelectedDates = voteData.selectedDates;
                localStorage.setItem(
                  `pickday_participant_data_${pollId}`,
                  JSON.stringify(storedData)
                );
              } catch (e) {
                console.error("Failed to update localStorage after vote:", e);
              }
            }
          }
        );
      }
    } catch (err) {
      showAlert(
        "네트워크 오류",
        "투표 제출 중 네트워크 오류가 발생했습니다.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }, [pollId, currentUserNickname, password, selectedDates, showAlert, router]);

  // --- 렌더링 로직 ---
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-700 p-4">
        정보를 불러오는 중...
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen text-red-600 p-4">
        {" "}
        <p className="text-xl mb-4 text-center">오류: {error}</p>{" "}
        <Button variant="outline" onClick={() => router.push("/")}>
          메인으로 돌아가기
        </Button>{" "}
      </div>
    );
  }

  // pollData와 currentUserNickname이 모두 로드된 후에 CalendarPicker를 렌더링
  if (!pollData || !currentUserNickname) {
    // 이 상태는 join 페이지로 리디렉션되는 과정이거나, 데이터 fetch 실패 시 error 상태로 먼저 처리될 가능성이 높음.
    // 만약 이 메시지가 보인다면, useEffect 내의 로직 흐름에 문제가 있을 수 있음.
    return (
      <div className="flex flex-col justify-center items-center min-h-screen text-gray-700 p-4">
        {" "}
        <p className="text-xl mb-4 text-center">
          투표 정보를 준비 중이거나 참여자 정보를 확인할 수 없습니다.
        </p>{" "}
        <Button
          variant="outline"
          onClick={() => router.push(`/vote/${pollId}/join`)}
        >
          참여 페이지로 이동
        </Button>{" "}
      </div>
    );
  }

  // pollData.periodStartDateObj 등이 null/undefined가 아님을 이 시점에서 확신할 수 있어야 함.
  const minCalDate = pollData.periodStartDateObj;
  const maxCalDate = pollData.periodEndDateObj;
  const initialCalMonth = pollData.periodStartDateObj || new Date();

  return (
    <div className="min-h-screen bg-gray-50 py-8 sm:py-12 flex flex-col items-center px-4">
      <div className="w-full max-w-2xl bg-white p-6 sm:p-8 rounded-lg shadow-xl relative">
        <div className="flex justify-between items-center mb-4 pt-8 sm:pt-6">
          <Button
            onClick={() => router.push("/")}
            variant="ghost"
            size="sm"
            className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10"
          >
            {" "}
            &larr; 메인으로{" "}
          </Button>
          {currentUserNickname && (
            <p className="absolute top-3 right-3 sm:top-4 sm:right-4 text-xs sm:text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
              {" "}
              참여자: {currentUserNickname}{" "}
            </p>
          )}
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 text-center">
          {" "}
          {pollData.title}{" "}
        </h1>
        <p className="text-center text-sm text-gray-500 mb-8">
          {" "}
          원하는 날짜들을 선택하고, 비밀번호를 입력하여 투표(또는 수정)해주세요.{" "}
        </p>

        <div className="mb-6">
          <Input
            id="password"
            label="비밀번호 확인/입력"
            type="password"
            placeholder="참여 시 입력했던 비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <div className="mb-6">
          <p className="block text-sm font-medium text-gray-700 mb-2 pl-1">
            투표할 날짜 선택 (여러 개 선택 가능):
          </p>
          {/* minCalDate, maxCalDate, initialCalMonth가 유효한 Date 객체인지 확인 후 전달 */}
          {minCalDate && maxCalDate && (
            <CalendarPicker
              selectionMode="multiple"
              selectedMultipleDates={selectedDates}
              onMultipleDatesSelect={handleMultipleDatesSelect}
              minSelectableDate={minCalDate}
              maxSelectableDate={maxCalDate}
              initialMonth={initialCalMonth}
            />
          )}
        </div>

        {selectedDates.length > 0 && (
          <div className="text-center mb-6">
            <p className="text-indigo-700 font-medium text-lg">선택된 날짜:</p>
            <ul className="list-none p-0 mt-1">
              {selectedDates
                .sort((a, b) => a.getTime() - b.getTime())
                .map((date) => (
                  <li
                    key={date.toISOString()}
                    className="text-sm text-gray-600"
                  >
                    {date.toLocaleDateString("ko-KR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      weekday: "long",
                    })}
                  </li>
                ))}
            </ul>
          </div>
        )}

        <Button
          variant="primary"
          size="lg"
          className="w-full"
          onClick={handleSubmitVote}
          disabled={loading || selectedDates.length === 0 || !password}
        >
          {loading ? "처리 중..." : "투표하기 / 수정하기"}
        </Button>
      </div>
    </div>
  );
};

export default VotePage;
