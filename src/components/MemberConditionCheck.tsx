"use client";

import { useState } from "react";

export interface MemberCondition {
  bodyPart: "upper_stiff" | "lower_heavy" | "full_fatigue" | "good";
  energyLevel: 1 | 2 | 3 | 4 | 5;
}

export interface MemberInfo {
  gender: "male" | "female";
  birthYear: number;
  bodyWeightKg?: number;
}

export type WorkoutGoal = "fat_loss" | "muscle_gain" | "strength" | "general_fitness" | "rehabilitation";

export interface MemberInput {
  condition: MemberCondition;
  info: MemberInfo;
  goal: WorkoutGoal;
  memberName: string;
}

interface Props {
  onComplete: (input: MemberInput) => void;
  onBack: () => void;
  trainerName?: string;
  compact?: boolean;
}

type Step = "name_input" | "body_check" | "info_input" | "goal_select";

export default function MemberConditionCheck({ onComplete, onBack, trainerName, compact }: Props) {
  const [step, setStep] = useState<Step>("name_input");
  const [memberName, setMemberName] = useState("");
  const [bodyPart, setBodyPart] = useState<MemberCondition["bodyPart"] | null>(null);
  const [energy] = useState<number>(3);
  const [gender, setGender] = useState<"male" | "female" | null>(null);
  const [birthYear, setBirthYear] = useState("");
  const [bodyWeight, setBodyWeight] = useState("");

  const steps: Step[] = ["name_input", "body_check", "info_input", "goal_select"];

  const handleBack = () => {
    const idx = steps.indexOf(step);
    if (idx > 0) setStep(steps[idx - 1]);
    else onBack();
  };

  const handleSelectCondition = (part: MemberCondition["bodyPart"]) => {
    setBodyPart(part);
    setStep("info_input");
  };

  const handleInfoNext = () => {
    if (!gender) return;
    const byNum = parseInt(birthYear.trim());
    if (isNaN(byNum) || byNum < 1940 || byNum > 2015) return;
    setStep("goal_select");
  };

  const handleGoalSelect = (goal: WorkoutGoal) => {
    const byNum = parseInt(birthYear);
    const weightNum = parseFloat(bodyWeight);
    onComplete({
      memberName,
      condition: {
        bodyPart: bodyPart!,
        energyLevel: energy as 1 | 2 | 3 | 4 | 5,
      },
      info: {
        gender: gender!,
        birthYear: byNum,
        bodyWeightKg: !isNaN(weightNum) && weightNum > 0 ? weightNum : undefined,
      },
      goal,
    });
  };

  return (
    <div className={`flex-1 flex items-start justify-center ${compact ? "py-6 px-4" : "min-h-screen py-12 px-6"}`}>
      <div className={`w-full ${compact ? "max-w-sm" : "max-w-lg"}`}>
        {/* Progress Bar */}
        <div className="flex gap-2 mb-8">
          {steps.map((s, i) => (
            <div
              key={s}
              className={`h-1 rounded-full flex-1 transition-all duration-500 ${
                i <= steps.indexOf(step) ? "bg-[var(--primary)]" : "bg-[var(--gray-200)]"
              }`}
            />
          ))}
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <button
              onClick={handleBack}
              className="text-[var(--gray-400)] hover:text-[var(--gray-600)] transition-all -ml-1 p-1"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-[var(--primary)] font-bold tracking-[0.15em] uppercase text-[11px]">
              프로그램 생성 • 단계 {steps.indexOf(step) + 1}/{steps.length}
            </span>
          </div>
          <h1 className="text-2xl font-bold leading-tight text-[var(--gray-800)]">
            {step === "name_input" && "회원 이름을 입력해주세요"}
            {step === "body_check" && `${memberName}님, 오늘 몸 상태는 어때요?`}
            {step === "info_input" && `${memberName}님의 기본 정보를 입력해주세요`}
            {step === "goal_select" && `${memberName}님, 오늘은 무슨 운동 할까요?`}
          </h1>
        </div>

        <div className="flex flex-col gap-6">

        {/* Step 1: 회원 이름 입력 */}
        {step === "name_input" && (
          <div className="flex flex-col gap-5">
            <div className="bg-white rounded-2xl border-2 border-[var(--gray-100)] p-5">
              <p className="text-[10px] font-black text-[var(--gray-400)] uppercase tracking-[0.15em] mb-3">회원 이름</p>
              <input
                type="text"
                value={memberName}
                onChange={(e) => setMemberName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.nativeEvent.isComposing && memberName.trim()) {
                    setStep("body_check");
                  }
                }}
                placeholder="홍길동"
                autoFocus
                className="w-full text-center text-2xl font-black text-[var(--gray-800)] bg-transparent border-b-2 border-[var(--primary)] outline-none pb-1"
              />
            </div>
            <button
              onClick={() => memberName.trim() && setStep("body_check")}
              disabled={!memberName.trim()}
              className="w-full py-4 rounded-2xl font-bold text-lg transition-all bg-[var(--primary)] text-white hover:bg-[var(--primary-dark)] disabled:opacity-40"
            >
              다음
            </button>
          </div>
        )}

        {/* Step 2: 컨디션 체크 */}
        {step === "body_check" && (
          <div className={`grid gap-3 ${compact ? "grid-cols-1" : "grid-cols-2"}`}>
            <ConditionCard
              selected={bodyPart === "upper_stiff"}
              onClick={() => handleSelectCondition("upper_stiff")}
              title="상체가 굳어있음"
              desc="목, 어깨, 등, 날개뼈 주위가 뻐근함"
            />
            <ConditionCard
              selected={bodyPart === "lower_heavy"}
              onClick={() => handleSelectCondition("lower_heavy")}
              title="하체가 무거움"
              desc="고관절, 햄스트링, 종아리가 타이트함"
            />
            <ConditionCard
              selected={bodyPart === "full_fatigue"}
              onClick={() => handleSelectCondition("full_fatigue")}
              title="전반적 피로감"
              desc="근육통 혹은 전신 컨디션 저하"
            />
            <ConditionCard
              selected={bodyPart === "good"}
              onClick={() => handleSelectCondition("good")}
              title="컨디션 좋음"
              desc="특별한 불편함 없이 활력 넘침"
            />

          </div>
        )}

        {/* Step 3: 기본 정보 입력 */}
        {step === "info_input" && (
          <div className="flex flex-col gap-4">
            <div className={`grid gap-4 ${compact ? "grid-cols-1" : "grid-cols-2"}`}>
              <div className="bg-white rounded-2xl border-2 border-[var(--gray-100)] p-5">
                <p className="text-[10px] font-black text-[var(--gray-400)] uppercase tracking-[0.15em] mb-3">성별</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setGender("male")}
                    className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
                      gender === "male" ? "bg-[var(--primary)] text-white" : "bg-[var(--gray-50)] text-[var(--gray-500)]"
                    }`}
                  >
                    남성
                  </button>
                  <button
                    onClick={() => setGender("female")}
                    className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
                      gender === "female" ? "bg-[var(--primary)] text-white" : "bg-[var(--gray-50)] text-[var(--gray-500)]"
                    }`}
                  >
                    여성
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-2xl border-2 border-[var(--gray-100)] p-5">
                <p className="text-[10px] font-black text-[var(--gray-400)] uppercase tracking-[0.15em] mb-3">출생연도</p>
                <input
                  type="number"
                  inputMode="numeric"
                  value={birthYear}
                  onChange={(e) => setBirthYear(e.target.value)}
                  placeholder="1995"
                  className="w-full text-center text-2xl font-black text-[var(--gray-800)] bg-transparent border-b-2 border-[var(--primary)] outline-none pb-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl border-2 border-[var(--gray-100)] p-5">
              <p className="text-[10px] font-black text-[var(--gray-400)] uppercase tracking-[0.15em] mb-3">체중 (선택)</p>
              <div className="flex items-end justify-center gap-1">
                <input
                  type="number"
                  inputMode="decimal"
                  value={bodyWeight}
                  onChange={(e) => setBodyWeight(e.target.value)}
                  placeholder="70"
                  className="w-32 text-center text-3xl font-black text-[var(--gray-800)] bg-transparent border-b-2 border-[var(--primary)] outline-none pb-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className="text-sm font-bold text-[var(--gray-400)] pb-2">kg</span>
              </div>
            </div>

            <button
              onClick={handleInfoNext}
              disabled={!gender || !birthYear.trim()}
              className="w-full py-4 rounded-2xl font-bold text-lg transition-all bg-[var(--primary)] text-white hover:bg-[var(--primary-dark)] disabled:opacity-40"
            >
              다음
            </button>
          </div>
        )}

        {/* Step 4: 목표 설정 */}
        {step === "goal_select" && (
          <div className={`grid gap-3 ${compact ? "grid-cols-1" : "grid-cols-2"}`}>
            <ConditionCard
              selected={false}
              onClick={() => handleGoalSelect("fat_loss")}
              title="살 빼기"
              desc="다이어트, 체지방 감소"
              badge="저강도"
              badgeColor="text-emerald-600 bg-emerald-50"
            />
            <ConditionCard
              selected={false}
              onClick={() => handleGoalSelect("muscle_gain")}
              title="근육 키우기"
              desc="근비대, 몸 만들기"
              badge="중강도"
              badgeColor="text-amber-600 bg-amber-50"
            />
            <ConditionCard
              selected={false}
              onClick={() => handleGoalSelect("strength")}
              title="힘 세지기"
              desc="근력 향상, 고중량"
              badge="고강도"
              badgeColor="text-red-500 bg-red-50"
            />
            <ConditionCard
              selected={false}
              onClick={() => handleGoalSelect("general_fitness")}
              title="기초 체력"
              desc="전반적 체력 향상, 컨디셔닝"
              badge="중강도"
              badgeColor="text-blue-600 bg-blue-50"
            />
            <ConditionCard
              selected={false}
              onClick={() => handleGoalSelect("rehabilitation")}
              title="재활 · 교정"
              desc="부상 회복, 자세 교정"
              badge="저강도"
              badgeColor="text-purple-600 bg-purple-50"
            />
          </div>
        )}
        </div>
      </div>
    </div>
  );
}

function ConditionCard({
  title,
  desc,
  selected,
  onClick,
  badge,
  badgeColor,
}: {
  title: string;
  desc: string;
  selected: boolean;
  onClick: () => void;
  badge?: string;
  badgeColor?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full p-5 rounded-2xl border-2 text-left transition-all duration-200 ${
        selected
          ? "border-[var(--primary)] bg-[var(--primary-light)] ring-1 ring-[var(--primary)]"
          : "border-[var(--gray-100)] bg-white hover:border-[var(--gray-300)]"
      }`}
    >
      <div className="flex justify-between items-center mb-1">
        <span className={`text-lg font-bold ${selected ? "text-[var(--primary-dark)]" : "text-[var(--gray-800)]"}`}>
          {title}
        </span>
        <div className="flex items-center gap-2">
          {badge && (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeColor || "text-[var(--gray-500)] bg-[var(--gray-100)]"}`}>
              {badge}
            </span>
          )}
          {selected && (
            <svg className="w-6 h-6 text-[var(--primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      </div>
      <p className={`text-xs font-medium ${selected ? "text-[var(--primary)]" : "text-[var(--gray-500)]"}`}>
        {desc}
      </p>
    </button>
  );
}
