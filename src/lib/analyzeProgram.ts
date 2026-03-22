import { gemini } from "./gemini";
import { getExerciseListForPrompt, normalizeStructureExercises } from "./baseExerciseDB";

const ANALYSIS_PROMPT = `당신은 운동 프로그램 구조 분석 전문가입니다.

아래 운동 프로그램들을 분석하여 이 트레이너만의 프로그램 구조 패턴을 추출하세요.

규칙:
1. 섹션 이름은 트레이너가 실제 사용하는 용어 그대로 추출 (예: warm-up, 메인, 코어, 쿨다운, 줄넘기, 쉐도우 등)
2. 고정 틀(warm-up/main/core)을 강제하지 말 것 — 트레이너 스타일 그대로 반영
3. 각 섹션의 운동 특징, 세트/횟수 패턴, 순서 규칙을 파악
4. 여러 프로그램에서 공통되는 패턴을 우선 추출
5. 각 분석 결과에 반드시 근거(evidence)를 첨부 — 원본에서 어떤 내용을 보고 판단했는지 인용

반드시 아래 JSON 형식으로만 응답하세요:
{
  "trainerStyle": "이 트레이너의 프로그래밍 스타일 요약 (1-2문장)",
  "strengths": [
    {
      "structure": "어떤 구조적 특징인지 (짧게)",
      "advantage": "이 구조가 유리한 이유와 대상 (1-2문장)",
      "context": "어떤 상황/목적에서 특히 효과적인지",
      "citation": "근거 출처 (예: ACSM 2026, Saeterbakken 2022, NSCA 가이드라인)"
    }
  ],
  "improvements": [
    {
      "structure": "어떤 구조적 특징인지 (짧게)",
      "limitation": "이 구조가 불리한 이유와 대상 (1-2문장)",
      "suggestion": "대안이나 개선 방향 (1문장)",
      "citation": "근거 출처 (예: ACSM 2026, Brandao 2020, NASM OPT 모델)"
    }
  ],
  "sections": [
    {
      "name": "섹션 이름",
      "order": 1,
      "purpose": "이 섹션의 목적",
      "typicalExercises": ["운동1", "운동2"],
      "setRepPattern": "세트x횟수 패턴 (예: 3x12-15)",
      "duration": "소요 시간 추정",
      "evidence": [
        {
          "fileIndex": 0,
          "quote": "원본에서 발견한 텍스트를 그대로 인용 (예: 폼롤러 5분, 스쿼트 4x12)",
          "location": "파일 내 위치 설명 (예: 상단 워밍업 섹션, 표 3행, 이미지 왼쪽 상단 등)"
        }
      ],
      "exerciseEvidence": {
        "운동1": { "fileIndex": 0, "quote": "해당 운동이 등장하는 원본 텍스트 인용", "location": "파일 내 위치" },
        "운동2": { "fileIndex": 1, "quote": "해당 운동이 등장하는 원본 텍스트 인용", "location": "파일 내 위치" }
      }
    }
  ],
  "exerciseDatabase": ["발견된 모든 운동명 리스트"]
}

strengths/improvements 작성 규칙:
- 각각 2~3개 작성.
- 운동 종목이나 내용이 아닌 **프로그램 구조 설계**를 평가할 것.
- 반드시 "이 구조가 왜 좋은지/불리한지" + "누구에게/어떤 상황에서" 맥락을 포함.
- citation은 반드시 실제 존재하는 가이드라인이나 연구를 인용. 아래 출처 활용:
  · ACSM 2026 Position Stand (저항운동 처방)
  · ACSM 2009 Progression Models
  · NSCA Essentials of Strength Training, 4th ed
  · NASM OPT 모델 (Essentials of PFT, 7th ed)
  · Saeterbakken et al. 2022 (코어 배치 체계적 리뷰)
  · Brandao et al. 2020 (운동 순서 효과)
  · McCrary et al. 2023 (워밍업 효과)
  · Afonso et al. 2021 (쿨다운과 회복)
  · Owen et al. 2022 (필라테스 네트워크 메타분석)
- strengths 예시:
  · structure: "Main 마지막에 코어 운동 고정 배치"
    advantage: "복합운동 시 몸통 안정성을 유지하고, 세션 후반 코어 집중 훈련으로 부상 예방에 유리합니다"
    context: "초중급자 PT, 재활 후 복귀 클라이언트에게 특히 효과적"
    citation: "Saeterbakken et al. 2022; NSCA 가이드라인"
- improvements 예시:
  · structure: "Main 내 코어 운동 포함 구조"
    limitation: "숙련자는 코어를 별도 데이(5분할)로 분리하는 경향이 있어, 고급 클라이언트에게는 비효율적일 수 있습니다"
    suggestion: "레벨별 구조 분기 — 초중급은 현재 구조 유지, 고급은 코어 분리 옵션 제공"
    citation: "NSCA Essentials, 4th ed; ACSM 2026"

evidence 작성 규칙:
- quote: 원본 파일에서 실제로 보이는 텍스트/숫자를 최대한 그대로 인용. 이미지라면 보이는 글자를 그대로 적기.
- location: 파일 내 어디에 있는지 (예: "상단", "중간 표", "하단 메모", "좌측 열", "2번째 섹션 아래" 등)
- fileIndex: 0부터 시작하는 파일 순서 번호
- 하나의 섹션에 여러 파일의 근거가 있으면 evidence 배열에 모두 포함

exerciseEvidence 작성 규칙:
- typicalExercises의 **모든 운동**에 대해 개별 출처를 반드시 작성할 것.
- 키: 정규화된 운동명 (typicalExercises에 넣은 이름과 동일해야 함)
- 값: { fileIndex, quote, location } — 해당 운동이 등장하는 원본 위치
- 같은 운동이 여러 파일에 나오면 가장 대표적인 파일 1개만 기재
- quote에는 해당 운동의 세트/횟수 등이 보이면 함께 인용 (예: "백익스텐션 BW 10rep x3")

운동명 정규화 규칙:
- 아래 "기본 운동 DB"에 이미 있는 운동이면 해당 정규화된 이름으로 통일할 것.
- 같은 운동의 다른 표기(영어, 약어, 다른 한글 표기)도 모두 정규화. 예: "원레그 DL" → "싱글 레그 데드리프트", "one leg deadlift" → "싱글 레그 데드리프트"
- 기본 DB에 없는 운동이면 원본 명칭 그대로 한국어로 적을 것.
- typicalExercises와 exerciseDatabase 모두 정규화된 이름 사용.`;

