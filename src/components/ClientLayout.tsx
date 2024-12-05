"use client";

import { Session } from "next-auth";

interface ClientLayoutProps {
  children: React.ReactNode;
  session: Session | null;
}

export default function ClientLayout({ children, session }: ClientLayoutProps) {
  return (
    <div>
      {session && <div>Logged in as {session.user?.name}</div>}
      {children}
    </div>
  );
}
