import React from "react";
import { useAuth } from "../../context/AuthContext";

export const AdminHeader = ({ title }) => {
  const { user } = useAuth();

  return (
    <header className="flex h-16 items-center justify-between border-b border-zinc-800 bg-zinc-950/60 px-6 backdrop-blur-md">
      <h1 className="text-xl font-bold text-white tracking-tight">{title}</h1>
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-xs font-bold text-purple-300">
          {user?.firstName?.[0] || "A"}
        </div>
        <div className="text-left">
          <p className="text-xs font-semibold text-zinc-200">{user?.firstName} {user?.lastName}</p>
          <p className="text-[10px] text-purple-400 uppercase tracking-wider font-semibold">Administrator</p>
        </div>
      </div>
    </header>
  );
};
