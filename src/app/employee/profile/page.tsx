"use client";

import * as React from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building,
  Shield,
  Award,
  GraduationCap,
  FileText,
  Edit3,
  Heart,
  Download,
} from "lucide-react";
import { useEmployee } from "@/context/employee-context";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EditProfileModal } from "@/components/employee/edit-profile-modal";

export default function EmployeeProfilePage() {
  const { profile } = useEmployee();
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);

  return (
    <div className="space-y-6">
      {/* Profile Header Hero Card */}
      <div className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-xs overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-r from-orange-500/10 via-orange-500/20 to-amber-500/10" />

        <div className="relative pt-6 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
            <div className="ring-4 ring-white rounded-2xl shadow-md bg-white">
              <Avatar
                src={profile.avatar}
                alt={profile.name}
                fallback={profile.name.substring(0, 2).toUpperCase()}
                size="xl"
                status="online"
                className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl"
              />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  {profile.name}
                </h1>
                <Badge variant="warning">{profile.id}</Badge>
                <Badge variant="success">Active Full-Time</Badge>
              </div>
              <p className="text-sm font-medium text-slate-600 mt-1">
                {profile.role} • {profile.department} Department
              </p>
              <div className="flex items-center gap-3 mt-2 text-xs text-slate-500 flex-wrap">
                <span className="flex items-center gap-1">
                  <Building className="h-3.5 w-3.5 text-slate-400" />
                  Bayshore Communication Ltd.
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  Joined {profile.joinDate}
                </span>
              </div>
            </div>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsEditModalOpen(true)}
            className="gap-2 shrink-0 bg-orange-600 hover:bg-orange-700 shadow-sm"
          >
            <Edit3 className="h-4 w-4" />
            <span>Edit Personal Info</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Personal & Employment Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal & Contact Information */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <User className="h-4 w-4 text-orange-600" />
                Personal & Contact Details
              </h3>
              <span className="text-[11px] text-slate-400">Employee Managed</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">OFFICIAL WORK EMAIL</span>
                <div className="flex items-center gap-2 mt-1 font-semibold text-slate-800">
                  <Mail className="h-3.5 w-3.5 text-slate-400" />
                  <span>{profile.email}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">PRIMARY CONTACT (WHATSAPP)</span>
                <div className="flex items-center gap-2 mt-1 font-semibold text-slate-800">
                  <Phone className="h-3.5 w-3.5 text-slate-400" />
                  <span>{profile.phone}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">DATE OF BIRTH</span>
                <div className="flex items-center gap-2 mt-1 font-semibold text-slate-800">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  <span>{profile.dateOfBirth}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">BLOOD GROUP</span>
                <div className="flex items-center gap-2 mt-1 font-semibold text-red-600">
                  <Heart className="h-3.5 w-3.5 text-red-500" />
                  <span>{profile.bloodGroup}</span>
                </div>
              </div>

              <div className="sm:col-span-2">
                <span className="text-slate-400 block text-[11px]">NATIONAL ID (NID) / SMART CARD</span>
                <div className="flex items-center gap-2 mt-1 font-semibold text-slate-800">
                  <Shield className="h-3.5 w-3.5 text-slate-400" />
                  <span>{profile.nidOrPassport}</span>
                  <Badge variant="outline" className="text-[10px] text-emerald-700 bg-emerald-50 border-emerald-200">
                    Govt. Verified
                  </Badge>
                </div>
              </div>

              <div className="sm:col-span-2">
                <span className="text-slate-400 block text-[11px]">CURRENT RESIDENCE & LOCATION</span>
                <div className="flex items-center gap-2 mt-1 font-semibold text-slate-800">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  <span>{profile.location}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Phone className="h-4 w-4 text-orange-600" />
                Emergency Contact (Authorized Contact)
              </h3>
              <span className="text-[11px] text-emerald-600 font-medium">Active</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400 block text-[11px]">CONTACT PERSON</span>
                <strong className="text-slate-900 font-semibold mt-1 block">
                  {profile.emergencyContact.name || "Not added yet"}
                </strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">RELATIONSHIP</span>
                <strong className="text-slate-900 font-semibold mt-1 block">
                  {profile.emergencyContact.relationship || "—"}
                </strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">PHONE NUMBER</span>
                <strong className="text-slate-900 font-semibold mt-1 block">
                  {profile.emergencyContact.phone || "—"}
                </strong>
              </div>
            </div>
          </div>

          {/* Skills & Certifications */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Award className="h-4 w-4 text-orange-600" />
              Technical Competencies & Cloud Skills
            </h3>

            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-lg bg-orange-50 border border-orange-200 px-3 py-1.5 text-xs font-semibold text-orange-800"
                >
                  {skill}
                </span>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                Academic &amp; Professional Education
              </span>
              {profile.education.length === 0 ? (
                <p className="text-xs text-slate-400">
                  No academic certifications added yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {profile.education.map((edu, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/50 text-xs"
                    >
                      <GraduationCap className="h-5 w-5 text-orange-600 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <strong className="text-slate-900 block font-semibold">
                          {edu.degree}
                        </strong>
                        <span className="text-slate-500 block mt-0.5">
                          {edu.institution}
                        </span>
                      </div>
                      <Badge variant="outline" className="text-[11px]">
                        {edu.year}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Reporting Manager & Employment Governance & Documents */}
        <div className="space-y-6">
          {/* Reporting Manager Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Reporting Manager
            </h3>

            <div className="flex items-center gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <Avatar
                src={profile.reportingManagerAvatar}
                alt={profile.reportingManager}
                fallback={profile.reportingManager.substring(0, 2).toUpperCase()}
                size="lg"
              />
              <div className="min-w-0 flex-1">
                <span className="text-sm font-bold text-slate-900 block truncate">
                  {profile.reportingManager}
                </span>
                <span className="text-xs text-slate-500 block truncate">
                  {profile.reportingManagerRole}
                </span>
                <span className="text-[11px] text-orange-600 font-medium block truncate">
                  shamim.bayshore@gmail.com
                </span>
              </div>
            </div>

            <div className="text-xs text-slate-500 leading-relaxed">
              Your reporting manager approves your Annual Leave requests, GPS attendance reviews, and quarterly OKR milestones.
            </div>
          </div>

          {/* Employment Governance Details */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Employment Contract
            </h3>

            <div className="divide-y divide-slate-100 text-xs">
              <div className="py-2 flex justify-between">
                <span className="text-slate-500">Contract Type:</span>
                <span className="font-semibold text-slate-800">Permanent Full-Time</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-slate-500">Work Model:</span>
                <span className="font-semibold text-slate-800">Hybrid (3 Days Office / 2 Remote)</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-slate-500">Probation Status:</span>
                <span className="font-semibold text-emerald-600">Confirmed (May 2023)</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-slate-500">Notice Period:</span>
                <span className="font-semibold text-slate-800">60 Calendar Days</span>
              </div>
            </div>
          </div>

          {/* Uploaded Documents List */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Uploaded Documents
              </h3>
              <Badge variant="outline" className="text-[10px]">
                {profile.documents.length} Files
              </Badge>
            </div>

            <div className="space-y-2">
              {profile.documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                    <FileText className="h-4 w-4 text-orange-600 shrink-0" />
                    <div className="min-w-0 flex-1 truncate">
                      <span className="font-semibold text-slate-900 block truncate">
                        {doc.title}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        {doc.type} • {doc.fileSize}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      alert(`Downloading encrypted copy of "${doc.title}"...`);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-orange-600 hover:bg-orange-50 transition-colors"
                    title="Download document"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <EditProfileModal
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />
    </div>
  );
}
