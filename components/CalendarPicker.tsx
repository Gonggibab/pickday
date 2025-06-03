// components/CalendarPicker.tsx
import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useCalendarStore } from "@/stores/useCalendarStore";
import Button from "@/components/Button"; // 사용자 정의 Button 컴포넌트

interface CalendarPickerProps {
  selectionMode?: "single" | "period";
}

const CalendarPicker: React.FC<CalendarPickerProps> = ({
  selectionMode = "period",
}) => {
  const { startDate, endDate, setPeriod } = useCalendarStore();

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [tempStartDate, setTempStartDate] = useState<Date | null>(null);
  const [tempEndDate, setTempEndDate] = useState<Date | null>(null);

  const internalResetRef = useRef(false);

  useEffect(() => {
    const storePeriodIsCleared = startDate === null && endDate === null;

    if (storePeriodIsCleared) {
      if (!internalResetRef.current) {
        setTempStartDate(null);
        setTempEndDate(null);
      }
    }
    if (internalResetRef.current) {
      internalResetRef.current = false;
    }
  }, [startDate, endDate]);

  const generateDaysInMonth = useCallback((date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const days = [];

    const startDayOfWeek = firstDayOfMonth.getDay();
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }

    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  }, []);

  const days = useMemo(
    () => generateDaysInMonth(currentMonth),
    [currentMonth, generateDaysInMonth]
  );

  const isDateInSelectedPeriod = useCallback(
    (date: Date | null) => {
      if (!date) return false;

      const currentActiveStart = tempStartDate || startDate;
      const currentActiveEnd = tempEndDate || (tempStartDate ? null : endDate);

      if (!currentActiveStart) return false;

      if (currentActiveStart && !currentActiveEnd) {
        return date.toDateString() === currentActiveStart.toDateString();
      }

      if (currentActiveStart && currentActiveEnd) {
        const periodStart =
          currentActiveStart < currentActiveEnd
            ? currentActiveStart
            : currentActiveEnd;
        const periodEnd =
          currentActiveStart < currentActiveEnd
            ? currentActiveEnd
            : currentActiveStart;
        return date >= periodStart && date <= periodEnd;
      }
      return false;
    },
    [tempStartDate, tempEndDate, startDate, endDate]
  );

  const handleDayClick = useCallback(
    (date: Date | null) => {
      if (!date) return;

      if (selectionMode === "period") {
        if (startDate && endDate && !tempStartDate) {
          internalResetRef.current = true;
          setPeriod(null, null);
          setTempStartDate(date);
          setTempEndDate(null);
          return;
        }

        if (!tempStartDate) {
          setTempStartDate(date);
          setTempEndDate(null);
          if ((startDate && !endDate) || (!startDate && endDate)) {
            internalResetRef.current = true;
            setPeriod(null, null);
          }
        } else {
          const finalStartDate = tempStartDate;
          const finalEndDate = date;

          if (finalStartDate > finalEndDate) {
            setPeriod(finalEndDate, finalStartDate);
          } else {
            setPeriod(finalStartDate, finalEndDate);
          }
          setTempStartDate(null);
          setTempEndDate(null);
        }
      }
    },
    [selectionMode, startDate, endDate, tempStartDate, setPeriod]
  );

  return (
    <div className="bg-white p-3 sm:p-4 rounded-lg shadow-md w-full">
      <div className="flex justify-between items-center mb-4">
        <Button
          size="sm"
          variant="ghost" // "outline" variant 적용
          onClick={() =>
            setCurrentMonth(
              new Date(
                currentMonth.getFullYear(),
                currentMonth.getMonth() - 1,
                1
              )
            )
          }
          className="px-3 py-1.5" // 패딩 조정 (선택 사항)
        >
          &larr; 이전 달
        </Button>
        <h2 className="text-md sm:text-lg font-semibold text-gray-800 mx-2 truncate">
          {" "}
          {/* mx-2 및 truncate 추가 */}
          {currentMonth.toLocaleString("ko-KR", {
            year: "numeric",
            month: "long",
          })}
        </h2>
        <Button
          size="sm"
          variant="ghost" // "outline" variant 적용
          onClick={() =>
            setCurrentMonth(
              new Date(
                currentMonth.getFullYear(),
                currentMonth.getMonth() + 1,
                1
              )
            )
          }
          className="px-3 py-1.5" // 패딩 조정 (선택 사항)
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
          if (!day) {
            return (
              <div key={`empty-${index}`} className="py-1 h-8 sm:h-10"></div>
            );
          }

          const isCurrentMonthDay = true;
          const isSelectedAsFullPeriod = isDateInSelectedPeriod(day);
          const isTempStart =
            tempStartDate &&
            day &&
            day.toDateString() === tempStartDate.toDateString();

          let cellClassName = `p-1 rounded-md cursor-pointer font-medium text-gray-700 h-8 sm:h-10 flex items-center justify-center focus:outline-none transition-colors duration-150 ease-in-out`;

          if (isCurrentMonthDay) {
            cellClassName += " hover:bg-indigo-100";
          } else {
            cellClassName += " text-gray-400 cursor-default";
          }

          if (isTempStart && !tempEndDate) {
            cellClassName += " bg-indigo-600 text-white ring-2 ring-indigo-400";
          } else if (isSelectedAsFullPeriod) {
            cellClassName += " bg-indigo-600 text-white";
            if (
              day.toDateString() ===
                (tempStartDate || startDate)?.toDateString() ||
              day.toDateString() === (tempEndDate || endDate)?.toDateString()
            ) {
              cellClassName += " ring-2 ring-indigo-700";
            }
          }

          return (
            <div
              key={day ? day.toISOString() : `day-${index}`}
              className={cellClassName}
              onClick={() => isCurrentMonthDay && handleDayClick(day)}
              role="button"
              tabIndex={isCurrentMonthDay ? 0 : -1}
              onKeyDown={(e) => {
                if (isCurrentMonthDay && (e.key === "Enter" || e.key === " ")) {
                  handleDayClick(day);
                }
              }}
            >
              {isCurrentMonthDay ? day.getDate() : ""}
            </div>
          );
        })}
      </div>
      {(tempStartDate || (startDate && endDate)) && (
        <div className="mt-6 sm:mt-8 font-medium text-center text-sm sm:text-lg text-gray-800">
          {tempStartDate && !tempEndDate
            ? `시작일: ${tempStartDate.toLocaleDateString()} (종료일을 선택하세요)`
            : startDate && endDate
            ? `선택된 기간: ${startDate.toLocaleDateString()} ~ ${endDate.toLocaleDateString()}`
            : "시작일과 종료일을 선택하여 기간을 설정하세요."}
        </div>
      )}
    </div>
  );
};

export default CalendarPicker;
