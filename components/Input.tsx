// components/Input.tsx
import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  placeholder?: string;
  type?: React.HTMLInputTypeAttribute;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  error?: boolean; // 에러 상태 (추가)
  errorMessage?: string; // 에러 메시지 (추가)
  // className prop은 InputHTMLAttributes에 이미 포함되어 있음 (input 요소 대상)
  // wrapperClassName prop을 추가하여 컴포넌트 전체 wrapper div에 클래스를 적용할 수 있도록 함
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
  error = false, // 기본값은 에러 없음
  errorMessage,
  disabled, // disabled 상태를 명시적으로 받음
  className = "", // input 요소에 직접 적용될 클래스
  wrapperClassName = "", // div wrapper에 적용될 클래스
  ...rest
}: InputProps) {
  const baseInputStyle =
    "block w-full px-3 py-2 border rounded-md shadow-sm sm:text-sm focus:outline-none";

  let stateStyle =
    "text-gray-700 border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"; // 기본 및 포커스 스타일

  if (error) {
    stateStyle =
      "border-red-500 focus:ring-red-500 focus:border-red-500 text-red-700 placeholder-red-400"; // 에러 시 스타일
  }

  if (disabled) {
    stateStyle = "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"; // 비활성화 시 스타일
  }

  return (
    <div className={`w-full ${wrapperClassName}`}>
      {" "}
      {/* 외부에서 wrapper div의 스타일링 제어 */}
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label} {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={`${baseInputStyle} ${stateStyle} ${className}`} // className prop은 input 요소에 직접 전달
        aria-invalid={error ? "true" : "false"} // 접근성: 에러 상태 알림
        aria-describedby={errorMessage && error ? `${id}-error` : undefined} // 접근성: 에러 메시지 연결
        {...rest}
      />
      {errorMessage && error && (
        <p id={`${id}-error`} className="mt-1.5 text-xs text-red-600">
          {errorMessage}
        </p>
      )}
    </div>
  );
});

export default Input;
