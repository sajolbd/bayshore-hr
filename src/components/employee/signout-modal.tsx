"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { useAuth } from "@/context/auth-context";
import { LogOut } from "lucide-react";

export function SignOutModal() {
  const { currentUser, isSignOutModalOpen, setIsSignOutModalOpen, signOut } = useAuth();

  if (!currentUser) return null;

  return (
    <Modal
      isOpen={isSignOutModalOpen}
      onClose={() => setIsSignOutModalOpen(false)}
      title="Sign Out Confirmation"
      size="sm"
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
          <Avatar
            src={currentUser.avatar}
            alt={currentUser.name}
            fallback={currentUser.name}
            size="md"
          />
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-900 truncate">
              {currentUser.name}
            </p>
            <p className="text-[11px] text-slate-500 truncate">
              {currentUser.email}
            </p>
            <span className="text-[10px] font-semibold text-orange-600">
              Role: {currentUser.role}
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-600">
          Are you sure you want to log out of your administrative session? You will need your corporate credentials to sign back in.
        </p>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsSignOutModalOpen(false)}
          >
            Stay Signed In
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={signOut}
            className="gap-2"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
}

