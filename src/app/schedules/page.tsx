"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Clock, Calendar, CheckCircle2, MapPin, Users } from "lucide-react";
import { useHRMS } from "@/context/hrms-context";
import { useToast } from "@/context/toast-context";

const shiftTemplates = [
  {
    id: "shift-hq",
    name: "General HQ Shift",
    window: "09:00 AM – 06:00 PM",
    breakTime: "01:00 PM – 02:00 PM",
    location: "Gulshan-2 HQ",
    assignedCount: 162,
  },
  {
    id: "shift-flex",
    name: "Hybrid Tech Flex",
    window: "10:00 AM – 07:00 PM",
    breakTime: "01:30 PM – 02:30 PM",
    location: "Gulshan HQ / Remote",
    assignedCount: 58,
  },
  {
    id: "shift-ops",
    name: "Operations Early",
    window: "08:00 AM – 05:00 PM",
    breakTime: "12:30 PM – 01:30 PM",
    location: "Banani Annex",
    assignedCount: 28,
  },
];

export default function AdminSchedulesPage() {
  const { employees } = useHRMS();
  const { showToast } = useToast();

  const [shiftMap, setShiftMap] = React.useState<Record<string, string>>(() =>
    Object.fromEntries(
      employees.map((emp, idx) => [
        emp.id,
        idx % 3 === 0 ? "Hybrid Tech Flex" : idx % 3 === 1 ? "General HQ Shift" : "Operations Early",
      ])
    )
  );
  const [selectedDept, setSelectedDept] = React.useState<string>("All");

  const filteredEmployees = employees.filter(
    (emp) => selectedDept === "All" || emp.department === selectedDept
  );

  const handleShiftChange = (empId: string, empName: string, newShift: string) => {
    setShiftMap((prev) => ({ ...prev, [empId]: newShift }));
    showToast("Shift Updated", `${empName} reassigned to ${newShift}.`, "success");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Shifts &amp; Duty Roster
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage Bayshore Communication working windows, weekly holidays (Fri–Sat), and hybrid rosters.
          </p>
        </div>
        <Button
          onClick={() =>
            showToast(
              "Roster Published",
              "Weekly shift schedules synced to all employee self-service portals.",
              "success"
            )
          }
          className="gap-2 bg-orange-600 hover:bg-orange-700 text-white shadow-sm"
        >
          <CheckCircle2 className="h-4 w-4" />
          <span>Publish Weekly Roster</span>
        </Button>
      </div>

      {/* Shift Templates */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {shiftTemplates.map((shift) => (
          <Card key={shift.id} className="p-5 hover:border-orange-200 transition-colors">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-orange-50 text-orange-600 border border-orange-200/60">
                  <Clock className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{shift.name}</h3>
                  <p className="text-xs font-medium text-orange-600">{shift.window}</p>
                </div>
              </div>
              <Badge variant="outline" className="text-[10px]">
                <Users className="h-3 w-3" /> {shift.assignedCount}
              </Badge>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-500">
              <div className="flex items-center justify-between">
                <span>Lunch Break:</span>
                <span className="font-medium text-slate-700">{shift.breakTime}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> Zone:
                </span>
                <span className="font-medium text-slate-700">{shift.location}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Off Days:
                </span>
                <span className="font-medium text-slate-700">Friday &amp; Saturday</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Roster Assignment Table */}
      <Card className="overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Employee Shift Assignments</h2>
            <p className="text-xs text-slate-500">Changes reflect immediately in Employee My Schedule</p>
          </div>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="All">All Departments</option>
            <option value="Engineering">Engineering</option>
            <option value="Product & Design">Product &amp; Design</option>
            <option value="Sales & Marketing">Sales &amp; Marketing</option>
            <option value="Operations">Operations</option>
            <option value="HR & People">HR &amp; People</option>
            <option value="Finance & Legal">Finance &amp; Legal</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-5">Employee</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Assigned Shift</th>
                <th className="py-3 px-4">Work Mode</th>
                <th className="py-3 px-5 text-right">Reassign</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredEmployees.map((emp) => {
                const currentShift = shiftMap[emp.id] || "General HQ Shift";
                return (
                  <tr key={emp.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-3">
                        <Avatar src={emp.avatar} alt={emp.name} fallback={emp.name} size="sm" />
                        <div>
                          <p className="font-semibold text-slate-900">{emp.name}</p>
                          <p className="text-[11px] text-slate-500">{emp.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{emp.department}</td>
                    <td className="py-3 px-4">
                      <Badge variant="orange" className="text-[10px]">
                        {currentShift}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{emp.location}</td>
                    <td className="py-3 px-5 text-right">
                      <select
                        value={currentShift}
                        onChange={(e) => handleShiftChange(emp.id, emp.name, e.target.value)}
                        aria-label={`Assign shift for ${emp.name}`}
                        className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        {shiftTemplates.map((t) => (
                          <option key={t.id} value={t.name}>
                            {t.name}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

