"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ProgramStructure, Evidence } from "@/lib/analyzeProgram";
import { useAuth } from "@/lib/AuthContext";
import { searchExercises, isKnownExercise } from "@/lib/baseExerciseDB";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Props {
  result: ProgramStructure & { styleId: string; version: number };
  files: File[];
  onBack: () => void;
  onSave: (updated: ProgramStructure) => Promise<void>;
}

function SortableSectionCard({ id, isEditing, onRemove, children }: { id: string; isEditing: boolean; onRemove: () => void; children: () => React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="group/card relative">
      {/* 드래그 핸들 — 카드 바깥 왼쪽, 제목 높이 */}
      <button
        {...attributes}
        {...listeners}
        className="absolute top-5 -left-8 w-6 h-6 flex items-center justify-center text-[var(--gray-300)] hover:text-[var(--gray-500)] cursor-grab active:cursor-grabbing touch-none"
        title="드래그하여 순서 변경"
      >
        <svg width="12" height="12" viewBox="0 0 14 14" fill="currentColor">
          <circle cx="4.5" cy="3" r="1.2" />
          <circle cx="9.5" cy="3" r="1.2" />
          <circle cx="4.5" cy="7" r="1.2" />
          <circle cx="9.5" cy="7" r="1.2" />
          <circle cx="4.5" cy="11" r="1.2" />
          <circle cx="9.5" cy="11" r="1.2" />
        </svg>
      </button>
      <div className="bg-white border border-[var(--gray-200)] rounded-2xl p-5 space-y-3 relative">
        {children()}
      </div>
      {isEditing && (
        <button
          onClick={onRemove}
          className="absolute top-3 -right-9 w-6 h-6 flex items-center justify-center rounded-full text-[var(--gray-300)] hover:text-red-500 hover:bg-red-50 opacity-0 group-hover/card:opacity-100 transition-all"
          title="섹션 삭제"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M2 2l8 8M10 2l-8 8" />
          </svg>
        </button>
      )}
    </div>
  );
}

