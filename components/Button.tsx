// components/Button.tsx
import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost"; // 스타일 변형 (ghost 추가)
  size?: "sm" | "md" | "lg"; // 버튼 크기 (추가)
  // className prop은 ButtonHTMLAttributes에 이미 포함되어 있음
}

const Button = React.memo(function Button({
  children,
  variant = "primary",
  size = "md", // 기본 크기는 'md'
  className = "",
  disabled, // disabled 상태를 명시적으로 받음
  ...rest
}: ButtonProps) {
  // 기본 스타일: 모든 버튼에 공통적으로 적용
  const baseStyle =
    "font-semibold rounded-lg cursor-pointer focus:outline-none transition-all duration-150 ease-in-out inline-flex items-center justify-center";

  // 사이즈별 스타일
  let sizeStyle = "";
  switch (size) {
    case "sm":
      sizeStyle = "px-3 py-1.5 text-xs sm:text-sm"; // 작은 화면에서는 더 작게
      break;
    case "md":
      sizeStyle = "px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base"; // 기본 크기
      break;
    case "lg":
      sizeStyle = "px-8 py-3 sm:py-4 text-base sm:text-lg";
      break;
  }

  // Variant별 스타일
  let variantStyle = "";
  switch (variant) {
    case "primary": // 메인 페이지 및 create 페이지의 주요 버튼들과 통일 (indigo 계열)
      variantStyle = `bg-indigo-600 text-white hover:bg-indigo-700 ${
        disabled
          ? "opacity-50 cursor-not-allowed"
          : "hover:shadow-md transform hover:-translate-y-0.5"
      }`;
      break;
    case "secondary": // 메인 페이지의 "투표 참여하기" 버튼과 유사 (emerald 계열)
      variantStyle = `bg-emerald-500 text-white hover:bg-emerald-600 focus:ring-emerald-500 ${
        disabled
          ? "opacity-50 cursor-not-allowed"
          : "hover:shadow-md transform hover:-translate-y-0.5"
      }`;
      break;
    case "outline": // 기존 outline 스타일에 통일성 및 비활성화 상태 추가
      variantStyle = `border border-indigo-500 text-indigo-600 hover:bg-indigo-50 ${
        disabled
          ? "opacity-50 cursor-not-allowed border-gray-300 text-gray-400"
          : "hover:shadow-md transform hover:-translate-y-0.5"
      }`;
      break;
    case "danger": // 삭제 등 위험한 작업에 사용
      variantStyle = `bg-red-500 text-white hover:bg-red-600 focus:ring-red-500 ${
        disabled ? "opacity-50 cursor-not-allowed" : "hover:shadow-md"
      }`;
      break;
    case "ghost": // CalendarPicker 월 이동 버튼 등에 사용 (배경 없음)
      variantStyle = `bg-transparent text-indigo-600 hover:bg-indigo-100 ${
        disabled ? "opacity-50 cursor-not-allowed text-gray-400" : ""
      }`;
      break;
    default: // 기본값은 primary
      variantStyle = `bg-indigo-600 text-white hover:bg-indigo-700 ${
        disabled
          ? "opacity-50 cursor-not-allowed"
          : "hover:shadow-md transform hover:-translate-y-0.5"
      }`;
  }

  return (
    <button
      className={`${baseStyle} ${sizeStyle} ${variantStyle} ${className}`}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  );
});

export default Button;
