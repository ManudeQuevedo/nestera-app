"use client";

import { useState } from "react";
import { Link } from "@/navigation";
import { useTranslations } from "next-intl";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LayoutDashboard, LogOut, Settings } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "@/navigation";

interface UserMenuDropdownProps {
  user: {
    id: string;
    email?: string;
    user_metadata?: {
      full_name?: string;
      avatar_url?: string;
    };
  };
}

export function UserMenuDropdown({ user }: UserMenuDropdownProps) {
  const t = useTranslations("Landing.nav"); // Assuming we reuse nav translations or add new ones
  const router = useRouter();
  const userName =
    user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";
  const userInitials = userName.slice(0, 2).toUpperCase();
  const avatarUrl = user?.user_metadata?.avatar_url;

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="rounded-full h-9 w-9 border border-transparent hover:border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all">
          <Avatar className="h-9 w-9 ring-2 ring-white shadow-sm">
            <AvatarImage src={avatarUrl} />
            <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-[10px] text-white font-bold">
              {userInitials}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-56 bg-white/95 backdrop-blur-xl border-slate-100 text-slate-700 rounded-xl p-1 shadow-xl shadow-slate-200/50 mt-2">
        <div className="px-2 py-2">
          <p className="text-xs font-semibold text-slate-900 truncate">
            {userName}
          </p>
          <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
        </div>
        <DropdownMenuSeparator className="bg-slate-100 my-1" />

        <Link href="/dashboard">
          <DropdownMenuItem className="focus:bg-emerald-50 focus:text-emerald-700 cursor-pointer rounded-lg text-xs font-medium py-2">
            <LayoutDashboard className="h-3.5 w-3.5 mr-2" />
            {t("goToDashboard") || "Dashboard"}
          </DropdownMenuItem>
        </Link>

        <Link href="/dashboard?action=settings">
          <DropdownMenuItem className="focus:bg-emerald-50 focus:text-emerald-700 cursor-pointer rounded-lg text-xs font-medium py-2">
            <Settings className="h-3.5 w-3.5 mr-2" />
            {t("settings") || "Settings"}
          </DropdownMenuItem>
        </Link>

        <DropdownMenuSeparator className="bg-slate-100 my-1" />

        <DropdownMenuItem
          onClick={handleSignOut}
          className="text-red-500 focus:text-red-600 focus:bg-red-50 cursor-pointer rounded-lg text-xs font-medium py-2">
          <LogOut className="h-3.5 w-3.5 mr-2" />
          {t("logout") || "Sign out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
