// components/Alert.tsx
"use client";

import React, { JSX } from "react"; // JSX 타입을 위해 React import
import { useUIStore } from "@/stores/useUIStore";
import Button from "./Button";

import {
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

type AlertType = "success" | "error" | "info" | "warning";

const alertStyles: Record<
  AlertType,
  { icon: JSX.Element; titleColor: string; borderColor: string }
> = {
  success: {
    icon: (
      <CheckCircleIcon className="h-7 w-7 text-green-500" aria-hidden="true" />
    ),
    titleColor: "text-green-700",
    borderColor: "border-green-500",
  },
  error: {
    icon: <XCircleIcon className="h-7 w-7 text-red-500" aria-hidden="true" />,
    titleColor: "text-red-700",
    borderColor: "border-red-500",
  },
  info: {
    icon: (
      <InformationCircleIcon
        className="h-7 w-7 text-blue-500"
        aria-hidden="true"
      />
    ),
    titleColor: "text-blue-700",
    borderColor: "border-blue-500",
  },
  warning: {
    icon: (
      <ExclamationTriangleIcon
        className="h-7 w-7 text-yellow-500"
        aria-hidden="true"
      />
    ),
    titleColor: "text-yellow-700",
    borderColor: "border-yellow-500",
  },
};

const Alert = () => {
  const { isAlertOpen, alertTitle, alertMessage, alertType, hideAlert } =
    useUIStore();

  if (!isAlertOpen) {
    return null;
  }

  const currentStyle = alertStyles[alertType];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50 backdrop-blur-sm p-4 transition-opacity duration-300 ease-in-out"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="alert-title"
      aria-describedby="alert-message"
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-sm sm:max-w-md overflow-hidden transform transition-all duration-300 ease-in-out scale-95 opacity-0 animate-modalShow relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 right-0 pt-3 pr-3 sm:pt-4 sm:pr-4">
          <button
            type="button"
            className="rounded-md p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            onClick={hideAlert}
            aria-label="닫기"
          >
            <span className="sr-only">닫기</span>
            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>

        <div
          className={`p-5 sm:p-6 flex items-start space-x-3 sm:space-x-4 border-t-4 ${currentStyle.borderColor}`}
        >
          <div className="flex-shrink-0 mt-0.5">{currentStyle.icon}</div>
          <div className="flex-1 pr-8">
            {alertTitle && (
              <h3
                id="alert-title"
                className={`text-lg font-semibold ${currentStyle.titleColor}`}
              >
                {alertTitle}
              </h3>
            )}
            {/* alertMessage가 ReactNode이므로 p 태그로 감쌀 필요가 없을 수도 있지만, 일관된 스타일링을 위해 유지 */}
            {/* 또는 alertMessage가 직접 div와 p 등을 포함하도록 할 수 있음 */}
            <div
              id="alert-message"
              className={`text-sm text-gray-600 ${alertTitle ? "mt-1.5" : ""}`}
            >
              {alertMessage}{" "}
              {/* 이제 ReactNode를 렌더링, whitespace-pre-line 제거 */}
            </div>
          </div>
        </div>
        <div className="bg-gray-50 px-5 sm:px-6 py-3 sm:py-4 flex justify-end space-x-3">
          <Button
            variant="primary"
            size="md"
            onClick={hideAlert}
            className="min-w-[90px]"
          >
            확인
          </Button>
        </div>
      </div>
      <style jsx global>{`
        @keyframes modalShow {
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-modalShow {
          animation: modalShow 0.3s forwards cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </div>
  );
};

export default Alert;
