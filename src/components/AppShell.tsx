"use client";

import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { useEffect } from "react";
import Sidebar from "./Sidebar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === "/login";

  useEffect(() => {
    if (!loading && !user && !isLoginPage) {
      router.replace("/login");
    }
  }, [user, loading, isLoginPage, router]);

  // 로그인 페이지: 사이드바 없이 풀스크린
  if (isLoginPage) {
    return <main className="min-h-full bg-[var(--background)]">{children}</main>;
  }

  // 로딩 중 또는 비로그인 → 리다이렉트 중
  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--background)]">
        <div className="w-10 h-10 border-3 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // 로그인된 상태: 사이드바 + 메인
  return (
    <>
      <Sidebar />
      <main className="ml-[var(--sidebar-collapsed-width)] md:ml-[var(--sidebar-collapsed-width)] min-h-full bg-[var(--background)]">
        {children}
      </main>
    </>
  );
}
