// app/page.tsx
"use client";

import React from "react";
import Link from "next/link";
import Button from "@/components/Button"; // Button 컴포넌트는 그대로 사용

const MainPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* 언어 선택 버튼 - 정적 UI로 변경 또는 필요시 제거 */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10">
        <button
          className="px-4 py-2 bg-white text-sm text-gray-700 border border-gray-300 rounded-md shadow-sm hover:bg-gray-100 transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-70"
          aria-label="언어 설정 (현재 미지원)" // 기능이 없으므로 aria-label 변경
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2 inline-block"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
            />
          </svg>
          한국어 / EN {/* 정적 텍스트 */}
        </button>
      </div>

      <div className="flex flex-col items-center justify-center min-h-screen pt-20 pb-12 px-4">
        <div className="mb-12 sm:mb-16 text-center">
          <img
            src="/logo-pickday.png"
            alt="PickDay 로고" // alt 텍스트 한국어로
            className="w-auto h-12 sm:h-16 mx-auto"
          />
          <p className="text-base sm:text-lg font-semibold text-gray-700 mt-4">
            간편하게 의견을 모아보세요!
          </p>
        </div>

        <div className="space-y-4 sm:space-y-5 w-full max-w-xs sm:max-w-sm">
          <Link
            href="/create"
            className="block w-full"
            aria-label="새 투표 만들기 페이지로 이동"
          >
            <Button variant="primary" size="lg" className="w-full">
              새 투표 만들기
            </Button>
          </Link>
          <Button
            variant="secondary"
            size="lg"
            className="w-full"
            onClick={() => alert("투표 참여하기 기능은 준비 중입니다.")}
          >
            투표 참여하기
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="w-full text-slate-700 border-slate-500 hover:bg-slate-50 focus:ring-slate-500"
            onClick={() => alert("투표 관리하기 기능은 준비 중입니다.")}
          >
            투표 관리하기
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MainPage;
