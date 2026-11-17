"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useHRMS } from "@/context/hrms-context";
import { Department, Employee } from "@/types";
import {
  DEFAULT_OFFICE_IN_TIME,
  DEFAULT_OFFICE_OUT_TIME,
  normalizeTime24h,
} from "@/lib/office-time";
import {
  DollarSign,
  MapPin,
  Check,
  User,
  Mail,
  Phone,
  Briefcase,
  Clock,
} from "lucide-react";

const FALLBACK_DEPARTMENT_NAMES = [
  "Engineering",
  "Product & Design",
  "Sales & Marketing",
  "Operations",
  "HR & People",
  "Finance & Legal",
];

interface EditFormProps {
  employee: Employee;
  departmentOptions: string[];
  onClose: () => void;
  onUpdate: (id: string, data: Partial<Employee>) => Promise<void>;
}

function EditEmployeeForm({
  employee,
  departmentOptions,
  onClose,
  onUpdate,
}: EditFormProps) {
  const [formData, setFormData] = React.useState({
    name: employee.name,
    email: employee.email,
    phone: employee.phone,
    role: employee.role,
    department: employee.department,
    salary: employee.salary.toString(),
    location: employee.location,
    status: employee.status,
    officeInTime: normalizeTime24h(
      employee.officeInTime,
      DEFAULT_OFFICE_IN_TIME
    ),
    officeOutTime: normalizeTime24h(
      employee.officeOutTime,
      DEFAULT_OFFICE_OUT_TIME
    ),
  });

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const mergedDepartments = React.useMemo(() => {
    if (departmentOptions.includes(employee.department)) {
      return departmentOptions;
    }
    return [employee.department, ...departmentOptions];
  }, [departmentOptions, employee.department]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = "Full name is required";
    if (!formData.email.trim() || !formData.email.includes("@"))
      errs.email = "Valid work email is required";
    if (!formData.role.trim()) errs.role = "Job designation is required";
    if (!formData.phone.trim()) errs.phone = "Phone number is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    await onUpdate(employee.id, {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      role: formData.role,
      department: formData.department,
      salary: Number(formData.salary) || 60000,
      location: formData.location,
      status: formData.status,
      officeInTime: formData.officeInTime || DEFAULT_OFFICE_IN_TIME,
      officeOutTime: formData.officeOutTime || DEFAULT_OFFICE_OUT_TIME,
    });

    setIsSubmitting(false);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Full Name <span className="text-red-500">*</span>
          </label>
          <Input
            icon={<User className="h-4 w-4" />}
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
          />
          {errors.name && (
            <p className="mt-1 text-[11px] text-red-600 font-medium">
              {errors.name}
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Work Email <span className="text-red-500">*</span>
          </label>
          <Input
            type="email"
            icon={<Mail className="h-4 w-4" />}
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />
          {errors.email && (
            <p className="mt-1 text-[11px] text-red-600 font-medium">
              {errors.email}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Job Designation / Role <span className="text-red-500">*</span>
          </label>
          <Input
            icon={<Briefcase className="h-4 w-4" />}
            value={formData.role}
            onChange={(e) =>
              setFormData({ ...formData, role: e.target.value })
            }
          />
          {errors.role && (
            <p className="mt-1 text-[11px] text-red-600 font-medium">
              {errors.role}
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Department
          </label>
          <Select
            value={formData.department}
            onChange={(e) =>
              setFormData({
                ...formData,
                department: e.target.value as Department,
              })
            }
          >
            {mergedDepartments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Monthly Salary (BDT ৳)
          </label>
          <Input
            type="number"
            icon={<DollarSign className="h-4 w-4" />}
            value={formData.salary}
            onChange={(e) =>
              setFormData({ ...formData, salary: e.target.value })
            }
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <Input
            icon={<Phone className="h-4 w-4" />}
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
          />
          {errors.phone && (
            <p className="mt-1 text-[11px] text-red-600 font-medium">
              {errors.phone}
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Employment Status
          </label>
          <Select
            value={formData.status}
            onChange={(e) =>
              setFormData({
                ...formData,
                status: e.target.value as Employee["status"],
              })
            }
          >
            <option value="Invited">Invited</option>
            <option value="Active">Active</option>
            <option value="On Leave">On Leave</option>
            <option value="Suspended">Suspended</option>
            <option value="Terminated">Terminated</option>
          </Select>
        </div>
      </div>

      {/* Office In / Out Time */}
      <div className="rounded-xl border border-orange-200/80 bg-orange-50/50 p-3.5 space-y-2.5">
        <div className="flex items-center justify-between flex-wrap gap-1">
          <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-orange-600" />
            <span>Office Shift Schedule</span>
          </span>
          <span className="text-[11px] text-red-600 font-semibold">
            Late clock-ins marked RED in monthly report
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Office In Time
            </label>
            <Input
              type="time"
              icon={<Clock className="h-4 w-4 text-emerald-600" />}
              value={formData.officeInTime}
              onChange={(e) =>
                setFormData({ ...formData, officeInTime: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Office Out Time
            </label>
            <Input
              type="time"
              icon={<Clock className="h-4 w-4 text-orange-600" />}
              value={formData.officeOutTime}
              onChange={(e) =>
                setFormData({ ...formData, officeOutTime: e.target.value })
              }
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Workplace Location
        </label>
        <Input
          icon={<MapPin className="h-4 w-4" />}
          value={formData.location}
          onChange={(e) =>
            setFormData({ ...formData, location: e.target.value })
          }
        />
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="gap-2 bg-orange-600 hover:bg-orange-700 text-white"
        >
          <Check className="h-4 w-4" />
          <span>{isSubmitting ? "Saving..." : "Save Changes"}</span>
        </Button>
      </div>
    </form>
  );
}

export function EditEmployeeModal() {
  const {
    employeeToEdit,
    isEditEmployeeOpen,
    closeEditEmployee,
    updateEmployee,
    departments,
  } = useHRMS();

  if (!employeeToEdit) return null;

  const departmentOptions =
    departments.length > 0
      ? departments.map((d) => d.name)
      : FALLBACK_DEPARTMENT_NAMES;

  return (
    <Modal
      isOpen={isEditEmployeeOpen}
      onClose={closeEditEmployee}
      title="Edit Employee Information"
      description={`Update employment details, office shift schedule, and compensation for ${employeeToEdit.name} (${employeeToEdit.id})`}
      size="lg"
    >
      <EditEmployeeForm
        key={employeeToEdit.id}
        employee={employeeToEdit}
        departmentOptions={departmentOptions}
        onClose={closeEditEmployee}
        onUpdate={updateEmployee}
      />
    </Modal>
  );
}
