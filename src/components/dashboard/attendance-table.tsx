"use client";

import * as React from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useHRMS } from "@/context/hrms-context";
import { Search, Filter, Clock, ArrowRight, MapPin } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/ui/empty-state";

export function AttendanceTable() {
  const { attendanceRecords, openLocationModal } = useHRMS();
  const [searchTerm, setSearchTerm] = React.useState("");
  const [departmentFilter, setDepartmentFilter] = React.useState("All");
  const [statusFilter, setStatusFilter] = React.useState("All");

  const filteredRecords = attendanceRecords.filter((record) => {
    const matchesSearch =
      record.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.role.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDept =
      departmentFilter === "All" || record.department === departmentFilter;

    const matchesStatus =
      statusFilter === "All" || record.status === statusFilter;

    return matchesSearch && matchesDept && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Present":
        return (
          <Badge variant="success" dot>
            Present
          </Badge>
        );
      case "Late":
        return (
          <Badge variant="warning" dot>
            Late Check-in
          </Badge>
        );
      case "Remote":
        return (
          <Badge variant="info" dot>
            Remote / WFH
          </Badge>
        );
      case "On Leave":
        return (
          <Badge variant="danger" dot>
            On Leave
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3 border-b border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-600" />
              <span>Today&apos;s Attendance Logs</span>
            </CardTitle>
            <CardDescription>
              Live biometric check-in tracking &amp; work hour records.
            </CardDescription>
          </div>
          <Link
            href="/attendance"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-600 hover:text-orange-700 hover:underline"
          >
            <span>View Full Timesheets</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Filter controls */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-3">
          <div className="w-full sm:flex-1">
            <Input
              icon={<Search className="h-3.5 w-3.5" />}
              placeholder="Search by name, ID, or designation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-8 text-xs"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="h-8 text-xs py-0 w-36"
            >
              <option value="All">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Product & Design">Product & Design</option>
              <option value="Sales & Marketing">Sales & Marketing</option>
              <option value="Operations">Operations</option>
              <option value="HR & People">HR & People</option>
              <option value="Finance & Legal">Finance & Legal</option>
            </Select>

            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-8 text-xs py-0 w-32"
            >
              <option value="All">All Statuses</option>
              <option value="Present">Present</option>
              <option value="Late">Late</option>
              <option value="Remote">Remote</option>
              <option value="On Leave">On Leave</option>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0 flex-1 overflow-x-auto">
        {filteredRecords.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="No attendance records match"
              description="Try adjusting your search terms or department filters to see today's entries."
              actionLabel="Clear Filters"
              onAction={() => {
                setSearchTerm("");
                setDepartmentFilter("All");
                setStatusFilter("All");
              }}
            />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Department &amp; Role</TableHead>
                <TableHead>Check-in</TableHead>
                <TableHead>Location &amp; GPS</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Hours Logged</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.map((record) => (
                <TableRow key={record.id} className="hover:bg-slate-50/70">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={record.avatar}
                        alt={record.employeeName}
                        fallback={record.employeeName}
                        size="sm"
                      />
                      <div>
                        <p className="text-xs font-semibold text-slate-900 leading-tight">
                          {record.employeeName}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {record.employeeId}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-xs font-medium text-slate-800">
                      {record.role}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {record.department}
                    </p>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-mono font-medium text-slate-700">
                      {record.checkIn}
                    </span>
                  </TableCell>
                  <TableCell>
                    {record.location && record.location !== "On Approved Leave" ? (
                      <button
                        type="button"
                        onClick={() => openLocationModal(record)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-orange-50 hover:text-orange-700 text-slate-700 border border-slate-200 transition-colors text-xs font-medium cursor-pointer"
                        title="Click to view GPS Map & Geofence"
                      >
                        <MapPin className="h-3.5 w-3.5 text-orange-600 shrink-0" />
                        <span className="truncate max-w-[130px]">{record.location}</span>
                        {record.geo?.geofenceStatus === "Inside Office Geofence" ? (
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" title="Inside Geofence" />
                        ) : record.geo?.geofenceStatus === "Field Client Visit" ? (
                          <span className="h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" title="Field Visit" />
                        ) : null}
                      </button>
                    ) : (
                      <span className="text-slate-400 text-xs">—</span>
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(record.status)}</TableCell>
                  <TableCell className="text-right">
                    <span className="text-xs font-mono font-semibold text-slate-800">
                      {record.workHours}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
