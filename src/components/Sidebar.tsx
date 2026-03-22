"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import AccountModal from "./AccountModal";

const menuItems = [
  {
    id: "new-program",
    label: "새 프로그램 생성",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M10 4v12M4 10h12" />
      </svg>
    ),
  },
  {
    id: "members",
    label: "회원 관리",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="10" cy="7" r="3" />
        <path d="M4 17c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      </svg>
    ),
  },
  {
    id: "programs",
    label: "프로그램 현황",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="14" height="14" rx="2" />
        <path d="M7 8h6M7 12h4" />
      </svg>
    ),
  },
  {
    id: "history",
    label: "히스토리",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="10" cy="10" r="7" />
        <path d="M10 6v4l2.5 2.5" />
      </svg>
    ),
  },
];

export default function Sidebar() {
  const { user, loginWithGoogle } = useAuth();
  const [hovered, setHovered] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState("new-program");
  const [showAccount, setShowAccount] = useState(false);

  // 스와이프 감지
  const touchStartX = useRef(0);
  const sidebarRef = useRef<HTMLElement>(null);

  // 화면 왼쪽 가장자리에서 오른쪽으로 스와이프 → 사이드바 열기
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      touchStartX.current = e.touches[0].clientX;
    };
    const handleTouchEnd = (e: TouchEvent) => {
      const deltaX = e.changedTouches[0].clientX - touchStartX.current;
      // 왼쪽 가장자리(30px 이내)에서 시작 + 오른쪽으로 60px 이상 스와이프
      if (touchStartX.current < 30 && deltaX > 60) {
        setMobileOpen(true);
      }
      // 사이드바 위에서 왼쪽으로 스와이프 → 닫기
      if (deltaX < -60 && sidebarRef.current?.contains(e.target as Node)) {
        setMobileOpen(false);
      }
    };
    document.addEventListener("touchstart", handleTouchStart, { passive: true });
    document.addEventListener("touchend", handleTouchEnd, { passive: true });
    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

  const expanded = hovered || mobileOpen;

  const handleTouchToggle = useCallback(() => {
    setMobileOpen((prev) => !prev);
  }, []);

  return (
    <>
      {/* 배경 딤 오버레이 */}
      <div
        className={`fixed inset-0 bg-black/20 z-30 transition-opacity duration-200 ${
          expanded ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMobileOpen(false)}
        onMouseEnter={() => setHovered(false)}
      />

      <aside
        ref={sidebarRef}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={`fixed top-0 left-0 h-full bg-white border-r border-[var(--gray-200)] flex flex-col z-40 transition-all duration-200 ${
          expanded
            ? "w-[var(--sidebar-width)] shadow-lg"
            : "w-[var(--sidebar-collapsed-width)]"
        }`}
      >
        {/* Logo — 터치 시 토글 */}
        <div
          className="flex items-center h-16 px-4 border-b border-[var(--gray-100)] cursor-pointer"
          onClick={handleTouchToggle}
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-[var(--primary)] flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">CP</span>
            </div>
            {expanded && (
              <span className="font-semibold text-[var(--gray-800)] whitespace-nowrap">
                CoachPlan
              </span>
            )}
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 py-4 px-2 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveMenu(item.id);
                setMobileOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors text-sm ${
                activeMenu === item.id
                  ? "bg-[var(--primary-light)] text-[var(--primary-dark)] font-medium"
                  : "text-[var(--gray-600)] hover:bg-[var(--gray-50)]"
              }`}
              title={item.label}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              {expanded && <span className="whitespace-nowrap">{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Bottom: User */}
        <div className="border-t border-[var(--gray-100)] p-2">
          {user ? (
            <button
              onClick={() => setShowAccount(true)}
              className="w-full flex items-center gap-2 px-2 py-3 rounded-lg hover:bg-[var(--gray-50)] transition-colors"
              title="계정 관리"
            >
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt=""
                  className="min-w-8 w-8 h-8 rounded-full flex-shrink-0"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="min-w-8 w-8 h-8 rounded-full bg-[var(--primary)] flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-medium">
                    {user.displayName?.[0] || "T"}
                  </span>
                </div>
              )}
              {expanded && (
                <>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-medium text-[var(--gray-800)] truncate text-left">
                        {user.displayName || "트레이너"}
                      </p>
                      <span className="text-[10px] font-medium text-[var(--primary)] bg-[var(--primary-light)] px-1.5 py-0.5 rounded flex-shrink-0">Free</span>
                    </div>
                    <p className="text-xs text-[var(--gray-400)] truncate text-left">
                      {user.email}
                    </p>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="var(--gray-400)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                    <circle cx="10" cy="10" r="7" />
                    <path d="M10 7v0M10 10v3" />
                  </svg>
                </>
              )}
            </button>
          ) : (
            <button
              onClick={loginWithGoogle}
              className="w-full flex items-center justify-center gap-3 px-2 py-3 rounded-lg hover:bg-[var(--gray-50)] transition-colors"
              title="로그인"
            >
              <div className="min-w-8 w-8 h-8 rounded-full bg-[var(--gray-200)] flex items-center justify-center flex-shrink-0">
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="var(--gray-500)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="10" cy="7" r="3" />
                  <path d="M4 17c0-3.3 2.7-6 6-6s6 2.7 6 6" />
                </svg>
              </div>
              {expanded && (
                <span className="text-sm text-[var(--gray-600)]">로그인</span>
              )}
            </button>
          )}
        </div>
      </aside>

      {/* 계정 관리 모달 */}
      {showAccount && <AccountModal onClose={() => setShowAccount(false)} />}
    </>
  );
}
