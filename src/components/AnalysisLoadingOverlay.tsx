"use client";

import { useState, useEffect, useMemo } from "react";

export type AnalysisStep = 0 | 1 | 2 | 3 | 4;

interface Props {
  currentStep: AnalysisStep;
  userName?: string;
  fileCount?: number;
  files?: File[];
}

const STEPS = [
  "프로그램 파일 읽는 중",
  "AI에 분석 요청 전송",
  "프로그램 구조 · 패턴 분석",
  "강점 및 개선점 평가",
  "결과 저장 중",
];

const TIPS = [
  "3개 이상의 프로그램을 올리면 패턴 정확도가 올라가요",
  "PDF, 사진, 엑셀 모두 분석할 수 있어요",
  "분석 후 섹션을 자유롭게 수정하고 저장할 수 있어요",
  "최신 ACSM, NSCA, 국가공인 건강운동관리사 가이드라인을 기반으image.png로 구조를 평가해요",
  "프로그램 스타일은 버전별로 히스토리가 관리되요",
];

export default function AnalysisLoadingOverlay({ currentStep, userName, fileCount, files }: Props) {
  const [activeStep, setActiveStep] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);
  const [tipVisible, setTipVisible] = useState(true);

  // 이미지 파일만 추출해서 썸네일 URL 생성
  const imageUrls = useMemo(() => {
    if (!files) return [];
    return files
      .filter((f) => f.type.startsWith("image/"))
      .map((f) => URL.createObjectURL(f));
  }, [files]);

  useEffect(() => {
    return () => imageUrls.forEach((url) => URL.revokeObjectURL(url));
  }, [imageUrls]);

  useEffect(() => {
    setActiveStep(currentStep);
  }, [currentStep]);

  // 팁 로테이션: 4초마다 페이드아웃 → 교체 → 페이드인
  useEffect(() => {
    const interval = setInterval(() => {
      setTipVisible(false);
      setTimeout(() => {
        setTipIndex((prev) => (prev + 1) % TIPS.length);
        setTipVisible(true);
      }, 400);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-[var(--background)] flex flex-col items-center justify-center overflow-hidden">
      {/* 배경 썸네일 */}
      {imageUrls.length > 0 && (
        <div className="absolute inset-0 flex items-center justify-center gap-6 opacity-[0.06]">
          {imageUrls.map((url, i) => (
            <img
              key={i}
              src={url}
              alt=""
              className="w-60 h-60 object-cover rounded-3xl"
              style={{
                transform: `rotate(${(i - Math.floor(imageUrls.length / 2)) * 8}deg) scale(${1 - Math.abs(i - Math.floor(imageUrls.length / 2)) * 0.1})`,
              }}
            />
          ))}
        </div>
      )}

      {/* AI 펄스 아이콘 — 밝아졌다 어두워졌다 강조 */}
      <div className="relative w-16 h-16 mb-10">
        <div
          className="absolute -inset-2 rounded-full bg-[var(--primary)]"
          style={{
            animation: "loading-breathe 2s ease-in-out infinite",
          }}
        />
        <div
          className="absolute -inset-4 rounded-full bg-[var(--primary)]"
          style={{
            animation: "loading-breathe 2s ease-in-out infinite 0.5s",
          }}
        />
        <div
          className="absolute inset-0 w-16 h-16 rounded-full bg-[var(--primary)] flex items-center justify-center"
          style={{
            animation: "loading-icon-pulse 2s ease-in-out infinite",
          }}
        >
          <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
          </svg>
        </div>
      </div>

      {/* 인사 */}
      <p className="text-lg font-bold text-[var(--gray-800)] text-center px-8">
        {userName || "트레이너"}님의 프로그램을 분석하고 있어요
      </p>
      <p className="text-sm text-[var(--gray-400)] mt-1 text-center px-8">
        {fileCount ? `${fileCount}개 파일에서 구조 패턴을 추출합니다` : "프로그램 구조를 추출합니다"}
      </p>

      {/* 단계 표시 */}
      <div className="mt-8 flex flex-col gap-2.5 items-center">
        {STEPS.map((text, i) => (
          <div
            key={i}
            className={`flex items-center gap-2 transition-all duration-500 ${
              i <= activeStep ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            }`}
          >
            <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
              i < activeStep
                ? "bg-[var(--primary)]"
                : i === activeStep
                  ? "bg-[var(--primary)]"
                  : "bg-[var(--gray-200)]"
            }`}
              style={i === activeStep ? { animation: "loading-breathe-dot 1.5s ease-in-out infinite" } : undefined}
            >
              {i < activeStep ? (
                <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <div className="w-1 h-1 rounded-full bg-white" />
              )}
            </div>
            <span className={`text-[12px] font-medium transition-colors duration-300 ${
              i < activeStep ? "text-[var(--primary)]" : i === activeStep ? "text-[var(--gray-700)]" : "text-[var(--gray-300)]"
            }`}>
              {text}
            </span>
          </div>
        ))}
      </div>

      {/* 팁 */}
      <div className="mt-10 text-center px-8">
        <p className="text-[11px] text-[var(--gray-300)] mb-1">TIP</p>
        <p
          className={`text-sm text-[var(--gray-400)] transition-all duration-400 ${
            tipVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
          }`}
        >
          {TIPS[tipIndex]}
        </p>
      </div>

      {/* CSS 애니메이션 */}
      <style jsx>{`
        @keyframes loading-breathe {
          0%, 100% { opacity: 0.05; transform: scale(1); }
          50% { opacity: 0.2; transform: scale(1.1); }
        }
        @keyframes loading-icon-pulse {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
        @keyframes loading-breathe-dot {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
