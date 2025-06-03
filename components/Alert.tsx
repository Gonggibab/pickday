// components/Alert.tsx
"use client";

import React, { JSX } from "react";
import { useUIStore } from "@/stores/useUIStore";
import Button from "./Button";

// Heroicons (outline 버전 사용)
import {
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline"; // 오류 발생 지점

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4 transition-opacity duration-300 ease-in-out"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="alert-title"
      aria-describedby="alert-message"
      onClick={hideAlert}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-sm sm:max-w-md overflow-hidden transform transition-all duration-300 ease-in-out scale-95 opacity-0 animate-modalShow"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`p-5 sm:p-6 flex items-start space-x-3 sm:space-x-4 border-t-4 ${currentStyle.borderColor}`}
        >
          <div className="flex-shrink-0 mt-0.5">{currentStyle.icon}</div>
          <div className="flex-1">
            {alertTitle && (
              <h3
                id="alert-title"
                className={`text-lg font-semibold ${currentStyle.titleColor}`}
              >
                {alertTitle}
              </h3>
            )}
            <p
              id="alert-message"
              className={`text-sm text-gray-600 ${
                alertTitle ? "mt-1.5" : ""
              } whitespace-pre-line`}
            >
              {alertMessage}
            </p>
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
      {/* 간단한 애니메이션을 위한 CSS (globals.css 또는 style 태그에 추가) */}
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
