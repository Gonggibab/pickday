// app/create/page.tsx
"use client";

import React, { useState, useCallback, useEffect } from "react";
import CalendarPicker from "@/components/CalendarPicker";
import Input from "@/components/Input";
import Button from "@/components/Button";
import { useCalendarStore } from "@/stores/useCalendarStore";
import { useRouter } from "next/navigation";
// import { useTranslation } from 'react-i18next'; // 제거

const CreatePage = () => {
  // const { t } = useTranslation(); // 제거

  const [step, setStep] = useState(1);
  const [title, setTitle] = useState("");
  const [titleError, setTitleError] = useState("");
  const [voteType, setVoteType] = useState<"date" | "datetime">("date");
  const { resetDates, startDate, endDate } = useCalendarStore();
  const router = useRouter();

  const [displayedStep, setDisplayedStep] = useState(1);
  const [currentContentClasses, setCurrentContentClasses] = useState(
    "opacity-0 translate-y-4"
  );

  useEffect(() => {
    if (step === displayedStep) {
      setCurrentContentClasses("opacity-100 translate-y-0");
    } else {
      setCurrentContentClasses("opacity-0 -translate-y-4");
      const timer = setTimeout(() => {
        setDisplayedStep(step);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [step, displayedStep]);

  const handleGoToMain = useCallback(() => {
    router.push("/");
  }, [router]);

  const handlePrevStep = useCallback(() => {
    if (step === 2 && (startDate || endDate)) {
      const confirmReset = window.confirm(
        "선택하신 날짜 정보가 초기화됩니다. 뒤로 가시겠습니까?" // 한국어 직접 사용
      );
      if (confirmReset) {
        resetDates();
        setStep(1);
      }
    } else {
      setStep(1);
    }
  }, [step, startDate, endDate, resetDates]);

  const handleNextStep = useCallback(() => {
    if (step === 1) {
      if (title.trim() === "") {
        setTitleError("약속 제목을 입력해주세요."); // 한국어 직접 사용
        return;
      }
      setTitleError("");
      setStep(2);
    }
  }, [step, title]);

  const handleVoteTypeChange = useCallback(
    (newType: "date" | "datetime") => {
      if (voteType !== newType) {
        setVoteType(newType);
      }
    },
    [voteType]
  );

  const handleCreateVote = useCallback(async () => {
    if (!startDate || !endDate) {
      alert("투표 기간을 설정해주세요."); // 한국어 직접 사용
      return;
    }

    const pollData = {
      title: title,
      voteType: voteType,
      periodStartDate: startDate.toISOString(),
      periodEndDate: endDate.toISOString(),
      createdAt: new Date().toISOString(),
    };

    console.log("생성될 투표 데이터:", pollData);

    const mockPollId = `pickday-${Math.random().toString(36).substr(2, 9)}`;
    const mockAdminKey = `admin-${Math.random().toString(36).substr(2, 12)}`;
    const shareableLink = `${window.location.origin}/vote/${mockPollId}`;

    alert(
      `투표 생성 완료!\n\n` +
        `공유 링크: ${shareableLink}\n` +
        `관리자 키 (잘 보관하세요!): ${mockAdminKey}\n\n` +
        `(투표 페이지로 이동 버튼을 눌러 이동합니다.)` // 한국어 직접 사용
    );

    router.push(`/vote/${mockPollId}`);
  }, [title, voteType, startDate, endDate, router]);

  const renderStepContent = (currentRenderStep: number) => {
    if (currentRenderStep !== displayedStep) {
      return null;
    }

    return (
      <div
        key={`step-${currentRenderStep}`}
        className={`
          w-full
          transition-all duration-300 ease-in-out
          ${currentContentClasses}
        `}
      >
        {currentRenderStep === 1 && (
          <>
            <h2 className="text-xl sm:text-2xl font-semibold mb-2 text-gray-700 text-center">
              어떤 약속인가요?
            </h2>
            <p className="text-sm sm:text-base text-gray-500 mb-6 sm:mb-8 text-center">
              약속의 제목을 입력하여 투표를 시작하세요.
            </p>
            <div className="mb-6">
              <Input
                id="voteTitle"
                label="약속 제목"
                placeholder="예: 6월 팀 회식 날짜 정하기"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (titleError) {
                    setTitleError("");
                  }
                }}
                required
                error={!!titleError}
                errorMessage={titleError}
              />
            </div>
            <div className="mt-8 flex flex-col space-y-3 sm:flex-row-reverse sm:space-y-0 sm:space-x-reverse sm:space-x-3">
              <Button
                onClick={handleNextStep}
                className="w-full sm:flex-1 py-2.5 sm:py-3"
              >
                다음
              </Button>
              <Button
                onClick={handleGoToMain}
                variant="outline"
                className="w-full sm:flex-1 py-2.5 sm:py-3"
              >
                메인으로
              </Button>
            </div>
          </>
        )}

        {currentRenderStep === 2 && (
          <>
            <h2 className="text-xl sm:text-2xl font-semibold mb-2 text-gray-700 text-center">
              투표 방식과 날짜를 선택하세요.
            </h2>
            <p className="text-sm sm:text-base text-gray-500 mb-6 sm:mb-8 text-center">
              원하는 투표 방식과 날짜 범위를 설정해주세요.
            </p>

            <fieldset className="mb-6">
              <legend className="block text-sm font-medium text-gray-700 mb-2 pl-1">
                투표 종류
              </legend>
              <div className="flex flex-col space-y-1 bg-gray-50 p-3 sm:p-4 rounded-md border">
                <label className="flex items-center text-sm sm:text-md cursor-pointer p-2 rounded-md hover:bg-gray-100 transition-colors">
                  <input
                    type="radio"
                    value="date"
                    checked={voteType === "date"}
                    onChange={() => handleVoteTypeChange("date")}
                    className="form-radio h-4 w-4 sm:h-5 sm:w-5 text-indigo-600 mr-2 sm:mr-3"
                  />
                  <span className="text-gray-800">날짜만 투표</span>
                </label>
                <label className="flex items-center text-sm sm:text-md cursor-pointer p-2 rounded-md hover:bg-gray-100 transition-colors">
                  <input
                    type="radio"
                    value="datetime"
                    checked={voteType === "datetime"}
                    onChange={() => handleVoteTypeChange("datetime")}
                    className="form-radio h-4 w-4 sm:h-5 sm:w-5 text-indigo-600 mr-2 sm:mr-3"
                  />
                  <span className="text-gray-800">시간도 함께 투표받기</span>
                </label>
              </div>
            </fieldset>

            <div className="mb-6 sm:mb-8">
              <p className="block text-sm font-medium text-gray-700 mb-2 pl-1">
                투표할 날짜 범위
              </p>
              <CalendarPicker selectionMode="period" />
            </div>

            {voteType === "datetime" && (
              <div className="mb-6 p-3 bg-indigo-50 rounded-lg border border-indigo-200 text-center">
                <p className="text-indigo-700 font-medium text-sm">
                  시간도 함께 투표받기를 선택하셨습니다.
                </p>
                <p className="text-indigo-600 text-xs">
                  (시간 선택 기능은 추후 추가될 예정입니다.)
                </p>
              </div>
            )}
            <Button
              onClick={handleCreateVote}
              className="w-full py-2.5 sm:py-3"
              variant="primary"
            >
              투표 생성하고 링크 받기
            </Button>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-6 flex flex-col items-center px-4">
      <div className="w-full max-w-2xl bg-white p-6 sm:p-8 rounded-lg shadow-xl relative min-h-[420px] sm:min-h-[400px]">
        {step > 1 && (
          <Button
            onClick={handlePrevStep}
            variant="ghost"
            size="sm"
            className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10"
          >
            &larr; 뒤로가기
          </Button>
        )}
        <div className="flex flex-col items-center justify-start h-full pt-3 sm:pt-2">
          {renderStepContent(displayedStep)}
        </div>
      </div>
    </div>
  );
};

export default CreatePage;