export default function TrainerStyleAnalysis({ result, files, onBack, onSave }: Props) {
  const { user } = useAuth();
  const displayName = user?.displayName?.split(" ")[0] || "트레이너";
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [sections, setSections] = useState(result.sections);
  const [sectionsHistory, setSectionsHistory] = useState([result.sections]);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [activeEvidence, setActiveEvidence] = useState<Evidence | null>(null);
  const [expandedSources, setExpandedSources] = useState<Set<number>>(new Set());
  const [showInsights, setShowInsights] = useState(false);
  const [exSearchQuery, setExSearchQuery] = useState("");
  const [exSearchSection, setExSearchSection] = useState<number | null>(null);
  const [userAddedExercises] = useState(() => new Set<string>());
  const fileRefs = useRef<(HTMLDivElement | null)[]>([]);
  const exSearchRef = useRef<HTMLDivElement>(null);

  // 운동 검색 결과 (트레이너 DB + 기본 DB 통합)
  const exSearchResults = useMemo(() => {
    if (!exSearchQuery.trim() || exSearchSection === null) return [];
    const baseResults = searchExercises(exSearchQuery);
    const trainerMatches = result.exerciseDatabase
      .filter((ex) => ex.toLowerCase().includes(exSearchQuery.toLowerCase()))
      .map((ex) => ({ label: "내 운동", exercise: ex }));
    const seen = new Set<string>();
    const merged: { label: string; exercise: string }[] = [];
    for (const r of [...trainerMatches, ...baseResults]) {
      if (!seen.has(r.exercise)) {
        seen.add(r.exercise);
        merged.push(r);
      }
    }
    return merged.slice(0, 12);
  }, [exSearchQuery, exSearchSection, result.exerciseDatabase]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (exSearchRef.current && !exSearchRef.current.contains(e.target as Node)) {
        setExSearchSection(null);
        setExSearchQuery("");
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const fileUrls = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files]);
  useEffect(() => {
    return () => fileUrls.forEach((url) => URL.revokeObjectURL(url));
  }, [fileUrls]);

  const isImage = (file: File) => file.type.startsWith("image/");
  const isPdf = (file: File) => file.type === "application/pdf";

  const handleEvidenceClick = (ev: Evidence) => {
    setActiveFileIndex(ev.fileIndex);
    setActiveEvidence(ev);
    fileRefs.current[ev.fileIndex]?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const pushSections = (next: typeof sections) => {
    setSectionsHistory((prev) => [...prev, sections]);
    setSections(next);
  };

  const undo = () => {
    if (sectionsHistory.length <= 1) return;
    const prev = [...sectionsHistory];
    const last = prev.pop()!;
    setSectionsHistory(prev);
    setSections(last);
  };

  const canUndo = sectionsHistory.length > 1;

  const updateSection = (index: number, field: string, value: string | string[]) => {
    const updated = [...sections];
    updated[index] = { ...updated[index], [field]: value };
    setSections(updated);
  };

  const addSection = () => {
    pushSections([...sections, {
      name: "새 섹션",
      order: sections.length + 1,
      purpose: "",
      typicalExercises: [],
      setRepPattern: "",
      duration: "",
    }]);
  };

  const removeSection = (index: number) => {
    const updated = sections.filter((_, i) => i !== index);
    pushSections(updated.map((s, i) => ({ ...s, order: i + 1 })));
  };

  // dnd-kit: 드래그 센서 (포인터 + 터치)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
  );

  // 섹션별 고유 ID (dnd-kit용)
  const sectionIds = useMemo(() => sections.map((_, i) => `section-${i}`), [sections]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = sectionIds.indexOf(active.id as string);
    const newIndex = sectionIds.indexOf(over.id as string);
    if (oldIndex === -1 || newIndex === -1) return;
    const updated = [...sections];
    const [moved] = updated.splice(oldIndex, 1);
    updated.splice(newIndex, 0, moved);
    pushSections(updated.map((s, i) => ({ ...s, order: i + 1 })));
  };

  const handleLearn = async () => {
    setSaving(true);
    const { styleId, version, ...structure } = result;
    await onSave({ ...structure, sections });
    setSaving(false);
  };

  return (
    <div className="flex-1 flex min-h-screen">
      {/* ─── 왼쪽: 파일 미리보기 + 근거 표시 ─── */}
      <div className="w-[45%] border-r border-[var(--gray-200)] bg-[var(--gray-50)] flex flex-col">
        <div className="flex gap-1 px-4 pt-4 pb-2 overflow-x-auto">
          {files.map((file, i) => (
            <button
              key={i}
              onClick={() => { setActiveFileIndex(i); setActiveEvidence(null); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                activeFileIndex === i
                  ? "bg-[var(--primary)] text-white"
                  : "bg-white text-[var(--gray-600)] hover:bg-[var(--gray-100)]"
              }`}
            >
              {file.name.length > 20 ? file.name.slice(0, 18) + "…" : file.name}
            </button>
          ))}
        </div>

        {activeEvidence && activeEvidence.fileIndex === activeFileIndex && (
          <div className="mx-4 mb-3 bg-amber-50 border border-amber-200 rounded-xl p-4 relative">
            <button
              onClick={() => setActiveEvidence(null)}
              className="absolute top-2 right-2 text-amber-400 hover:text-amber-600"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M3 3l8 8M11 3l-8 8" />
              </svg>
            </button>
            <div className="flex items-start gap-2">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="var(--primary)" strokeWidth="1.5" className="mt-0.5 flex-shrink-0">
                <circle cx="8" cy="8" r="6" />
                <path d="M8 5v3M8 10.5v.5" strokeLinecap="round" />
              </svg>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-amber-800 mb-1">근거 인용</p>
                <p className="text-sm text-amber-900 font-medium leading-relaxed">
                  &ldquo;{activeEvidence.quote}&rdquo;
                </p>
                <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <circle cx="6" cy="6" r="4" />
                    <path d="M6 4v2.5l1.5 1" />
                  </svg>
                  위치: {activeEvidence.location}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-auto px-4 pb-4">
          {files.map((file, i) => (
            <div
              key={i}
              ref={(el) => { fileRefs.current[i] = el; }}
              className={activeFileIndex === i ? "block" : "hidden"}
            >
              {isImage(file) ? (
                <img src={fileUrls[i]} alt={file.name} className="w-full rounded-xl border border-[var(--gray-200)] shadow-sm" />
              ) : isPdf(file) ? (
                <embed src={fileUrls[i]} type="application/pdf" className="w-full h-[calc(100vh-120px)] rounded-xl border border-[var(--gray-200)]" />
              ) : (
                <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl border border-[var(--gray-200)]">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--gray-400)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                  <p className="mt-3 text-sm text-[var(--gray-500)]">{file.name}</p>
                  <p className="text-xs text-[var(--gray-400)] mt-1">미리보기를 지원하지 않는 형식</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ─── 오른쪽: 하나의 흐름 ─── */}
      <div className="w-[55%] flex flex-col h-screen">
        <div className="flex-1 overflow-auto px-6 py-6">
          <div className="max-w-2xl mx-auto space-y-6">

            {/* Header */}
            <div className="flex items-center justify-between">
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-[var(--gray-500)] hover:text-[var(--gray-700)] transition-colors text-sm"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M10 12L6 8l4-4" />
                </svg>
                돌아가기
              </button>
              <span className="text-xs text-[var(--gray-400)]">v{result.version}</span>
            </div>

            {/* ─── 1. 스타일 요약 ─── */}
            <div className="bg-white border border-[var(--gray-200)] rounded-2xl p-6 space-y-4">
              <div>
                <h2 className="text-lg font-bold text-[var(--gray-800)]">
                  {displayName}님의 프로그램 스타일
                </h2>
                <p className="text-sm text-[var(--gray-500)] mt-1.5 leading-relaxed">
                  {result.trainerStyle}
                </p>
              </div>

              {/* 강점/개선점 토글 */}
              <button
                onClick={() => setShowInsights(!showInsights)}
                className="flex items-center gap-2 text-sm text-[var(--primary)] hover:text-[var(--primary-dark)] transition-colors"
              >
                <svg
                  width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
                  className={`transition-transform ${showInsights ? "rotate-90" : ""}`}
                >
                  <path d="M4 2l4 4-4 4" />
                </svg>
                구조 강점 · 개선점 보기
              </button>

              {showInsights && (
                <div className="grid grid-cols-2 gap-3 pt-2">
                  {/* 강점 */}
                  <div className="space-y-2.5">
                    <h3 className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px]">+</span>
                      강점
                    </h3>
                    {result.strengths?.map((s, i) => (
                      <div key={i} className="bg-emerald-50 border border-emerald-100 rounded-xl p-3.5 space-y-1">
                        <p className="text-xs font-semibold text-emerald-900">{s.structure}</p>
                        <p className="text-[11px] text-emerald-700 leading-relaxed">{s.advantage}</p>
                        <p className="text-[10px] text-emerald-500">{s.context}</p>
                        {s.citation && (
                          <p className="text-[9px] text-emerald-400 pt-1 border-t border-emerald-100 mt-1.5">{s.citation}</p>
                        )}
                      </div>
                    ))}
                  </div>
                  {/* 개선 제안 */}
                  <div className="space-y-2.5">
                    <h3 className="text-xs font-semibold text-amber-700 flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-[10px]">!</span>
                      개선 제안
                    </h3>
                    {result.improvements?.map((imp, i) => (
                      <div key={i} className="bg-amber-50 border border-amber-100 rounded-xl p-3.5 space-y-1">
                        <p className="text-xs font-semibold text-amber-900">{imp.structure}</p>
                        <p className="text-[11px] text-amber-700 leading-relaxed">{imp.limitation}</p>
                        <p className="text-[10px] text-amber-600 flex items-start gap-1">
                          <span className="mt-px">→</span>
                          <span>{imp.suggestion}</span>
                        </p>
                        {imp.citation && (
                          <p className="text-[9px] text-amber-400 pt-1 border-t border-amber-100 mt-1.5">{imp.citation}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ─── 2. 프로그램 구조 확인 ─── */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-[var(--gray-800)]">프로그램 구조</h3>
                  <p className="text-xs text-[var(--gray-400)] mt-0.5">구조가 맞는지 확인하고, 수정할 부분이 있으면 수정하세요</p>
                </div>
                {canUndo && (
                  <button
                    onClick={undo}
                    className="flex items-center gap-1 text-xs text-[var(--gray-400)] hover:text-[var(--gray-700)] transition-colors"
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2.5 4h4.5a2.5 2.5 0 1 1 0 5H6" />
                      <path d="M4.5 2L2.5 4l2 2" />
                    </svg>
                    되돌리기
                  </button>
                )}
              </div>

              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={sectionIds} strategy={verticalListSortingStrategy}>
              {sections.map((section, i) => (
                <SortableSectionCard key={sectionIds[i]} id={sectionIds[i]} isEditing={editingIndex === i} onRemove={() => removeSection(i)}>
                  {() => (<>
                  {editingIndex !== i && (
                    <button
                      onClick={() => setEditingIndex(i)}
                      className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-lg text-[var(--gray-300)] hover:text-[var(--primary)] hover:bg-[var(--primary-light)] transition-colors"
                      title="수정"
                    >
                      <svg width="13" height="13" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M7 2l3 3-7 7H0V9z" />
                      </svg>
                    </button>
                  )}
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-[var(--primary-light)] text-[var(--primary-dark)] text-xs font-bold flex items-center justify-center flex-shrink-0">
                      {section.order}
                    </span>
                    {editingIndex === i ? (
                      <>
                        <input
                          value={section.name}
                          onChange={(e) => updateSection(i, "name", e.target.value)}
                          className="text-base font-semibold text-[var(--gray-800)] border-b border-[var(--gray-300)] outline-none bg-transparent flex-1"
                        />
                        <button
                          onClick={() => setEditingIndex(null)}
                          className="w-6 h-6 flex items-center justify-center rounded-full bg-[var(--primary)] text-white hover:bg-[var(--primary-dark)] transition-colors"
                          title="수정 완료"
                        >
                          <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M2 6l3 3 5-5" />
                          </svg>
                        </button>
                      </>
                    ) : (
                      <h4 className="text-base font-semibold text-[var(--gray-800)] flex-1">
                        {section.name}
                      </h4>
                    )}
                  </div>

                  {editingIndex === i ? (
                    <>
                      <input
                        value={section.purpose}
                        onChange={(e) => updateSection(i, "purpose", e.target.value)}
                        placeholder="이 섹션의 목적"
                        className="w-full text-sm text-[var(--gray-600)] border-b border-[var(--gray-200)] outline-none bg-transparent py-1"
                      />
                      {/* 운동 태그 + 검색 자동완성 */}
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-1.5">
                          {section.typicalExercises.map((ex, j) => (
                            <span
                              key={j}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-[var(--primary-light)] text-[var(--primary-dark)] text-xs rounded-full"
                            >
                              {ex}
                              <button
                                onClick={() => {
                                  const updated = section.typicalExercises.filter((_, k) => k !== j);
                                  updateSection(i, "typicalExercises", updated);
                                }}
                                className="text-[var(--primary)] hover:text-red-500 transition-colors"
                              >
                                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                                  <path d="M2.5 2.5l5 5M7.5 2.5l-5 5" />
                                </svg>
                              </button>
                            </span>
                          ))}
                        </div>
                        <div className="relative" ref={exSearchSection === i ? exSearchRef : undefined}>
                          <input
                            value={exSearchSection === i ? exSearchQuery : ""}
                            onChange={(e) => {
                              setExSearchQuery(e.target.value);
                              setExSearchSection(i);
                            }}
                            onFocus={() => setExSearchSection(i)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.nativeEvent.isComposing) {
                                e.preventDefault();
                                const name = exSearchQuery.trim();
                                if (name && !section.typicalExercises.includes(name)) {
                                  userAddedExercises.add(name);
                                  updateSection(i, "typicalExercises", [...section.typicalExercises, name]);
                                  setExSearchQuery("");
                                  setExSearchSection(null);
                                }
                              }
                            }}
                            placeholder="운동 검색 또는 직접 입력 후 Enter"
                            className="w-full text-xs text-[var(--gray-600)] border border-[var(--gray-200)] rounded-lg outline-none bg-white px-3 py-2 focus:border-[var(--primary)] transition-colors"
                          />
                          {exSearchSection === i && exSearchQuery.trim() && (
                            <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-white border border-[var(--gray-200)] rounded-xl shadow-lg max-h-48 overflow-auto">
                              {exSearchResults.map((r, j) => {
                                const alreadyAdded = section.typicalExercises.includes(r.exercise);
                                return (
                                  <button
                                    key={j}
                                    disabled={alreadyAdded}
                                    onClick={() => {
                                      if (!alreadyAdded) {
                                        userAddedExercises.add(r.exercise);
                                        updateSection(i, "typicalExercises", [...section.typicalExercises, r.exercise]);
                                        setExSearchQuery("");
                                      }
                                    }}
                                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors ${
                                      alreadyAdded
                                        ? "text-[var(--gray-300)] cursor-default"
                                        : "text-[var(--gray-700)] hover:bg-[var(--gray-50)]"
                                    }`}
                                  >
                                    <span>{r.exercise}</span>
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                                      alreadyAdded
                                        ? "bg-[var(--gray-100)] text-[var(--gray-300)]"
                                        : "bg-[var(--gray-100)] text-[var(--gray-400)]"
                                    }`}>
                                      {alreadyAdded ? "추가됨" : r.label}
                                    </span>
                                  </button>
                                );
                              })}
                              {/* 검색 결과에 없으면 직접 추가 옵션 */}
                              {!exSearchResults.some((r) => r.exercise === exSearchQuery.trim()) && (
                                <button
                                  onClick={() => {
                                    const name = exSearchQuery.trim();
                                    if (name && !section.typicalExercises.includes(name)) {
                                      userAddedExercises.add(name);
                                      updateSection(i, "typicalExercises", [...section.typicalExercises, name]);
                                      setExSearchQuery("");
                                      setExSearchSection(null);
                                    }
                                  }}
                                  className="w-full text-left px-3 py-2.5 text-xs text-[var(--primary)] hover:bg-[var(--primary-light)] transition-colors border-t border-[var(--gray-100)] flex items-center gap-2"
                                >
                                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                                    <path d="M6 2v8M2 6h8" />
                                  </svg>
                                  &ldquo;{exSearchQuery.trim()}&rdquo; 직접 추가
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <input
                          value={section.setRepPattern}
                          onChange={(e) => updateSection(i, "setRepPattern", e.target.value)}
                          placeholder="세트x횟수 패턴"
                          className="flex-1 text-xs text-[var(--gray-500)] border-b border-[var(--gray-200)] outline-none bg-transparent py-1"
                        />
                        <input
                          value={section.duration}
                          onChange={(e) => updateSection(i, "duration", e.target.value)}
                          placeholder="소요 시간"
                          className="flex-1 text-xs text-[var(--gray-500)] border-b border-[var(--gray-200)] outline-none bg-transparent py-1"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-[var(--gray-500)]">{section.purpose}</p>
                      <div className="flex flex-wrap gap-2">
                        {section.typicalExercises.map((ex, j) => {
                          const known = isKnownExercise(ex) || userAddedExercises.has(ex);
                          // 출처 찾기: exerciseEvidence → 다른 섹션 → fallback
                          const findEvidence = () => {
                            const exEv = section.exerciseEvidence?.[ex];
                            if (exEv) return exEv;
                            for (const s of sections) {
                              const found = s.exerciseEvidence?.[ex];
                              if (found) return found;
                            }
                            const allEvidence = sections.flatMap((s) => s.evidence || []);
                            if (!allEvidence.length) return null;
                            const keywords = ex.split(/\s+/).filter((w) => w.length >= 2);
                            let ev = allEvidence.find((e) => e.quote.includes(ex));
                            if (!ev && keywords.length > 0) {
                              for (const kw of [...keywords].sort((a, b) => b.length - a.length)) {
                                ev = allEvidence.find((e) => e.quote.includes(kw));
                                if (ev) break;
                              }
                            }
                            return ev || section.evidence?.[0] || allEvidence[0];
                          };
                          const ev = findEvidence();
                          const sourceFile = ev ? files[ev.fileIndex] : null;
                          const sourceName = sourceFile
                            ? (sourceFile.name.length > 12 ? sourceFile.name.slice(0, 10) + "…" : sourceFile.name)
                            : null;

                          return (
                            <button
                              key={j}
                              onClick={() => { if (ev) handleEvidenceClick(ev); }}
                              className={`group/ex px-3 py-1 text-xs rounded-full flex items-center gap-1.5 transition-colors cursor-pointer ${
                                known
                                  ? "bg-[var(--gray-50)] text-[var(--gray-600)] hover:bg-[var(--gray-100)]"
                                  : "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100"
                              }`}
                            >
                              {!known && (
                                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                                  <circle cx="5" cy="5" r="4" />
                                  <path d="M5 3.5v2M5 7v.5" />
                                </svg>
                              )}
                              {ex}
                              {sourceName && (
                                <span className="text-[9px] text-[var(--gray-400)] group-hover/ex:text-[var(--primary)] transition-colors flex items-center gap-0.5">
                                  <svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
                                    <path d="M5.5 1H7v1.5M7 1L4 4M3 1H1.5A.5.5 0 001 1.5v5a.5.5 0 00.5.5h5a.5.5 0 00.5-.5V5" />
                                  </svg>
                                  {sourceName}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                      {section.typicalExercises.some((ex) => !isKnownExercise(ex) && !userAddedExercises.has(ex)) && (
                        <button
                          onClick={() => setEditingIndex(i)}
                          className="text-[11px] text-amber-600 hover:text-amber-800 transition-colors flex items-center gap-1"
                        >
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                            <circle cx="5" cy="5" r="4" />
                            <path d="M5 3.5v2M5 7v.5" />
                          </svg>
                          DB에 없는 운동이 있어요 — 수정하거나 검색해서 교체하세요
                        </button>
                      )}
                      <div className="flex gap-4 text-xs text-[var(--gray-400)]">
                        <span>{section.setRepPattern}</span>
                        <span>{section.duration}</span>
                      </div>
                    </>
                  )}

                  {/* 출처 토글 */}
                  {editingIndex !== i && section.evidence && section.evidence.length > 0 && (
                    <div className="pt-1">
                      <button
                        onClick={() => setExpandedSources((prev) => {
                          const next = new Set(prev);
                          next.has(i) ? next.delete(i) : next.add(i);
                          return next;
                        })}
                        className="inline-flex items-center gap-1.5 text-[11px] text-[var(--gray-400)] hover:text-[var(--primary)] transition-colors"
                      >
                        <svg
                          width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
                          className={`transition-transform ${expandedSources.has(i) ? "rotate-90" : ""}`}
                        >
                          <path d="M3 2l4 3-4 3" />
                        </svg>
                        출처 {section.evidence.length}건
                      </button>

                      {expandedSources.has(i) && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {section.evidence.map((ev, j) => (
                            <button
                              key={j}
                              onClick={() => handleEvidenceClick(ev)}
                              className={`px-2.5 py-1 rounded-full text-[11px] transition-all ${
                                activeEvidence === ev
                                  ? "bg-[var(--primary)] text-white"
                                  : "bg-[var(--gray-50)] text-[var(--gray-500)] hover:bg-[var(--primary-light)] hover:text-[var(--primary-dark)]"
                              }`}
                            >
                              {files[ev.fileIndex]?.name.length > 15
                                ? files[ev.fileIndex]?.name.slice(0, 13) + "…"
                                : files[ev.fileIndex]?.name}
                              <span className="opacity-60 ml-1">· {ev.location}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  </>)}
                </SortableSectionCard>
              ))}
              </SortableContext>
              </DndContext>

              <button
                onClick={addSection}
                className="w-full border-2 border-dashed border-[var(--gray-200)] rounded-2xl py-4 text-sm text-[var(--gray-400)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors flex items-center justify-center gap-2"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M7 2v10M2 7h10" />
                </svg>
                섹션 추가
              </button>
            </div>

          </div>
        </div>

        {/* ─── 하단 고정: 학습 버튼 ─── */}
        <div className="px-6 py-4 border-t border-[var(--gray-100)] bg-[var(--background)]">
          <div className="max-w-2xl mx-auto">
            <button
              onClick={handleLearn}
              disabled={saving}
              className="w-full bg-[var(--primary)] text-white rounded-2xl py-4 text-sm font-semibold hover:bg-[var(--primary-dark)] transition-colors disabled:opacity-50"
            >
              {saving ? "저장 중..." : "이 스타일 학습시키기"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
