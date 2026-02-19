"use client";

import { useState, useEffect, useCallback } from "react";
import { Users, UserPlus, Shield, Ban, MoreHorizontal, Search, RefreshCw, Crown, User2, Eye } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AppUser {
  id: string;
  email: string;
  display_name: string;
  role: string;
  created_at: string;
  last_sign_in: string | null;
  banned_at: string | null;
}

interface UsersPanelProps {
  appId: string;
}

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-amber-500/20 text-amber-300",
  editor: "bg-blue-500/20 text-blue-300",
  user: "bg-white/[0.06] text-white/50",
  guest: "bg-white/[0.04] text-white/30",
};

const ROLE_ICONS: Record<string, React.ReactNode> = {
  admin: <Crown className="w-3 h-3" />,
  editor: <Shield className="w-3 h-3" />,
  user: <User2 className="w-3 h-3" />,
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export function UsersPanel({ appId }: UsersPanelProps) {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [stats, setStats] = useState<{ total: number; activeToday: number; newThisWeek: number }>({ total: 0, activeToday: 0, newThisWeek: 0 });
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  const apiBase = typeof window !== "undefined" && window.location.hostname === "localhost" ? "http://localhost:3001" : "";

  const fetchUsers = useCallback(async () => {
    if (appId === "try-mode") return;
    setLoading(true);
    try {
      const [usersRes, statsRes] = await Promise.all([
        fetch(`${apiBase}/sdk/admin/users?limit=50`, { headers: { "X-App-Id": appId, "X-Admin-Token": "studio" } }),
        fetch(`${apiBase}/sdk/admin/stats`, { headers: { "X-App-Id": appId, "X-Admin-Token": "studio" } }),
      ]);
      if (usersRes.ok) {
        const data = await usersRes.json();
        setUsers(data.users || []);
      }
      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data.stats || stats);
      }
    } catch (e) {
      // Silently fail in try-mode
    } finally {
      setLoading(false);
    }
  }, [appId, apiBase]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(search.toLowerCase()) || 
    u.display_name?.toLowerCase().includes(search.toLowerCase())
  );

  if (appId === "try-mode") {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <Users className="w-10 h-10 text-white/20 mb-3" />
        <p className="text-white/40 text-sm">User management</p>
        <p className="text-white/25 text-xs mt-1 max-w-[240px]">
          Deploy your app to start collecting users. You&apos;ll see signups, roles, and activity here.
        </p>
        <div className="mt-6 grid grid-cols-3 gap-3 w-full px-2">
          {[
            { label: "Users", value: "—", color: "text-indigo-400" },
            { label: "Active", value: "—", color: "text-emerald-400" },
            { label: "New", value: "—", color: "text-amber-400" },
          ].map((s, i) => (
            <div key={i} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] text-center">
              <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
              <p className="text-[10px] text-white/30 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-2 p-3 border-b border-white/[0.04]">
        {[
          { label: "Total", value: stats.total, color: "text-indigo-400" },
          { label: "Active Today", value: stats.activeToday, color: "text-emerald-400" },
          { label: "New This Week", value: stats.newThisWeek, color: "text-amber-400" },
        ].map((s, i) => (
          <div key={i} className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] text-center">
            <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
            <p className="text-[10px] text-white/30 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search + refresh */}
      <div className="flex items-center gap-2 p-3 border-b border-white/[0.04]">
        <div className="flex-1 relative">
          <Search className="w-3.5 h-3.5 text-white/20 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            className="w-full bg-white/[0.04] border border-white/[0.06] rounded-lg pl-8 pr-3 py-1.5 text-xs text-white outline-none focus:border-indigo-500/50"
          />
        </div>
        <button
          onClick={fetchUsers}
          className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center text-white/30 hover:text-white/60 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* User list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {loading && users.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-5 h-5 text-white/20 animate-spin" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-8 h-8 text-white/10 mx-auto mb-2" />
            <p className="text-xs text-white/30">{search ? "No matching users" : "No users yet"}</p>
          </div>
        ) : (
          filteredUsers.map((user) => (
            <motion.button
              key={user.id}
              onClick={() => setSelectedUser(selectedUser === user.id ? null : user.id)}
              className={`w-full text-left p-3 rounded-xl transition-all ${
                selectedUser === user.id
                  ? "bg-indigo-500/10 border border-indigo-500/20"
                  : "bg-white/[0.02] border border-transparent hover:bg-white/[0.04]"
              }`}
              whileTap={{ scale: 0.99 }}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500/30 to-purple-500/30 flex items-center justify-center text-xs font-bold text-white/60 flex-shrink-0">
                  {(user.display_name || user.email)[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white/70 truncate">{user.display_name || "No name"}</p>
                  <p className="text-[11px] text-white/30 truncate">{user.email}</p>
                </div>
                <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${ROLE_COLORS[user.role] || ROLE_COLORS.user}`}>
                  {ROLE_ICONS[user.role]}
                  {user.role}
                </span>
              </div>

              <AnimatePresence>
                {selectedUser === user.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 pt-3 border-t border-white/[0.04] space-y-2">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-white/30">Joined</span>
                        <span className="text-white/50">{timeAgo(user.created_at)}</span>
                      </div>
                      {user.last_sign_in && (
                        <div className="flex justify-between text-[11px]">
                          <span className="text-white/30">Last active</span>
                          <span className="text-white/50">{timeAgo(user.last_sign_in)}</span>
                        </div>
                      )}
                      {user.banned_at && (
                        <div className="px-2 py-1 rounded bg-red-500/10 text-red-400 text-[10px]">
                          ⚠️ Banned {timeAgo(user.banned_at)}
                        </div>
                      )}
                      <div className="flex gap-2 pt-1">
                        <button className="flex-1 py-1.5 rounded-lg bg-white/[0.04] text-[11px] text-white/40 hover:text-white/60 transition-colors">
                          Change Role
                        </button>
                        <button className="flex-1 py-1.5 rounded-lg bg-red-500/5 text-[11px] text-red-400/60 hover:text-red-400 transition-colors">
                          {user.banned_at ? "Unban" : "Ban"}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          ))
        )}
      </div>
    </div>
  );
}
