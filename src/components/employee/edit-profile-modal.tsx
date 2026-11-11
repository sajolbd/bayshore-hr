"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useEmployee } from "@/context/employee-context";
import { Lock, ShieldAlert, CheckCircle2 } from "lucide-react";

interface EditProfileModalProps {
  open: boolean;
  onClose: () => void;
}

export function EditProfileModal({ open, onClose }: EditProfileModalProps) {
  const { profile, updateProfile } = useEmployee();

  const [formData, setFormData] = React.useState({
    phone: profile.phone,
    location: profile.location,
    bloodGroup: profile.bloodGroup,
    emergencyName: profile.emergencyContact.name,
    emergencyRel: profile.emergencyContact.relationship,
    emergencyPhone: profile.emergencyContact.phone,
  });

  const [savedMsg, setSavedMsg] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({
      phone: formData.phone,
      location: formData.location,
      bloodGroup: formData.bloodGroup,
      emergencyContact: {
        name: formData.emergencyName,
        relationship: formData.emergencyRel,
        phone: formData.emergencyPhone,
      },
    });

    setSavedMsg(true);
    setTimeout(() => {
      setSavedMsg(false);
      onClose();
    }, 800);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit Personal Information"
      description="Update permitted contact and emergency details. Core employment attributes require HR authorization."
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {savedMsg && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>Profile information successfully saved.</span>
          </div>
        )}

        {/* HR-Protected Notice */}
        <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-800 flex items-start gap-2.5">
          <ShieldAlert className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
          <div>
            <strong>Corporate Governance Policy:</strong>
            <p className="mt-0.5 text-amber-700">
              Department, Designation, Manager, and Joining Date are locked and managed directly by Bayshore People Operations. To request changes, submit an HR Service Request.
            </p>
          </div>
        </div>

        {/* Permitted Editable Fields */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Contact & Residential Information
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Contact Mobile (WhatsApp)"
              value={formData.phone}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, phone: e.target.value }))
              }
              required
            />
            <Select
              label="Blood Group"
              value={formData.bloodGroup}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, bloodGroup: e.target.value }))
              }
              options={[
                { label: "O+", value: "O+" },
                { label: "O-", value: "O-" },
                { label: "A+", value: "A+" },
                { label: "A-", value: "A-" },
                { label: "B+", value: "B+" },
                { label: "B-", value: "B-" },
                { label: "AB+", value: "AB+" },
                { label: "AB-", value: "AB-" },
              ]}
            />
          </div>

          <Input
            label="Current Residential Address & Work Hub"
            value={formData.location}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, location: e.target.value }))
            }
            required
          />
        </div>

        <div className="pt-2 border-t border-slate-100 space-y-3">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Emergency Contact Information
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Contact Person Name"
              value={formData.emergencyName}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  emergencyName: e.target.value,
                }))
              }
              required
            />
            <Input
              label="Relationship"
              value={formData.emergencyRel}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  emergencyRel: e.target.value,
                }))
              }
              required
            />
            <Input
              label="Emergency Phone"
              value={formData.emergencyPhone}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  emergencyPhone: e.target.value,
                }))
              }
              required
            />
          </div>
        </div>

        {/* Read-Only Locked Fields Overview */}
        <div className="pt-2 border-t border-slate-100 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Lock className="h-3.5 w-3.5" />
            <span>Locked Fields (Verified Credentials)</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-slate-600">
            <div>
              <span className="text-slate-400 block text-[10px]">EMPLOYEE ID</span>
              <strong className="text-slate-800 font-semibold">{profile.id}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">ROLE</span>
              <strong className="text-slate-800 font-semibold truncate block">{profile.role}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">DEPARTMENT</span>
              <strong className="text-slate-800 font-semibold">{profile.department}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">MANAGER</span>
              <strong className="text-slate-800 font-semibold truncate block">{profile.reportingManager}</strong>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
}
