// ohunjal-ai workout.ts 에서 추출한 기본 운동 DB
// 카테고리별 한국어 이름 + 별칭(alias) 검색 지원

export interface ExerciseEntry {
  name: string;
  aliases: string[]; // 영어, 약어, 다른 한글 표기
}

export interface ExerciseCategory {
  label: string;
  keywords: string[];
  exercises: ExerciseEntry[];
}

export const BASE_EXERCISE_DB: ExerciseCategory[] = [
  {
    label: "웜업",
    keywords: ["웜업", "warmup", "warm-up", "스트레칭", "stretch", "동적", "폼롤러", "foam roller"],
    exercises: [
      { name: "폼롤러 흉추 스트레칭", aliases: ["foam roller thoracic", "폼롤러 등", "thoracic extension"] },
      { name: "캣-카멜 스트레칭", aliases: ["cat camel", "cat cow", "고양이 낙타"] },
      { name: "벽 엔젤", aliases: ["wall angel", "월 엔젤"] },
      { name: "날개뼈 푸쉬업 플러스", aliases: ["scapular push-up", "견갑골 푸쉬업"] },
      { name: "밴드 페이스 풀", aliases: ["band face pull", "페이스풀"] },
      { name: "동적 흉근 스트레칭", aliases: ["dynamic pec stretch", "가슴 스트레칭"] },
      { name: "동적 흉추 회전", aliases: ["thoracic rotation", "흉추 로테이션"] },
      { name: "숄더 CARs", aliases: ["shoulder CARs", "어깨 CARs", "어깨 가동성"] },
      { name: "힙 CARs", aliases: ["hip CARs", "고관절 CARs", "고관절 가동성"] },
      { name: "폼롤러 둔근 및 햄스트링 이완", aliases: ["foam roller glutes hamstrings", "엉덩이 폼롤러"] },
      { name: "동적 고관절 굴곡근 스트레칭", aliases: ["hip flexor stretch", "장요근 스트레칭"] },
      { name: "고블렛 스쿼트 프라잉", aliases: ["prying goblet squat"] },
      { name: "고관절 90/90 스트레치", aliases: ["90/90 stretch", "90 90 hip"] },
      { name: "내전근 동적 스트레칭", aliases: ["adductor stretch", "내전근 스트레칭"] },
      { name: "스파이더맨 런지", aliases: ["spiderman lunge", "스파이더맨 스트레치"] },
      { name: "동적 다리 스윙", aliases: ["leg swing", "다리 스윙", "dynamic leg swing"] },
      { name: "고관절 회전", aliases: ["hip circle", "힙 써클"] },
      { name: "밴드 워크", aliases: ["band walk", "미니밴드 워크"] },
      { name: "앞벅지 스트레칭", aliases: ["hip flexor stretch", "장요근"] },
      { name: "고양이-낙타 자세", aliases: ["cat cow", "cat camel", "캣카우"] },
      { name: "월 슬라이드", aliases: ["wall slide", "벽 슬라이드"] },
      { name: "밴드 풀 어파트", aliases: ["band pull apart", "밴드 풀어파트"] },
      { name: "팔 흔들기", aliases: ["arm swing", "arm circles"] },
      { name: "동적 런지", aliases: ["dynamic lunge", "워킹 런지 웜업"] },
      { name: "어깨 돌리기", aliases: ["shoulder circle", "숄더 써클"] },
    ],
  },
  {
    label: "가슴",
    keywords: ["가슴", "chest", "푸쉬", "push", "벤치", "bench", "흉근"],
    exercises: [
      { name: "바벨 벤치 프레스", aliases: ["barbell bench press", "벤치프레스", "BB 벤치", "플랫 벤치"] },
      { name: "덤벨 벤치 프레스", aliases: ["dumbbell bench press", "DB 벤치", "덤벨 플랫"] },
      { name: "디클라인 벤치 프레스", aliases: ["decline bench press", "디클라인"] },
      { name: "헤머 벤치 프레스", aliases: ["hammer bench", "해머 벤치"] },
      { name: "웨이티드 푸쉬업", aliases: ["weighted push-up", "중량 푸쉬업"] },
      { name: "케틀벨 플로어 프레스", aliases: ["kettlebell floor press", "KB 플로어 프레스"] },
      { name: "체스트 프레스 머신", aliases: ["chest press machine", "가슴 머신"] },
      { name: "인클라인 덤벨 프레스", aliases: ["incline dumbbell press", "인클라인 프레스", "경사 벤치"] },
      { name: "인클라인 덤벨 플라이", aliases: ["incline dumbbell fly", "인클라인 플라이"] },
      { name: "케이블 크로스오버", aliases: ["cable crossover", "크로스오버"] },
      { name: "케이블 체스트 프레스", aliases: ["cable chest press"] },
      { name: "펙덱 플라이", aliases: ["pec deck fly", "펙덱", "펙 플라이"] },
      { name: "중량 딥스", aliases: ["weighted dips", "웨이티드 딥스"] },
      { name: "랜드마인 프레스", aliases: ["landmine press"] },
      { name: "가슴 딥스", aliases: ["chest dips", "딥스"] },
      { name: "푸쉬업", aliases: ["push-up", "push up", "팔굽혀펴기"] },
      { name: "니 푸쉬업", aliases: ["knee push-up", "무릎 푸쉬업"] },
      { name: "다이아몬드 푸쉬업", aliases: ["diamond push-up"] },
      { name: "와이드 푸쉬업", aliases: ["wide push-up", "넓은 푸쉬업"] },
      { name: "아처 푸쉬업", aliases: ["archer push-up"] },
      { name: "힌두 푸쉬업", aliases: ["hindu push-up"] },
    ],
  },
  {
    label: "어깨",
    keywords: ["어깨", "shoulder", "숄더", "델트", "delt"],
    exercises: [
      { name: "오버헤드 프레스", aliases: ["overhead press", "OHP", "숄더 프레스"] },
      { name: "덤벨 숄더 프레스", aliases: ["dumbbell shoulder press", "DB 숄더프레스", "시티드 프레스"] },
      { name: "아놀드 프레스", aliases: ["arnold press"] },
      { name: "케틀벨 오버헤드 프레스", aliases: ["kettlebell overhead press", "KB OHP"] },
      { name: "밀리터리 프레스", aliases: ["military press"] },
      { name: "사이드 레터럴 레이즈", aliases: ["side lateral raise", "사레레", "측면 레이즈", "lateral raise"] },
      { name: "프론트 레터럴 레이즈", aliases: ["front raise", "프론트 레이즈", "전면 레이즈"] },
      { name: "벤트 오버 레터럴 레이즈", aliases: ["bent over lateral raise", "벤트오버 레이즈", "리어 레이즈"] },
      { name: "케이블 레터럴 레이즈", aliases: ["cable lateral raise", "케이블 사레레"] },
      { name: "업라이트 로우", aliases: ["upright row"] },
    ],
  },
  {
    label: "삼두",
    keywords: ["삼두", "트라이셉", "tricep", "triceps"],
    exercises: [
      { name: "트라이셉 로프 푸쉬다운", aliases: ["tricep rope pushdown", "로프 푸쉬다운", "삼두 푸쉬다운"] },
      { name: "스컬 크러셔", aliases: ["skullcrusher", "skull crusher", "라잉 트라이셉"] },
      { name: "오버헤드 트라이셉 익스텐션", aliases: ["overhead tricep extension", "삼두 익스텐션"] },
      { name: "케이블 푸쉬 다운", aliases: ["cable pushdown", "푸쉬다운"] },
      { name: "케이블 오버헤드 트라이셉 익스텐션", aliases: ["cable overhead tricep extension"] },
      { name: "트라이셉스 킥백", aliases: ["tricep kickback", "킥백"] },
      { name: "트라이셉스 딥스", aliases: ["tricep dips", "벤치 딥스"] },
    ],
  },
  {
    label: "등",
    keywords: ["등", "back", "풀", "pull", "로우", "row", "광배"],
    exercises: [
      { name: "풀업", aliases: ["pull-up", "pull up", "턱걸이"] },
      { name: "중량 풀업", aliases: ["weighted pull-up", "웨이티드 풀업"] },
      { name: "랫 풀다운", aliases: ["lat pulldown", "렛 풀다운", "랫풀"] },
      { name: "친업", aliases: ["chin-up", "chin up", "역수 풀업"] },
      { name: "중량 친업", aliases: ["weighted chin-up"] },
      { name: "어시스티드 풀업", aliases: ["assisted pull-up", "보조 풀업", "풀업 머신"] },
      { name: "원 암 랫 풀다운", aliases: ["one arm lat pulldown", "원암 렛풀"] },
      { name: "바벨 로우", aliases: ["barbell row", "BB 로우", "벤트오버 로우"] },
      { name: "펜들레이 로우", aliases: ["pendlay row"] },
      { name: "티바 로우", aliases: ["t-bar row", "T바 로우"] },
      { name: "케틀벨 고릴라 로우", aliases: ["kettlebell gorilla row", "고릴라 로우"] },
      { name: "인버티드 로우", aliases: ["inverted row", "역방향 로우"] },
      { name: "하이로우 머신", aliases: ["high row machine", "하이로우"] },
      { name: "싱글 암 덤벨 로우", aliases: ["single arm dumbbell row", "원암 로우", "원 암 덤벨 로우", "DB 로우"] },
      { name: "시티드 케이블 로우", aliases: ["seated cable row", "시티드 로우"] },
      { name: "체스트 서포티드 로우", aliases: ["chest supported row", "가슴 지지 로우"] },
      { name: "케이블 로우", aliases: ["cable row"] },
      { name: "백익스텐션 머신", aliases: ["back extension", "백 익스텐션", "등 신전"] },
      { name: "슈퍼맨 동작", aliases: ["superman", "슈퍼맨"] },
    ],
  },
  {
    label: "이두",
    keywords: ["이두", "바이셉", "bicep", "biceps", "컬", "curl"],
    exercises: [
      { name: "바벨 컬", aliases: ["barbell curl", "BB 컬"] },
      { name: "해머 컬", aliases: ["hammer curl"] },
      { name: "인클라인 덤벨 컬", aliases: ["incline dumbbell curl", "인클라인 컬"] },
      { name: "케이블 바이셉 컬", aliases: ["cable bicep curl", "케이블 컬"] },
      { name: "덤벨 프리쳐 컬", aliases: ["dumbbell preacher curl", "프리쳐 컬"] },
      { name: "덤벨 컬", aliases: ["dumbbell curl", "DB 컬"] },
      { name: "프리처 컬 머신", aliases: ["preacher curl machine"] },
      { name: "오버헤드 케이블 바이셉 컬", aliases: ["overhead cable bicep curl"] },
    ],
  },
  {
    label: "하체",
    keywords: ["하체", "다리", "leg", "스쿼트", "squat", "런지", "lunge", "둔근", "glute"],
    exercises: [
      { name: "바벨 백 스쿼트", aliases: ["barbell back squat", "백 스쿼트", "BB 스쿼트", "바벨 스쿼트"] },
      { name: "프론트 스쿼트", aliases: ["front squat"] },
      { name: "고블렛 스쿼트", aliases: ["goblet squat", "고블릿 스쿼트"] },
      { name: "케틀벨 고블릿 스쿼트", aliases: ["kettlebell goblet squat", "KB 고블릿"] },
      { name: "루마니안 데드리프트", aliases: ["romanian deadlift", "RDL", "루마니안 DL", "루데"] },
      { name: "컨벤셔널 데드리프트", aliases: ["conventional deadlift", "데드리프트", "DL", "바벨 데드리프트"] },
      { name: "케틀벨 스윙", aliases: ["kettlebell swing", "KB 스윙"] },
      { name: "케틀벨 데드리프트", aliases: ["kettlebell deadlift", "KB DL"] },
      { name: "워킹 런지", aliases: ["walking lunge", "걸음 런지"] },
      { name: "불가리안 스플릿 스쿼트", aliases: ["bulgarian split squat", "BSS", "불가리안", "후방발 올린 스쿼트"] },
      { name: "리버스 런지", aliases: ["reverse lunge", "후방 런지", "백 런지"] },
      { name: "레그 프레스", aliases: ["leg press"] },
      { name: "레그 익스텐션", aliases: ["leg extension", "레그 컬", "다리 펴기"] },
      { name: "힙 쓰러스트", aliases: ["hip thrust", "힙쓰러스트", "브릿지"] },
      { name: "덤벨 힙 쓰러스트", aliases: ["dumbbell hip thrust", "DB 힙쓰러스트"] },
      { name: "케이블 풀 스루", aliases: ["cable pull-through", "케이블 풀스루"] },
      { name: "스탠딩 카프 레이즈", aliases: ["standing calf raise", "카프레이즈", "종아리"] },
      { name: "시티드 카프 레이즈", aliases: ["seated calf raise"] },
      { name: "싱글 레그 데드리프트", aliases: ["single leg deadlift", "원 레그 데드리프트", "one leg DL", "SL RDL", "원레그 DL", "한다리 데드리프트", "single leg RDL"] },
    ],
  },
  {
    label: "코어",
    keywords: ["코어", "core", "복근", "abs", "플랭크", "plank", "복부"],
    exercises: [
      { name: "플랭크", aliases: ["plank", "전면 플랭크"] },
      { name: "사이드 플랭크", aliases: ["side plank", "측면 플랭크"] },
      { name: "플랭크 숄더 탭", aliases: ["plank shoulder tap", "숄더탭"] },
      { name: "러시안 트위스트", aliases: ["russian twist"] },
      { name: "데드버그", aliases: ["deadbug", "dead bug"] },
      { name: "버드 독", aliases: ["bird dog", "버드독"] },
      { name: "행잉 레그 레이즈", aliases: ["hanging leg raise", "행잉 레그레이즈", "매달려 다리 올리기"] },
      { name: "Ab 휠 롤아웃", aliases: ["ab wheel rollout", "복근 롤아웃", "ab roller"] },
      { name: "크런치", aliases: ["crunch", "윗몸일으키기"] },
      { name: "바이시클 크런치", aliases: ["bicycle crunch", "자전거 크런치"] },
      { name: "오블리크 크런치", aliases: ["oblique crunch", "사선 크런치"] },
      { name: "리버스 크런치", aliases: ["reverse crunch"] },
      { name: "마운틴 클라이머", aliases: ["mountain climber", "마운틴 클라이밍"] },
      { name: "레그 레이즈", aliases: ["leg raise", "다리 올리기"] },
      { name: "케이블 크런치", aliases: ["cable crunch"] },
      { name: "브이 업", aliases: ["v-up", "v up", "V업"] },
    ],
  },
  {
    label: "전신",
    keywords: ["전신", "full body", "풀바디", "컴파운드", "compound"],
    exercises: [
      { name: "덤벨 쓰러스터", aliases: ["dumbbell thruster", "쓰러스터"] },
      { name: "케틀벨 스윙", aliases: ["kettlebell swing", "KB 스윙"] },
      { name: "케틀벨 고블릿 스쿼트", aliases: ["kettlebell goblet squat"] },
      { name: "바벨 백 스쿼트", aliases: ["barbell back squat"] },
      { name: "오버헤드 프레스", aliases: ["overhead press", "OHP"] },
      { name: "케이블 로우", aliases: ["cable row"] },
      { name: "덤벨 로우", aliases: ["dumbbell row", "DB 로우"] },
      { name: "고블렛 스쿼트", aliases: ["goblet squat"] },
      { name: "원 레그 루마니안 데드리프트", aliases: ["single leg RDL", "원레그 RDL", "SL RDL"] },
    ],
  },
  {
    label: "모빌리티",
    keywords: ["모빌리티", "mobility", "가동성", "유연성", "요가", "yoga", "스트레칭"],
    exercises: [
      { name: "고양이-소 자세", aliases: ["cat cow", "cat-cow pose", "캣카우"] },
      { name: "90/90 힙 로테이션", aliases: ["90/90 hip rotation", "90 90 스트레치"] },
      { name: "흉추 회전 스트레칭", aliases: ["thoracic rotation stretch"] },
      { name: "딥 스쿼트 홀드", aliases: ["deep squat hold", "말라사나"] },
      { name: "세계에서 가장 위대한 스트레치", aliases: ["world's greatest stretch", "WGS"] },
      { name: "월 앵클 모빌리티", aliases: ["wall ankle mobility", "발목 가동성"] },
      { name: "나비 자세", aliases: ["butterfly pose", "합장 자세"] },
      { name: "개구리 자세", aliases: ["frog pose"] },
      { name: "피죤 자세", aliases: ["pigeon pose", "비둘기 자세"] },
      { name: "월 스쿼트", aliases: ["wall squat", "벽 스쿼트"] },
      { name: "악어 스트레칭", aliases: ["alligator stretch"] },
      { name: "스파이더맨 스트레치", aliases: ["spiderman stretch"] },
    ],
  },
];