export interface Evidence {
  fileIndex: number;
  quote: string;
  location: string;
}

export interface ProgramSection {
  name: string;
  order: number;
  purpose: string;
  typicalExercises: string[];
  setRepPattern: string;
  duration: string;
  evidence?: Evidence[];
  exerciseEvidence?: Record<string, Evidence>;
}

export interface Strength {
  structure: string;
  advantage: string;
  context: string;
  citation: string;
}

export interface Improvement {
  structure: string;
  limitation: string;
  suggestion: string;
  citation: string;
}

export interface ProgramStructure {
  trainerStyle: string;
  strengths: Strength[];
  improvements: Improvement[];
  sections: ProgramSection[];
  exerciseDatabase: string[];
}

// File을 Gemini가 읽을 수 있는 Part로 변환
async function fileToPart(file: File) {
  const bytes = await file.arrayBuffer();
  const uint8 = new Uint8Array(bytes);
  // 청크 단위로 base64 변환 (큰 파일 stack overflow 방지)
  let binary = "";
  const chunkSize = 8192;
  for (let i = 0; i < uint8.length; i += chunkSize) {
    binary += String.fromCharCode(...uint8.slice(i, i + chunkSize));
  }
  const base64 = btoa(binary);
  return {
    inlineData: {
      data: base64,
      mimeType: file.type || "application/octet-stream",
    },
  };
}

export async function analyzePrograms(files: File[]): Promise<ProgramStructure> {
  const parts = await Promise.all(files.map(fileToPart));
  const exerciseList = getExerciseListForPrompt();

  const result = await gemini.generateContent([
    ANALYSIS_PROMPT,
    `\n\n--- 기본 운동 DB (정규화 참조용) ---\n${exerciseList}`,
    ...parts,
  ]);

  const text = result.response.text();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("AI 응답에서 구조를 파싱할 수 없습니다.");

  const parsed = JSON.parse(jsonMatch[0]) as ProgramStructure;
  return normalizeStructureExercises(parsed);
}

export async function analyzeProgramText(text: string): Promise<ProgramStructure> {
  const exerciseList = getExerciseListForPrompt();
  const result = await gemini.generateContent([
    ANALYSIS_PROMPT,
    `\n\n--- 기본 운동 DB (정규화 참조용) ---\n${exerciseList}`,
    `아래는 트레이너의 운동 프로그램들입니다:\n\n${text}`,
  ]);

  const responseText = result.response.text();
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("AI 응답에서 구조를 파싱할 수 없습니다.");

  const parsed = JSON.parse(jsonMatch[0]) as ProgramStructure;
  return normalizeStructureExercises(parsed);
}
