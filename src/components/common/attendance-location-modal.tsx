"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { LocationMapView } from "./location-map-view";
import { AttendanceRecord } from "@/types";
import { Clock, ShieldCheck, MapPin, Camera } from "lucide-react";

interface AttendanceLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: AttendanceRecord | null;
}

export function AttendanceLocationModal({
  isOpen,
  onClose,
  record,
}: AttendanceLocationModalProps) {
  if (!record) return null;

  const geo = record.geo;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Attendance Punch & Geolocation Details"
      description="GPS verification and time-clock audit trail as captured by HRMS Time Clock."
      size="lg"
    >
      <div className="space-y-5">
        {/* Top Info Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-3">
            <Avatar src={record.avatar} alt={record.employeeName} fallback={record.employeeName} size="md" />
            <div>
              <p className="text-sm font-bold text-slate-900">{record.employeeName}</p>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                <span>{record.employeeId}</span>
                <span>•</span>
                <span>{record.role} ({record.department})</span>
                <span>•</span>
                <span className="flex items-center gap-1 font-medium text-slate-700">
                  <Clock className="h-3 w-3 text-orange-600" />
                  In: {record.checkIn || "—"}
                  {record.checkOut && ` • Out: ${record.checkOut}`}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge
              variant={
                record.status === "Present"
                  ? "success"
                  : record.status === "Late"
                  ? "warning"
                  : "info"
              }
              dot
            >
              {record.status}
            </Badge>
            <span className="text-xs font-semibold text-slate-700 bg-white px-2.5 py-1 rounded-md border border-slate-200">
              {record.workHours}
            </span>
          </div>
        </div>

        {/* Location Map View */}
        <div>
          <h4 className="text-xs font-bold text-slate-900 mb-2 flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-orange-600" />
            <span>Captured Geolocation & Geofence</span>
          </h4>
          <LocationMapView geo={geo} fallbackLocation={record.location} />
        </div>

        {/* Verification Selfie & Field Notes (if any) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {geo?.selfieUrl ? (
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center gap-3">
              <div className="relative h-14 w-14 shrink-0 rounded-lg overflow-hidden border border-slate-300 shadow-xs">
                <img
                  src={geo.selfieUrl}
                  alt="Time Clock Selfie"
                  className="h-full w-full object-cover"
                />
                <div className="absolute bottom-0 inset-x-0 bg-black/60 text-center py-0.5">
                  <span className="text-[8px] font-bold text-white uppercase tracking-wider">Selfie</span>
                </div>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 flex items-center gap-1">
                  <Camera className="h-3 w-3 text-emerald-600" />
                  <span>Facial Audit Snapshot</span>
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Captured during clock-in to verify identity & prevent buddy-punching.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl border border-dashed border-slate-200 bg-slate-50/30 flex items-center gap-3 text-slate-400 text-xs">
              <Camera className="h-4 w-4" />
              <span>Selfie verification was optional for this shift</span>
            </div>
          )}

          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
            <p className="text-xs font-bold text-slate-900 flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>Security Audit Trail</span>
            </p>
            <p className="text-[11px] text-slate-600">
              IP: <span className="font-mono text-slate-800">{geo?.ipAddress || "103.114.98.22"}</span>
            </p>
            {geo?.clientName && (
              <p className="text-[11px] text-slate-600">
                Client: <strong className="text-slate-900">{geo.clientName}</strong>
              </p>
            )}
            {geo?.purposeNote && (
              <p className="text-[11px] text-slate-500 italic mt-0.5 line-clamp-2">
                &ldquo;{geo.purposeNote}&rdquo;
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-3 border-t border-slate-100">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close Inspector
          </Button>
        </div>
      </div>
    </Modal>
  );
}
