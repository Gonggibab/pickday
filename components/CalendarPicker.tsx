// components/CalendarPicker.tsx
"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Button from "@/components/Button";

interface CalendarPickerProps {
  selectionMode?: "single" | "period" | "multiple"; // "multiple" 추가

  // 단일 날짜 선택 모드용
  selectedSingleDate?: Date | null;
  onSingleDateSelect?: (date: Date | null) => void;

  // 기간 선택 모드용
  startDate?: Date | null;
  endDate?: Date | null;
  onPeriodSelect?: (start: Date | null, end: Date | null) => void;

  // 다중 날짜 선택 모드용
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
  startDate: propStartDate,
  endDate: propEndDate,
  onPeriodSelect,
  selectedMultipleDates, // 추가
  onMultipleDatesSelect, // 추가
  minSelectableDate,
  maxSelectableDate,
  initialMonth,
}) => {
  const [currentMonth, setCurrentMonth] = useState(initialMonth || new Date());
  // 기간 선택 시 임시 시작일 (기존 로직 유지)
  const [tempStartDate, setTempStartDate] = useState<Date | null>(null);

  const isDateSelectable = useCallback(
    (date: Date) => {
      // ... (기존과 동일)
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
    // ... (기존과 동일)
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
        // ... (기간 선택 로직 기존과 동일) ...
        if (!tempStartDate || (tempStartDate && propStartDate && propEndDate)) {
          setTempStartDate(date);
        } else {
          const finalStartDate = tempStartDate;
          const finalEndDate = date;
          if (finalStartDate > finalEndDate) {
            onPeriodSelect(finalEndDate, finalStartDate);
          } else {
            onPeriodSelect(finalStartDate, finalEndDate);
          }
          setTempStartDate(null);
        }
      } else if (selectionMode === "multiple") {
        // 다중 선택 로직 추가
        if (onMultipleDatesSelect) {
          const currentSelected = selectedMultipleDates
            ? [...selectedMultipleDates]
            : [];
          const dateString = date.toDateString();
          const index = currentSelected.findIndex(
            (d) => d.toDateString() === dateString
          );

          if (index > -1) {
            // 이미 선택된 날짜면 제거
            currentSelected.splice(index, 1);
          } else {
            // 새로 선택된 날짜면 추가
            currentSelected.push(date);
          }
          // 선택적으로 날짜 순 정렬
          currentSelected.sort((a, b) => a.getTime() - b.getTime());
          onMultipleDatesSelect(currentSelected);
        }
      }
    },
    [
      selectionMode,
      onSingleDateSelect,
      tempStartDate,
      propStartDate,
      propEndDate,
      onPeriodSelect,
      selectedMultipleDates,
      onMultipleDatesSelect, // 다중 선택 관련 의존성 추가
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
        {/* ... (이전/다음 달 버튼 기존과 동일, disabled 로직도 동일) ... */}
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

          // 선택된 날짜 스타일링
          if (
            selectionMode === "single" &&
            selectedSingleDate &&
            day.toDateString() === selectedSingleDate.toDateString() &&
            dayIsSelectable
          ) {
            cellClassName += " bg-indigo-600 text-white hover:bg-indigo-700";
          } else if (selectionMode === "period") {
            // ... (기간 선택 스타일링 기존과 동일) ...
            const currentActiveStart = tempStartDate || propStartDate;
            const currentActiveEnd = propEndDate;
            if (
              currentActiveStart &&
              currentActiveEnd &&
              day >= currentActiveStart &&
              day <= currentActiveEnd &&
              dayIsSelectable
            ) {
              cellClassName += " bg-indigo-100 text-indigo-700";
              if (
                day.toDateString() === currentActiveStart.toDateString() ||
                day.toDateString() === currentActiveEnd.toDateString()
              ) {
                cellClassName += " !bg-indigo-600 text-white";
              }
            } else if (
              tempStartDate &&
              day.toDateString() === tempStartDate.toDateString() &&
              dayIsSelectable
            ) {
              cellClassName += " bg-indigo-600 text-white";
            }
          } else if (
            selectionMode === "multiple" &&
            selectedMultipleDates?.some(
              (d) => d.toDateString() === day.toDateString()
            ) &&
            dayIsSelectable
          ) {
            // 다중 선택된 날짜 스타일링 추가
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
                    )))
                  ? "true"
                  : "false" // aria-pressed는 boolean 문자열 또는 undefined
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
    </div>
  );
};

export default CalendarPicker;
