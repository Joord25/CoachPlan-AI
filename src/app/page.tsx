"use client";

import { useMemo, useRef, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { analyzePrograms, analyzeProgramText } from "@/lib/analyzeProgram";
import { saveProgramStyle, updateProgramStyle } from "@/lib/programStyleStore";
import type { ProgramStructure } from "@/lib/analyzeProgram";
import TrainerStyleAnalysis from "@/components/TrainerStyleAnalysis";
import AnalysisLoadingOverlay from "@/components/AnalysisLoadingOverlay";
import type { AnalysisStep } from "@/components/AnalysisLoadingOverlay";

type AnalysisResult = ProgramStructure & { styleId: string; version: number };

function toUserFriendlyError(e: unknown): string {
  const msg = e instanceof Error ? e.message : String(e);
  if (msg.includes("429") || msg.includes("quota") || msg.includes("rate"))
    return "요청이 많아 잠시 처리가 지연되고 있어요. 1분 후 다시 시도해 주세요.";
  if (msg.includes("401") || msg.includes("API key"))
    return "서비스 인증에 문제가 있어요. 관리자에게 문의해 주세요.";
  if (msg.includes("500") || msg.includes("503") || msg.includes("INTERNAL"))
    return "AI 서버에 일시적인 문제가 있어요. 잠시 후 다시 시도해 주세요.";
  if (msg.includes("파싱") || msg.includes("parse"))
    return "AI 응답을 처리하지 못했어요. 파일을 확인하고 다시 시도해 주세요.";
  if (msg.includes("network") || msg.includes("fetch") || msg.includes("Failed to fetch"))
    return "네트워크 연결을 확인하고 다시 시도해 주세요.";
  if (msg.includes("permission") || msg.includes("insufficient"))
    return "저장 권한에 문제가 있어요. 다시 로그인해 주세요.";
  return "분석 중 문제가 발생했어요. 잠시 후 다시 시도해 주세요.";
}

export default function Home() {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<AnalysisStep>(0);
  const [error, setError] = useState<string | null>(null);
  const [showTextInput, setShowTextInput] = useState(false);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const previewUrl = useMemo(() => previewFile ? URL.createObjectURL(previewFile) : null, [previewFile]);
  const [textInput, setTextInput] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newFiles = Array.from(files).slice(0, 5 - uploadedFiles.length);
    setUploadedFiles((prev) => [...prev, ...newFiles]);
    e.target.value = "";
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  const handleAnalyze = async () => {
    if (!user) return;
    setAnalyzing(true);
    setAnalysisStep(0);
    setError(null);
    try {
      setAnalysisStep(0);
      setAnalysisStep(1);
      await new Promise((r) => setTimeout(r, 600));
      setAnalysisStep(2);
      const structure = await analyzePrograms(uploadedFiles);
      setAnalysisStep(3);
      await new Promise((r) => setTimeout(r, 300));
      setAnalysisStep(4);
      const styleId = await saveProgramStyle(user.uid, structure);

      setResult({ ...structure, styleId, version: 1 });
    } catch (e) {
      setError(toUserFriendlyError(e));
    } finally {
      setAnalyzing(false);
    }
  };

  const handleTextAnalyze = async () => {
    if (!user || !textInput.trim()) return;
    setAnalyzing(true);
    setAnalysisStep(0);
    setError(null);
    try {
      setAnalysisStep(0);
      setAnalysisStep(1);
      await new Promise((r) => setTimeout(r, 600));
      setAnalysisStep(2);
      const structure = await analyzeProgramText(textInput);
      setAnalysisStep(3);
      await new Promise((r) => setTimeout(r, 300));
      setAnalysisStep(4);
      const styleId = await saveProgramStyle(user.uid, structure);

      setResult({ ...structure, styleId, version: 1 });
    } catch (e) {
      setError(toUserFriendlyError(e));
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSave = async (structure: ProgramStructure) => {
    if (!user || !result) return;
    const newVersion = await updateProgramStyle(user.uid, result.styleId, structure);
    setResult((prev) => (prev ? { ...prev, ...structure, version: newVersion } : prev));
  };

  const resetToUpload = () => {
    setResult(null);
    setUploadedFiles([]);
    setTextInput("");
    setShowTextInput(false);
    setError(null);
  };

  // ─── 분석 중 오버레이 ───
  if (analyzing) {
    return (
      <AnalysisLoadingOverlay
        currentStep={analysisStep}
        userName={user?.displayName?.split(" ")[0]}
        fileCount={uploadedFiles.length || undefined}
        files={uploadedFiles}
      />
    );
  }

  // ─── 분석 결과 화면 ───
  if (result) {
    return (
      <TrainerStyleAnalysis
        result={result}
        files={uploadedFiles}
        onBack={resetToUpload}
        onSave={handleSave}
      />
    );
  }

  // ─── 업로드 화면 ───
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-screen px-6">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-bold text-[var(--gray-800)]">
            {user?.displayName
              ? `${user.displayName}님, 프로그램을 학습해볼게요!`
              : "트레이너님, 프로그램을 학습해볼게요!"}
          </h1>
          <p className="text-[var(--gray-400)] text-sm">
            기존 프로그램을 업로드하면 AI가 구조를 분석하고, 더 나은 프로그램을 함께 고민해 드려요
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.png,.jpg,.jpeg,.webp,.xlsx,.xls,.csv"
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full bg-[var(--primary-dark)] text-white rounded-2xl p-6 flex items-center gap-5 hover:bg-[var(--primary-light)] hover:text-[var(--primary-dark)] hover:shadow-lg hover:scale-[1.01] transition-all duration-200 group text-left cursor-pointer"
        >
          <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="18" x2="12" y2="12" />
              <line x1="9" y1="15" x2="12" y2="12" />
              <line x1="15" y1="15" x2="12" y2="12" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-lg font-semibold">프로그램 파일 업로드</p>
            <p className="text-sm text-white/60 group-hover:text-[var(--primary-dark)] mt-1">
              PDF, 사진, 엑셀 파일을 올리면 AI가 구조를 분석해요
            </p>
          </div>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="flex-shrink-0 opacity-40 group-hover:opacity-100 transition-opacity">
            <path d="M7 4l6 6-6 6" />
          </svg>
        </button>

        {uploadedFiles.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-[var(--gray-500)] font-medium">
              업로드된 파일 ({uploadedFiles.length}/5)
            </p>
            {uploadedFiles.some((f) => f.size > 10 * 1024 * 1024) && (
              <p className="text-xs text-amber-500">10MB 이상 파일이 포함되어 분석 시간이 길어질 수 있어요</p>
            )}
            {uploadedFiles.map((file, i) => (
              <div
                key={`${file.name}-${i}`}
                className="bg-white border border-[var(--gray-200)] rounded-xl px-4 py-3 flex items-center gap-3 cursor-pointer hover:border-[var(--primary)] transition-colors"
                onClick={() => setPreviewFile(file)}
              >
                {file.type.startsWith("image/") ? (
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-[var(--primary-light)] flex items-center justify-center flex-shrink-0">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 1H4a1.5 1.5 0 0 0-1.5 1.5v11A1.5 1.5 0 0 0 4 15h8a1.5 1.5 0 0 0 1.5-1.5V5.5L9 1z" />
                      <polyline points="9 1 9 5.5 13.5 5.5" />
                    </svg>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[var(--gray-700)] truncate">{file.name}</p>
                  <p className="text-xs text-[var(--gray-400)]">{formatSize(file.size)}</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                  className="text-[var(--gray-400)] hover:text-red-500 transition-colors flex-shrink-0"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M4 4l8 8M12 4l-8 8" />
                  </svg>
                </button>
              </div>
            ))}

            {error && <p className="text-sm text-red-500">{error}</p>}

            <button
              onClick={handleAnalyze}
              disabled={analyzing}
              className="w-full mt-3 bg-[var(--primary)] text-white rounded-xl py-3 text-sm font-medium hover:bg-[var(--primary-dark)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {analyzing ? "AI가 분석 중..." : "AI 구조 분석 시작"}
            </button>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <button className="bg-white border border-[var(--gray-200)] rounded-2xl p-5 flex items-center gap-4 hover:border-[var(--primary)] hover:shadow-sm transition-all text-left">
            <div className="w-10 h-10 rounded-xl bg-[var(--gray-50)] flex items-center justify-center flex-shrink-0">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="var(--gray-600)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="10" cy="7" r="3" />
                <path d="M4 17c0-3.3 2.7-6 6-6s6 2.7 6 6" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-[var(--gray-800)] text-sm">회원 선택</p>
              <p className="text-xs text-[var(--gray-400)] mt-0.5">등록된 회원에게 프로그램 생성</p>
            </div>
          </button>

          <button
            onClick={() => setShowTextInput(!showTextInput)}
            className={`bg-white border rounded-2xl p-5 flex items-center gap-4 hover:border-[var(--primary)] hover:shadow-sm transition-all text-left ${
              showTextInput ? "border-[var(--primary)]" : "border-[var(--gray-200)]"
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-[var(--gray-50)] flex items-center justify-center flex-shrink-0">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="var(--gray-600)" strokeWidth="1.8" strokeLinecap="round">
                <path d="M10 4v12M4 10h12" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-[var(--gray-800)] text-sm">직접 입력</p>
              <p className="text-xs text-[var(--gray-400)] mt-0.5">운동 프로그램을 텍스트로 입력</p>
            </div>
          </button>
        </div>

        {showTextInput && (
          <div className="space-y-3">
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder={"운동 프로그램을 입력하세요. 여러 프로그램을 --- 로 구분하면 더 정확해요.\n\n예시:\n폼롤러 5분\n스쿼트 4x12\n레그프레스 3x15\n런지 3x12\n플랭크 3x30초\n트레드밀 20분"}
              className="w-full min-h-[200px] p-4 border border-[var(--gray-200)] rounded-xl text-sm text-[var(--gray-700)] placeholder:text-[var(--gray-400)] outline-none focus:border-[var(--primary)] transition-colors resize-y bg-white"
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button
              onClick={handleTextAnalyze}
              disabled={analyzing || !textInput.trim()}
              className="w-full bg-[var(--primary)] text-white rounded-xl py-3 text-sm font-medium hover:bg-[var(--primary-dark)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {analyzing ? "AI가 분석 중..." : "AI 구조 분석 시작"}
            </button>
          </div>
        )}

        {!showTextInput && (
          <div className="bg-white border border-[var(--gray-200)] rounded-2xl px-5 py-4 flex items-center gap-3">
            <input
              type="text"
              placeholder="무엇이든 물어보세요..."
              className="flex-1 outline-none text-sm text-[var(--gray-700)] placeholder:text-[var(--gray-400)] bg-transparent"
            />
            <button className="w-9 h-9 rounded-full bg-[var(--gray-200)] flex items-center justify-center hover:bg-[var(--primary)] hover:text-white transition-colors text-[var(--gray-400)]">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M9 14V4M9 4l-3.5 3.5M9 4l3.5 3.5" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* 파일 미리보기 모달 */}
      {previewFile && previewUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-6"
          onClick={() => setPreviewFile(null)}
        >
          <div
            className="relative bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-auto shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white flex items-center justify-between px-5 py-3 border-b border-[var(--gray-100)] rounded-t-2xl z-10">
              <p className="text-sm font-medium text-[var(--gray-700)] truncate">{previewFile.name}</p>
              <button
                onClick={() => setPreviewFile(null)}
                className="w-8 h-8 rounded-full hover:bg-[var(--gray-100)] flex items-center justify-center text-[var(--gray-400)] transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M4 4l8 8M12 4l-8 8" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              {previewFile.type.startsWith("image/") ? (
                <img src={previewUrl} alt={previewFile.name} className="w-full rounded-xl" />
              ) : previewFile.type === "application/pdf" ? (
                <embed src={previewUrl} type="application/pdf" className="w-full h-[70vh] rounded-xl" />
              ) : (
                <div className="flex flex-col items-center justify-center h-48 text-[var(--gray-400)]">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                  <p className="mt-3 text-sm">미리보기를 지원하지 않는 형식입니다</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