// 전체 운동 목록 (중복 제거, 정규화된 이름만)
export const ALL_EXERCISES: string[] = [
  ...new Set(BASE_EXERCISE_DB.flatMap((cat) => cat.exercises.map((e) => e.name))),
];

// 전체 운동 목록 (카테고리별 이름 리스트, AI 프롬프트 주입용)
export function getExerciseListForPrompt(): string {
  return BASE_EXERCISE_DB
    .map((cat) => `[${cat.label}] ${cat.exercises.map((e) => e.name).join(", ")}`)
    .join("\n");
}

// alias 역매핑 테이블 (lazy init)
let _aliasMap: Map<string, string> | null = null;
function getAliasMap(): Map<string, string> {
  if (_aliasMap) return _aliasMap;
  _aliasMap = new Map();
  for (const cat of BASE_EXERCISE_DB) {
    for (const ex of cat.exercises) {
      // 정규화된 이름 자체도 등록
      _aliasMap.set(ex.name.toLowerCase(), ex.name);
      for (const alias of ex.aliases) {
        _aliasMap.set(alias.toLowerCase(), ex.name);
      }
    }
  }
  return _aliasMap;
}

// 운동명 정규화 — alias 매칭되면 canonical name 반환, 없으면 원본 반환
export function normalizeExerciseName(raw: string): string {
  const map = getAliasMap();
  const lower = raw.trim().toLowerCase();
  // 정확히 매칭
  if (map.has(lower)) return map.get(lower)!;
  // 부분 매칭 (예: "one leg DL" → 포함하는 alias 찾기)
  for (const [alias, canonical] of map) {
    if (alias.includes(lower) || lower.includes(alias)) {
      return canonical;
    }
  }
  return raw.trim();
}

