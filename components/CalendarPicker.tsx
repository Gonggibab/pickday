// components/CalendarPicker.tsx
"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Button from "@/components/Button";

interface CalendarPickerProps {
  selectionMode?: "single" | "period" | "multiple";
  selectedSingleDate?: Date | null;
  onSingleDateSelect?: (date: Date | null) => void;
  startDate?: Date | null; // prop으로 받는 시작일 (CreatePage에서는 store의 startDate)
  endDate?: Date | null; // prop으로 받는 종료일 (CreatePage에서는 store의 endDate)
  onPeriodSelect?: (start: Date | null, end: Date | null) => void; // prop으로 받는 기간 설정 함수
  selectedMultipleDates?: Date[];
  onMultipleDatesSelect?: (dates: Date[]) => void;
  minSelectableDate?: Date;
  maxSelectableDate?: Date;
  initialMonth?: Date;
}

const CalendarPicker: React.FC<CalendarPickerProps> = ({
  selectionMode = "period",
  selectedSingleDate,
  onSingleDateSelect,
  startDate: propStartDate, // 명확성을 위해 prop 이름 변경
  endDate: propEndDate, // 명확성을 위해 prop 이름 변경
  onPeriodSelect,
  selectedMultipleDates,
  onMultipleDatesSelect,
  minSelectableDate,
  maxSelectableDate,
  initialMonth,
}) => {
  const [currentMonth, setCurrentMonth] = useState(initialMonth || new Date());
  const [tempStartDate, setTempStartDate] = useState<Date | null>(null); // 기간 선택 시 첫 번째 클릭 날짜

  const isDateSelectable = useCallback(
    (date: Date) => {
      const dateOnly = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
      );
      if (minSelectableDate) {
        const minDateOnly = new Date(
          minSelectableDate.getFullYear(),
          minSelectableDate.getMonth(),
          minSelectableDate.getDate()
        );
        if (dateOnly < minDateOnly) return false;
      }
      if (maxSelectableDate) {
        const maxDateOnly = new Date(
          maxSelectableDate.getFullYear(),
          maxSelectableDate.getMonth(),
          maxSelectableDate.getDate()
        );
        if (dateOnly > maxDateOnly) return false;
      }
      return true;
    },
    [minSelectableDate, maxSelectableDate]
  );

  const generateDaysInMonth = useCallback((date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const days = [];
    const startDayOfWeek = firstDayOfMonth.getDay();
    for (let i = 0; i < startDayOfWeek; i++) days.push(null);
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++)
      days.push(new Date(year, month, i));
    return days;
  }, []);

  const days = useMemo(
    () => generateDaysInMonth(currentMonth),
    [currentMonth, generateDaysInMonth]
  );

  const handleDayClick = useCallback(
    (date: Date | null) => {
      if (!date || !isDateSelectable(date)) return;

      if (selectionMode === "single") {
        if (onSingleDateSelect) {
          onSingleDateSelect(date);
        }
      } else if (selectionMode === "period") {
        if (!onPeriodSelect) return;

        if (!tempStartDate) {
          // 첫 번째 클릭: 임시 시작일로 설정
          // 만약 이전에 이미 완성된 기간이 prop으로 전달되었다면, 새로운 선택을 시작하는 것이므로 초기화
          if (propStartDate && propEndDate) {
            onPeriodSelect(null, null); // 기존 선택된 기간 초기화
          }
          setTempStartDate(date);
          // 두 번째 클릭을 기다리므로 여기서는 onPeriodSelect를 바로 호출하지 않음
          // (선택적으로 onPeriodSelect(date, null)로 시작일만 먼저 알릴 수는 있음)
        } else {
          // 두 번째 클릭: 기간 확정
          const finalStartDate = tempStartDate;
          const finalEndDate = date;

          if (finalStartDate > finalEndDate) {
            onPeriodSelect(finalEndDate, finalStartDate);
          } else {
            onPeriodSelect(finalStartDate, finalEndDate);
          }
          setTempStartDate(null); // 임시 시작일 초기화하여 다음 선택 준비
        }
      } else if (selectionMode === "multiple") {
        if (onMultipleDatesSelect) {
          const currentSelected = selectedMultipleDates
            ? [...selectedMultipleDates]
            : [];
          const dateString = date.toDateString();
          const index = currentSelected.findIndex(
            (d) => d.toDateString() === dateString
          );

          if (index > -1) {
            currentSelected.splice(index, 1);
          } else {
            currentSelected.push(date);
          }
          currentSelected.sort((a, b) => a.getTime() - b.getTime());
          onMultipleDatesSelect(currentSelected);
        }
      }
    },
    [
      selectionMode,
      onSingleDateSelect,
      // 기간 선택 관련 props 및 상태
      propStartDate,
      propEndDate,
      onPeriodSelect,
      tempStartDate,
      selectedMultipleDates,
      onMultipleDatesSelect,
      isDateSelectable,
    ]
  );

  const canNavigatePrevMonth = useMemo(() => {
    /* ... (기존과 동일) ... */
    if (!minSelectableDate) return true;
    const firstDayOfCurrentMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      1
    );
    return (
      firstDayOfCurrentMonth >
      new Date(minSelectableDate.getFullYear(), minSelectableDate.getMonth(), 1)
    );
  }, [currentMonth, minSelectableDate]);

  const canNavigateNextMonth = useMemo(() => {
    /* ... (기존과 동일) ... */
    if (!maxSelectableDate) return true;
    const firstDayOfNextMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      1
    );
    return (
      firstDayOfNextMonth <=
      new Date(
        maxSelectableDate.getFullYear(),
        maxSelectableDate.getMonth() + 1,
        0
      )
    );
  }, [currentMonth, maxSelectableDate]);

  return (
    <div className="bg-white p-3 sm:p-4 rounded-lg shadow-md w-full">
      <div className="flex justify-between items-center mb-4">
        <Button
          size="sm"
          variant="outline"
          onClick={() =>
            setCurrentMonth(
              new Date(
                currentMonth.getFullYear(),
                currentMonth.getMonth() - 1,
                1
              )
            )
          }
          className="px-3 py-1.5"
          disabled={!canNavigatePrevMonth}
        >
          &larr; 이전 달
        </Button>
        <h2 className="text-md sm:text-lg font-semibold text-gray-800 mx-2 truncate">
          {currentMonth.toLocaleString("ko-KR", {
            year: "numeric",
            month: "long",
          })}
        </h2>
        <Button
          size="sm"
          variant="outline"
          onClick={() =>
            setCurrentMonth(
              new Date(
                currentMonth.getFullYear(),
                currentMonth.getMonth() + 1,
                1
              )
            )
          }
          className="px-3 py-1.5"
          disabled={!canNavigateNextMonth}
        >
          다음 달 &rarr;
        </Button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs sm:text-sm">
        {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
          <div key={day} className="font-semibold text-gray-600 py-1 sm:py-2">
            {day}
          </div>
        ))}
        {days.map((day, index) => {
          if (!day)
            return (
              <div key={`empty-${index}`} className="py-1 h-8 sm:h-10"></div>
            );

          const dayIsSelectable = isDateSelectable(day);
          let cellClassName = `p-1 rounded-md font-medium h-8 sm:h-10 flex items-center justify-center focus:outline-none transition-colors duration-150 ease-in-out`;

          if (dayIsSelectable) {
            cellClassName +=
              " cursor-pointer hover:bg-indigo-100 text-gray-700";
          } else {
            cellClassName += " text-gray-300 cursor-not-allowed bg-gray-50";
          }

          // 선택된 날짜/기간 스타일링
          if (
            selectionMode === "single" &&
            selectedSingleDate &&
            day.toDateString() === selectedSingleDate.toDateString() &&
            dayIsSelectable
          ) {
            cellClassName += " bg-indigo-600 text-white hover:bg-indigo-700";
          } else if (selectionMode === "period") {
            // propStartDate와 propEndDate는 스토어(또는 부모)의 '확정된' 기간
            // tempStartDate는 현재 사용자가 선택 중인 기간의 시작점
            const isSelectedStart =
              tempStartDate &&
              day.toDateString() === tempStartDate.toDateString();

            let isInFinalPeriod = false;
            if (propStartDate && propEndDate) {
              // 시간 정보를 제거하고 날짜만 비교하기 위해 Date 객체 재생성
              const dayOnly = new Date(
                day.getFullYear(),
                day.getMonth(),
                day.getDate()
              );
              const currentPeriodStart = new Date(
                propStartDate.getFullYear(),
                propStartDate.getMonth(),
                propStartDate.getDate()
              );
              const currentPeriodEnd = new Date(
                propEndDate.getFullYear(),
                propEndDate.getMonth(),
                propEndDate.getDate()
              );
              if (
                dayOnly >= currentPeriodStart &&
                dayOnly <= currentPeriodEnd
              ) {
                isInFinalPeriod = true;
              }
            }

            if (isSelectedStart) {
              // 현재 선택 중인 시작일 (가장 높은 우선순위)
              cellClassName +=
                " bg-indigo-600 text-white hover:bg-indigo-700 ring-2 ring-indigo-300";
            } else if (isInFinalPeriod && dayIsSelectable) {
              // 확정된 기간 내의 날짜
              cellClassName += " bg-indigo-100 text-indigo-700";
              if (
                day.toDateString() === propStartDate?.toDateString() ||
                day.toDateString() === propEndDate?.toDateString()
              ) {
                cellClassName += " !bg-indigo-600 text-white"; // 기간의 시작/끝
              }
            }
          } else if (
            selectionMode === "multiple" &&
            selectedMultipleDates?.some(
              (d) => d.toDateString() === day.toDateString()
            ) &&
            dayIsSelectable
          ) {
            cellClassName += " bg-indigo-600 text-white hover:bg-indigo-700";
          }

          return (
            <div
              key={day.toISOString()}
              className={cellClassName}
              onClick={() => dayIsSelectable && handleDayClick(day)}
              role="button"
              aria-pressed={
                dayIsSelectable &&
                ((selectionMode === "single" &&
                  selectedSingleDate?.toDateString() === day.toDateString()) ||
                  (selectionMode === "multiple" &&
                    selectedMultipleDates?.some(
                      (d) => d.toDateString() === day.toDateString()
                    )) ||
                  // 기간 선택 시 aria-pressed는 시작/종료일에만 적용하거나, 기간 내 모든 날짜에 적용할지 결정 필요
                  (selectionMode === "period" &&
                    (tempStartDate?.toDateString() === day.toDateString() ||
                      propStartDate?.toDateString() === day.toDateString() ||
                      propEndDate?.toDateString() === day.toDateString())))
                  ? "true"
                  : "false"
              }
              aria-disabled={!dayIsSelectable}
              tabIndex={dayIsSelectable ? 0 : -1}
              onKeyDown={(e) => {
                if (dayIsSelectable && (e.key === "Enter" || e.key === " "))
                  handleDayClick(day);
              }}
            >
              {day.getDate()}
            </div>
          );
        })}
      </div>
      {/* 선택된 기간 표시는 CreatePage에서 startDate, endDate를 사용해 직접 할 수 있습니다. */}
      {selectionMode === "period" && propStartDate && propEndDate && (
        <div className="mt-3 sm:mt-4 text-center text-xs sm:text-sm text-gray-700">
          선택된 기간: {propStartDate.toLocaleDateString("ko-KR")} ~{" "}
          {propEndDate.toLocaleDateString("ko-KR")}
        </div>
      )}
    </div>
  );
};

export default CalendarPicker;
