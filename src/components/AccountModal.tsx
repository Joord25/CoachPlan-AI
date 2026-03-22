"use client";

import { useState } from "react";
import { useAuth } from "@/lib/AuthContext";

const tabs = ["개선 요청", "계정", "결제", "연동", "약관"] as const;

export default function AccountModal({ onClose }: { onClose: () => void }) {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("개선 요청");
  const [feedback, setFeedback] = useState("");

  if (!user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[720px] max-h-[80vh] flex overflow-hidden">
        {/* 왼쪽 사이드 */}
        <div className="w-[200px] border-r border-[var(--gray-100)] flex flex-col p-5">
          {/* 프로필 */}
          <div className="flex items-center gap-3 mb-6">
            {user.photoURL ? (
              <img src={user.photoURL} alt="" className="w-10 h-10 rounded-full" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-[var(--primary)] flex items-center justify-center">
                <span className="text-white font-medium">{user.displayName?.[0] || "T"}</span>
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-semibold text-[var(--gray-800)] truncate">{user.displayName}</p>
                <span className="text-[10px] font-medium text-[var(--primary)] bg-[var(--primary-light)] px-1.5 py-0.5 rounded">Free</span>
              </div>
              <p className="text-xs text-[var(--gray-400)] truncate">{user.email}</p>
            </div>
          </div>

          {/* 탭 메뉴 */}
          <nav className="flex-1 space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  activeTab === tab
                    ? "text-[var(--primary)] font-semibold bg-[var(--primary-light)]"
                    : "text-[var(--gray-600)] hover:bg-[var(--gray-50)]"
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>

          {/* 로그아웃 */}
          <button
            onClick={logout}
            className="text-sm text-[var(--gray-400)] hover:text-[var(--gray-600)] text-left px-3 py-2 transition-colors"
          >
            로그아웃
          </button>
        </div>

        {/* 오른쪽 컨텐츠 */}
        <div className="flex-1 p-8 overflow-y-auto">
          {/* 닫기 */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-[var(--gray-400)] hover:text-[var(--gray-600)] transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M5 5l10 10M15 5l-10 10" />
            </svg>
          </button>

          {activeTab === "개선 요청" && (
            <div>
              <h2 className="text-lg font-bold text-[var(--gray-800)] mb-6">개선 요청</h2>
              <div className="space-y-4 text-sm text-[var(--gray-600)] leading-relaxed">
                <p>안녕하세요! AI를 통해 트레이너를 응원하는 코치플랜팀입니다!</p>
                <p>
                  혹시 서비스를 쓰시면서 <strong>&quot;이건 좀 불편하다&quot;</strong>거나,
                  <br />
                  <strong>&quot;이런 기능 있으면 좋을 것 같아&quot;</strong> 하는 아이디어가 있다면 꼭 알려주세요!
                </p>
              </div>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="원하는 기능이나 불편한 점을 자유롭게 적어주세요."
                className="w-full mt-6 p-4 border border-[var(--gray-200)] rounded-xl text-sm text-[var(--gray-700)] placeholder:text-[var(--gray-400)] resize-y min-h-[120px] outline-none focus:border-[var(--primary)] transition-colors"
              />
              <div className="flex justify-end mt-4">
                <button className="px-5 py-2 text-sm border border-[var(--gray-200)] rounded-lg text-[var(--gray-600)] hover:bg-[var(--gray-50)] transition-colors">
                  전송하기
                </button>
              </div>
            </div>
          )}

          {activeTab === "계정" && (
            <div>
              <h2 className="text-lg font-bold text-[var(--gray-800)] mb-6">계정</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-[var(--gray-100)]">
                  <span className="text-sm text-[var(--gray-500)]">이름</span>
                  <span className="text-sm text-[var(--gray-800)]">{user.displayName}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-[var(--gray-100)]">
                  <span className="text-sm text-[var(--gray-500)]">이메일</span>
                  <span className="text-sm text-[var(--gray-800)]">{user.email}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-[var(--gray-100)]">
                  <span className="text-sm text-[var(--gray-500)]">로그인 방식</span>
                  <span className="text-sm text-[var(--gray-800)]">Google</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "결제" && (
            <div>
              <h2 className="text-lg font-bold text-[var(--gray-800)] mb-6">결제</h2>
              <p className="text-sm text-[var(--gray-500)]">현재 Free 플랜을 사용 중입니다.</p>
            </div>
          )}

          {activeTab === "연동" && (
            <div>
              <h2 className="text-lg font-bold text-[var(--gray-800)] mb-6">연동</h2>
              <p className="text-sm text-[var(--gray-500)]">연동된 서비스가 없습니다.</p>
            </div>
          )}

          {activeTab === "약관" && (
            <div>
              <h2 className="text-lg font-bold text-[var(--gray-800)] mb-6">약관</h2>
              <p className="text-sm text-[var(--gray-500)]">서비스 이용약관 및 개인정보처리방침</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