// ProgramStructure 전체 정규화
export function normalizeStructureExercises<T extends { sections: { typicalExercises: string[]; exerciseEvidence?: Record<string, unknown> }[]; exerciseDatabase: string[] }>(
  structure: T
): T {
  return {
    ...structure,
    sections: structure.sections.map((sec) => {
      // exerciseEvidence 키도 정규화
      let normalizedEvidence = sec.exerciseEvidence;
      if (sec.exerciseEvidence) {
        normalizedEvidence = {};
        for (const [key, val] of Object.entries(sec.exerciseEvidence)) {
          const normalized = normalizeExerciseName(key);
          normalizedEvidence[normalized] = val;
        }
      }
      return {
        ...sec,
        typicalExercises: sec.typicalExercises.map(normalizeExerciseName),
        exerciseEvidence: normalizedEvidence,
      };
    }),
    exerciseDatabase: [...new Set(structure.exerciseDatabase.map(normalizeExerciseName))],
  };
}

// 운동명이 기본 DB에 존재하는지 확인
export function isKnownExercise(name: string): boolean {
  const map = getAliasMap();
  return map.has(name.trim().toLowerCase());
}

// 운동 검색 함수 — 이름, 별칭, 카테고리 키워드 통합 검색
export function searchExercises(query: string): { label: string; exercise: string }[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  const results: { label: string; exercise: string }[] = [];

  for (const cat of BASE_EXERCISE_DB) {
    const catMatch = cat.keywords.some((kw) => kw.toLowerCase().includes(q));
    for (const ex of cat.exercises) {
      const nameMatch = ex.name.toLowerCase().includes(q);
      const aliasMatch = ex.aliases.some((a) => a.toLowerCase().includes(q));
      if (catMatch || nameMatch || aliasMatch) {
        results.push({ label: cat.label, exercise: ex.name });
      }
    }
  }

  // 중복 제거
  const seen = new Set<string>();
  return results.filter((r) => {
    if (seen.has(r.exercise)) return false;
    seen.add(r.exercise);
    return true;
  });
}
