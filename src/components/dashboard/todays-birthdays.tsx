"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Cake, Gift, Loader2 } from "lucide-react";
import { getNotificationRoute } from "@/lib/notification-routes";
import { useEmployee } from "@/context/employee-context";
import { useRouter } from "next/navigation";

interface BirthdayWish {
  id: string;
  fromEmployeeId: string;
  fromName: string;
  fromAvatar: string;
  message: string;
  createdAt: string;
}

interface BirthdayCelebrant {
  employeeId: string;
  name: string;
  avatar: string;
  department: string;
  designation: string;
  isToday: boolean;
  wishedByMe: boolean;
  wishes: BirthdayWish[];
}

interface BirthdaysResponse {
  dateKey?: string;
  birthdays?: BirthdayCelebrant[];
}

/**
 * Today's birthday celebrants with community wish messages. Shown on the
 * admin dashboard and the employee self-service dashboard; anyone signed
 * in can write a wish, and everyone can read the wishes collected today.
 */
export function TodaysBirthdays() {
  const router = useRouter();
  const { profile } = useEmployee();
  const [celebrants, setCelebrants] = React.useState<BirthdayCelebrant[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [wishForm, setWishForm] = React.useState<Record<string, string>>({});
  const [wishFormError, setWishFormError] = React.useState<Record<string, string>>({});
  const [loadingFor, setLoadingFor] = React.useState<string | null>(null);

  const loadBirthdays = React.useCallback(async () => {
    try {
      const res = await fetch("/api/birthdays", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as BirthdaysResponse;
      setCelebrants(data.birthdays ?? []);
    } catch {
      // non-critical widget; ignore transient errors
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadBirthdays();
  }, [loadBirthdays]);

  const handleWish = async (celebrant: BirthdayCelebrant) => {
    const message = (wishForm[celebrant.employeeId] || "").trim();

    if (!message) {
      setWishFormError((prev) => ({
        ...prev,
        [celebrant.employeeId]: "Write a short wish message first.",
      }));
      return;
    }

    setLoadingFor(celebrant.employeeId);
    try {
      const res = await fetch("/api/birthdays", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: celebrant.employeeId,
          message,
        }),
      });
      const body = (await res.json().catch(() => ({}))) as { error?: string };

      if (!res.ok) {
        setWishFormError((prev) => ({
          ...prev,
          [celebrant.employeeId]: body.error || "Failed to send the wish.",
        }));
        return;
      }

      setWishForm((prev) => ({ ...prev, [celebrant.employeeId]: "" }));
      setWishFormError((prev) => ({
        ...prev,
        [celebrant.employeeId]: "",
      }));
      await loadBirthdays();
    } catch {
      setWishFormError((prev) => ({
        ...prev,
        [celebrant.employeeId]: "Network error while sending the wish.",
      }));
    } finally {
      setLoadingFor(null);
    }
  };

  const wishesForMe = celebrants.find((c) => c.employeeId === profile.id);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Cake className="h-4 w-4 text-orange-600" />
            <span>Today&apos;s Birthdays</span>
          </CardTitle>
          <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
            {new Date().toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>
        <CardDescription>
          Celebrate today&apos;s birthdays&apos; wish messages for the whole team to see.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-4 flex-1 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8 text-slate-400">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : celebrants.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center rounded-lg border border-dashed border-slate-200">
            <Cake className="h-5 w-5 text-slate-300 mb-2" />
            <p className="text-sm font-medium text-slate-500">No birthdays today</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Check back tomorrow for more celebrations.
            </p>
          </div>
        ) : (
          celebrants.map((celebrant) => (
            <div
              key={celebrant.employeeId}
              className="rounded-xl border border-slate-100 space-y-3"
            >
              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-pink-50/50 border border-pink-100">
                <Avatar
                  src={celebrant.avatar}
                  alt={celebrant.name}
                  fallback={celebrant.name}
                  size="md"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-semibold text-slate-900 truncate">
                      {celebrant.name}
                    </p>
                    <Badge variant="orange" className="text-[10px] py-0 px-1.5">
                      Today!
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate">
                    {celebrant.designation} • {celebrant.department}
                  </p>
                </div>
              </div>

              {(wishesForMe === celebrant && wishesForMe.wishes.length > 0) && (
                <div className="flex items-center justify-between px-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-pink-600">
                    {wishesForMe.wishes.length} wish
                    {wishesForMe.wishes.length > 1 ? "es" : ""} for you today
                  </span>
                  <button
                    type="button"
                    onClick={() => router.push(getNotificationRoute("birthday"))}
                    className="text-[10px] font-semibold text-orange-600 hover:underline cursor-pointer"
                  >
                    See all wishes
                  </button>
                </div>
              )}

              {celebrant.wishes.length > 0 && (
                <div className="space-y-2 max-h-40 overflow-y-auto pr-0.5">
                  {celebrant.wishes.map((wish) => (
                    <div key={wish.id} className="flex items-start gap-2">
                      <Avatar
                        src={wish.fromAvatar}
                        alt={wish.fromName}
                        fallback={wish.fromName}
                        size="sm"
                      />
                      <div className="min-w-0 rounded-xl bg-slate-50 border border-slate-100 px-2.5 py-1.5">
                        <p className="text-[10px] font-bold text-slate-700 truncate">
                          {wish.fromName}
                        </p>
                        <p className="text-[11px] text-slate-600 break-words">
                          {wish.message}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {celebrant.wishedByMe ? (
                <div className="flex items-center gap-1.5 px-1 text-[11px] font-semibold text-emerald-700">
                  <Gift className="h-3.5 w-3.5" />
                  <span>You wished {celebrant.name.split(" ")[0]} today. Thank you!</span>
                </div>
              ) : (
                <div className="space-y-1.5 px-1">
                  <div className="flex gap-1.5">
                    <Input
                      placeholder={`Wish ${celebrant.name.split(" ")[0]} a happy birthday...`}
                      value={wishForm[celebrant.employeeId] || ""}
                      onChange={(e) =>
                        setWishForm((prev) => ({
                          ...prev,
                          [celebrant.employeeId]: e.target.value,
                        }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          void handleWish(celebrant);
                        }
                      }}
                      className="h-9 text-xs"
                      maxLength={500}
                    />
                    <Button
                      size="sm"
                      disabled={loadingFor === celebrant.employeeId}
                      onClick={() => void handleWish(celebrant)}
                      className="h-9 px-3 gap-1.5 shrink-0 bg-orange-600 hover:bg-orange-700 text-white"
                    >
                      {loadingFor === celebrant.employeeId ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Gift className="h-3.5 w-3.5" />
                      )}
                      <span className="text-[11px]">Wish</span>
                    </Button>
                  </div>
                  {wishFormError[celebrant.employeeId] && (
                    <p className="text-[10px] text-red-600 px-0.5">
                      {wishFormError[celebrant.employeeId]}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
