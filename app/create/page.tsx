// app/create/page.tsx
"use client";

import React, { useState, useCallback, useEffect } from "react";
import CalendarPicker from "@/components/CalendarPicker";
import Input from "@/components/Input";
import Button from "@/components/Button";
import { useCalendarStore } from "@/stores/useCalendarStore";
import { useUIStore } from "@/stores/useUIStore";
import { useRouter } from "next/navigation";
import { ClipboardDocumentIcon } from "@heroicons/react/24/outline"; // 아이콘 import

const CreatePage = () => {
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState("");
  const [titleError, setTitleError] = useState("");
  const [voteType, setVoteType] = useState<"date" | "datetime">("date");

  const { startDate, endDate, setPeriod, resetDates } = useCalendarStore();
  const router = useRouter();

  const showAlert = useUIStore((state) => state.showAlert);
  const updateAlertMessage = useUIStore((state) => state.updateAlertMessage); // 메시지 업데이트 함수
  const isAlertCurrentlyOpen = useUIStore((state) => state.isAlertOpen); // 현재 알림창 상태
  const currentAlertType = useUIStore((state) => state.alertType); // 현재 알림 타입

  const [displayedStep, setDisplayedStep] = useState(1);
  const [currentContentClasses, setCurrentContentClasses] = useState(
    "opacity-0 translate-y-4"
  );

  // 링크 복사 및 관련 UI를 위한 상태 복원
  const [copiedLink, setCopiedLink] = useState(false);
  const [currentPollLink, setCurrentPollLink] = useState("");

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
    resetDates();
    router.push("/");
  }, [router, resetDates]);

  const handlePrevStep = useCallback(() => {
    if (step === 2 && (startDate || endDate)) {
      const confirmReset = window.confirm(
        "선택하신 날짜 정보가 초기화됩니다. 뒤로 가시겠습니까?"
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
        showAlert("입력 오류", "약속 제목을 입력해주세요.", "error");
        return;
      }
      setTitleError("");
      setStep(2);
    }
  }, [step, title, showAlert]);

  const handleVoteTypeChange = useCallback(
    (newType: "date" | "datetime") => {
      if (voteType !== newType) setVoteType(newType);
    },
    [voteType]
  );

  // 성공 알림 메시지 JSX를 생성하는 함수 (useCallback으로 최적화)
  const createSuccessAlertMessageJSX = useCallback(
    (link: string, isCopied: boolean) => (
      <div className="space-y-3 text-left">
        <p className="text-gray-700">투표가 성공적으로 생성되었습니다!</p>
        <div>
          <label
            htmlFor="poll-link-output"
            className="block text-xs font-medium text-gray-500 mb-0.5"
          >
            공유 링크:
          </label>
          <div className="mt-1 flex rounded-md shadow-sm">
            <input
              type="text"
              name="poll-link-output"
              id="poll-link-output"
              readOnly
              value={link}
              className="block w-full flex-1 rounded-none rounded-l-md border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-600 focus:border-indigo-500 focus:ring-indigo-500 cursor-default"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                // 복사 버튼 클릭 로직
                navigator.clipboard
                  .writeText(link)
                  .then(() => {
                    setCopiedLink(true);
                  })
                  .catch((err) => {
                    console.error("링크 복사 실패: ", err);
                    useUIStore.getState().hideAlert();
                    showAlert(
                      "복사 실패",
                      "링크를 클립보드에 복사하는데 실패했습니다.",
                      "error"
                    );
                  });
              }}
              className="inline-flex items-center rounded-l-none rounded-r-md border border-l-0 border-gray-300 bg-gray-50 hover:bg-gray-100 px-3 text-sm text-gray-700 focus:!ring-indigo-500 whitespace-nowrap !py-[9px]"
            >
              <ClipboardDocumentIcon className="h-4 w-4 mr-1.5" />
              복사
            </Button>
          </div>
          {isCopied && (
            <p className="text-xs text-green-600 mt-1.5 animate-fadeIn">
              링크가 클립보드에 복사되었습니다!
            </p>
          )}
        </div>
        <p className="text-xs text-gray-500 pt-2">
          '확인'을 누르면 생성된 투표 페이지로 이동합니다.
        </p>
      </div>
    ),
    [showAlert]
  ); // setCopiedLink는 안정적이므로 의존성에 포함하지 않아도 되나, showAlert는 포함

  // copiedLink 또는 currentPollLink 상태가 변경될 때 알림 메시지를 업데이트
  useEffect(() => {
    if (
      isAlertCurrentlyOpen &&
      currentAlertType === "success" &&
      currentPollLink
    ) {
      updateAlertMessage(
        createSuccessAlertMessageJSX(currentPollLink, copiedLink)
      );
    }
    // "복사됨!" 메시지를 계속 유지 (setTimeout으로 false로 되돌리는 로직 없음)
  }, [
    copiedLink,
    currentPollLink,
    isAlertCurrentlyOpen,
    currentAlertType,
    updateAlertMessage,
    createSuccessAlertMessageJSX,
  ]);

  const handleCreateVote = useCallback(async () => {
    if (!startDate || !endDate) {
      showAlert("기간 미설정", "투표 기간을 설정해주세요.", "error");
      return;
    }

    const pollPayload = {
      title: title,
      voteType: voteType,
      periodStartDate: startDate.toISOString(),
      periodEndDate: endDate.toISOString(),
    };

    try {
      const response = await fetch("/api/polls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pollPayload),
      });
      const result = await response.json();

      if (!response.ok) {
        showAlert(
          "투표 생성 실패",
          result.error || "투표를 생성하는 중 오류가 발생했습니다.",
          "error"
        );
        return;
      }

      const { pollId, shareableLink: relativeShareableLink } = result;
      const fullLink = `${window.location.origin}${relativeShareableLink}`;

      setCurrentPollLink(fullLink); // (1) 생성된 링크를 상태에 저장
      setCopiedLink(false); // (2) 새 알림이므로 복사 상태는 false로 초기화

      // (3) 초기 알림 메시지 (복사 안된 상태)로 showAlert 호출
      showAlert(
        "투표 생성 완료!",
        createSuccessAlertMessageJSX(fullLink, false),
        "success",
        () => {
          // onClose 콜백
          resetDates();
          router.push(relativeShareableLink);
          setCurrentPollLink(""); // 상태 초기화
          setCopiedLink(false); // 상태 초기화
        }
      );
    } catch (error) {
      console.error("투표 생성 API 호출 중 네트워크 오류:", error);
      showAlert(
        "네트워크 오류",
        "투표 생성 중 네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
        "error"
      );
    }
  }, [
    title,
    voteType,
    startDate,
    endDate,
    router,
    showAlert,
    resetDates,
    updateAlertMessage,
    createSuccessAlertMessageJSX,
  ]);

  const renderStepContent = (currentRenderStep: number) => {
    // ... (이전 답변과 동일한 renderStepContent 함수 내용) ...
    if (currentRenderStep !== displayedStep) {
      return null;
    }
    return (
      <div
        key={`step-${currentRenderStep}`}
        className={`w-full transition-all duration-300 ease-in-out ${currentContentClasses}`}
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
                  <span className="text-gray-800">날짜만 투표받기</span>
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
              <CalendarPicker
                selectionMode="period"
                startDate={startDate}
                endDate={endDate}
                onPeriodSelect={setPeriod}
                minSelectableDate={new Date()}
                initialMonth={startDate || new Date()}
              />
            </div>
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
