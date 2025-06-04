// components/Input.tsx
"use client";

import React, { useState } from "react";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  placeholder?: string;
  type?: React.HTMLInputTypeAttribute;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  error?: boolean;
  errorMessage?: string;
  wrapperClassName?: string;
}

const Input = React.memo(function Input({
  label,
  id,
  placeholder,
  type = "text",
  value,
  onChange,
  required = false,
  error = false,
  errorMessage,
  disabled,
  className = "",
  wrapperClassName = "",
  ...rest
}: InputProps) {
  const [currentType, setCurrentType] = useState(type);

  const togglePasswordVisibility = () => {
    setCurrentType(currentType === "password" ? "text" : "password");
  };

  // 기본 입력 필드 스타일: 텍스트 색상 및 플레이스홀더 색상 진하게 변경
  const baseInputStyle =
    "block w-full px-3 py-2 border rounded-md shadow-sm sm:text-sm focus:outline-none appearance-none text-gray-900 placeholder-gray-500"; // text-gray-900, placeholder-gray-500 추가

  let stateStyle =
    "border-gray-300 focus:ring-indigo-500 focus:border-indigo-500";

  if (error) {
    // 에러 시 텍스트 및 플레이스홀더 색상은 유지 (이미 충분히 대비됨)
    stateStyle =
      "border-red-500 focus:ring-red-500 focus:border-red-500 text-red-700 placeholder-red-400";
  }

  if (disabled) {
    // 비활성화 시 텍스트 색상은 연하게 유지, 플레이스홀더도 연하게
    stateStyle =
      "border-gray-200 bg-gray-100 text-gray-500 placeholder-gray-400 cursor-not-allowed"; // placeholder-gray-400 추가
  }

  return (
    <div className={`w-full ${wrapperClassName}`}>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-800 mb-1" // 라벨 텍스트도 약간 더 진하게 (text-gray-800)
      >
        {label} {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <div className="relative">
        <input
          id={id}
          type={currentType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          className={`${baseInputStyle} ${stateStyle} ${className} ${
            type === "password" ? "pr-10" : ""
          }`}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={errorMessage && error ? `${id}-error` : undefined}
          {...rest}
        />
        {type === "password" && (
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 text-gray-500 hover:text-gray-700 focus:outline-none"
            aria-label={
              currentType === "password" ? "비밀번호 보기" : "비밀번호 숨기기"
            }
          >
            {currentType === "password" ? (
              <EyeIcon className="h-5 w-5" />
            ) : (
              <EyeSlashIcon className="h-5 w-5" />
            )}
          </button>
        )}
      </div>
      {errorMessage && error && (
        <p id={`${id}-error`} className="mt-1.5 text-xs text-red-600">
          {errorMessage}
        </p>
      )}
    </div>
  );
});

export default Input;
