"use client";

import * as React from "react";
import Link from "next/link";
import { useHRMS } from "@/context/hrms-context";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/context/toast-context";
import { InviteEmailResultDto } from "@/types";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/ui/empty-state";
import {
  UserPlus,
  Search,
  Mail,
  Phone,
  MapPin,
  LayoutGrid,
  List,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Users,
  UserCheck,
  CalendarOff,
  DollarSign,
  Send,
  Copy,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Settings,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function EmployeesPage() {
  const {
    employees,
    setIsAddEmployeeOpen,
    openViewEmployee,
    openEditEmployee,
    openDeleteEmployee,
    resendEmployeeInvite,
  } = useHRMS();
  const { isSuperAdmin } = useAuth();
  const { showToast } = useToast();

  const [invitePreview, setInvitePreview] = React.useState<{
    name: string;
    email: string;
    emailStatus: InviteEmailResultDto;
  } | null>(null);

  const [searchTerm, setSearchTerm] = React.useState("");
  const [departmentFilter, setDepartmentFilter] = React.useState("All");
  const [statusFilter, setStatusFilter] = React.useState("All");
  const [sortBy, setSortBy] = React.useState<"name" | "salary" | "date">("name");
  const [viewMode, setViewMode] = React.useState<"grid" | "table">("grid");

  // Summary counts
  const totalEmployeesCount = employees.length;
  const activeCount = employees.filter((e) => e.status === "Active").length;
  const onLeaveCount = employees.filter((e) => e.status === "On Leave").length;
  const avgSalary =
    employees.length > 0
      ? Math.round(
          employees.reduce((acc, curr) => acc + curr.salary, 0) /
            employees.length
        )
      : 0;

  // Filter & Sort
  const filteredEmployees = employees
    .filter((emp) => {
      const matchesSearch =
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDept =
        departmentFilter === "All" || emp.department === departmentFilter;

      const matchesStatus =
        statusFilter === "All" || emp.status === statusFilter;

      return matchesSearch && matchesDept && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === "salary") return b.salary - a.salary;
      if (sortBy === "date") return b.joinDate.localeCompare(a.joinDate);
      return a.name.localeCompare(b.name);
    });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return <Badge variant="success" dot>Active</Badge>;
      case "Invited":
        return <Badge variant="info" dot>Invited</Badge>;
      case "On Leave":
        return <Badge variant="warning" dot>On Leave</Badge>;
      case "Suspended":
        return <Badge variant="warning" dot>Suspended</Badge>;
      case "Terminated":
        return <Badge variant="danger" dot>Terminated</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleResendInvite = async (empId: string, name: string, email: string) => {
    const res = await resendEmployeeInvite(empId);
    if (res.success && res.emailStatus) {
      setInvitePreview({ name, email, emailStatus: res.emailStatus });
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Employee Directory &amp; Staff Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Full lifecycle CRUD: Add, inspect profiles, update compensation, or manage active workforce records.
          </p>
        </div>
        {isSuperAdmin && (
          <Button
            onClick={() => setIsAddEmployeeOpen(true)}
            className="gap-2 bg-orange-600 hover:bg-orange-700 text-white shadow-sm font-medium"
          >
            <UserPlus className="h-4 w-4" />
            <span>Add &amp; Invite Employee</span>
          </Button>
        )}
      </div>

      {/* Summary KPI stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Total Roster
            </span>
            <span className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5 block">
              {totalEmployeesCount}
            </span>
          </div>
          <div className="h-9 w-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
            <Users className="h-4 w-4" />
          </div>
        </Card>

        <Card className="p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Active Staff
            </span>
            <span className="text-xl sm:text-2xl font-bold text-emerald-600 mt-0.5 block">
              {activeCount}
            </span>
          </div>
          <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <UserCheck className="h-4 w-4" />
          </div>
        </Card>

        <Card className="p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              On Leave
            </span>
            <span className="text-xl sm:text-2xl font-bold text-amber-600 mt-0.5 block">
              {onLeaveCount}
            </span>
          </div>
          <div className="h-9 w-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <CalendarOff className="h-4 w-4" />
          </div>
        </Card>

        <Card className="p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Average Base Salary
            </span>
            <span className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5 block">
              {formatCurrency(avgSalary)}
            </span>
          </div>
          <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <DollarSign className="h-4 w-4" />
          </div>
        </Card>
      </div>

      {/* Search, Filter & Sort Controls */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="w-full lg:w-80">
          <Input
            icon={<Search className="h-4 w-4" />}
            placeholder="Search by name, role, email, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-9 text-xs"
          />
        </div>

        {/* Filters and sorting */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          <Select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="h-9 text-xs py-0 w-36 sm:w-44"
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
            className="h-9 text-xs py-0 w-32"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Invited">Invited</option>
            <option value="On Leave">On Leave</option>
            <option value="Terminated">Terminated</option>
          </Select>

          <Select
            value={sortBy}
            onChange={(e) =>
              setSortBy(e.target.value as "name" | "salary" | "date")
            }
            className="h-9 text-xs py-0 w-32"
          >
            <option value="name">Sort: Name (A-Z)</option>
            <option value="salary">Sort: Salary (High)</option>
            <option value="date">Sort: Join Date</option>
          </Select>

          {/* Grid / Table View toggle */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg ml-auto sm:ml-0">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-md text-xs font-medium cursor-pointer transition-colors ${
                viewMode === "grid"
                  ? "bg-white text-orange-600 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
              aria-label="Grid view"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-md text-xs font-medium cursor-pointer transition-colors ${
                viewMode === "table"
                  ? "bg-white text-orange-600 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
              aria-label="Table view"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Results Count & Filter reset */}
      {(searchTerm || departmentFilter !== "All" || statusFilter !== "All") && (
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span>
            Showing <strong>{filteredEmployees.length}</strong> of{" "}
            {employees.length} employees
          </span>
          <button
            type="button"
            onClick={() => {
              setSearchTerm("");
              setDepartmentFilter("All");
              setStatusFilter("All");
            }}
            className="text-orange-600 hover:text-orange-700 font-semibold cursor-pointer"
          >
            Reset all filters
          </button>
        </div>
      )}

      {/* Empty State */}
      {filteredEmployees.length === 0 ? (
        <EmptyState
          title="No employees found"
          description="We couldn't find any team members matching your current query or department filters."
          actionLabel="Clear Filters"
          onAction={() => {
            setSearchTerm("");
            setDepartmentFilter("All");
            setStatusFilter("All");
          }}
        />
      ) : viewMode === "grid" ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEmployees.map((emp) => (
            <Card
              key={emp.id}
              className="p-5 flex flex-col justify-between hover:border-orange-200 hover:shadow-md transition-all group"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div
                    className="flex items-center gap-3 cursor-pointer"
                    onClick={() => openViewEmployee(emp)}
                  >
                    <Avatar
                      src={emp.avatar}
                      alt={emp.name}
                      fallback={emp.name}
                      size="lg"
                      status="online"
                    />
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
                        {emp.name}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">
                        {emp.role}
                      </p>
                      <span className="text-[10px] font-mono text-slate-400">
                        {emp.id}
                      </span>
                    </div>
                  </div>

                  {/* Actions Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <div className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer">
                        <MoreVertical className="h-4 w-4" />
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="right" className="w-48">
                      <DropdownMenuItem onClick={() => openViewEmployee(emp)}>
                        <Eye className="h-3.5 w-3.5 text-slate-500" />
                        <span>View Profile</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openEditEmployee(emp)}>
                        <Edit className="h-3.5 w-3.5 text-orange-600" />
                        <span>Edit Details</span>
                      </DropdownMenuItem>
                      {isSuperAdmin && emp.status === "Invited" && (
                        <DropdownMenuItem
                          onClick={() =>
                            void handleResendInvite(emp.id, emp.name, emp.email)
                          }
                        >
                          <Send className="h-3.5 w-3.5 text-blue-600" />
                          <span>Resend Invite Email</span>
                        </DropdownMenuItem>
                      )}
                      {isSuperAdmin && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            destructive
                            onClick={() => openDeleteEmployee(emp)}
                          >
                            <Trash2 className="h-3.5 w-3.5 text-red-500" />
                            <span>Delete</span>
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Details */}
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2 truncate">
                    <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{emp.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span>{emp.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 truncate">
                    <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{emp.location}</span>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Salary
                  </span>
                  <p className="font-semibold text-slate-800 font-mono">
                    {formatCurrency(emp.salary)}/mo
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="orange" className="text-[10px]">
                    {emp.department}
                  </Badge>
                  {getStatusBadge(emp.status)}
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        /* TABLE VIEW */
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Department &amp; Role</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Compensation</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.map((emp) => (
                <TableRow key={emp.id} className="hover:bg-slate-50/70">
                  <TableCell>
                    <div
                      className="flex items-center gap-3 cursor-pointer"
                      onClick={() => openViewEmployee(emp)}
                    >
                      <Avatar
                        src={emp.avatar}
                        alt={emp.name}
                        fallback={emp.name}
                        size="sm"
                      />
                      <div>
                        <p className="text-xs font-semibold text-slate-900 hover:text-orange-600 transition-colors">
                          {emp.name}
                        </p>
                        <p className="text-[11px] text-slate-400">{emp.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-xs font-medium text-slate-800">{emp.role}</p>
                    <p className="text-[11px] text-slate-500">{emp.department}</p>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-slate-600">{emp.location}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-semibold text-slate-800 font-mono">
                      {formatCurrency(emp.salary)}
                    </span>
                  </TableCell>
                  <TableCell>{getStatusBadge(emp.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openViewEmployee(emp)}
                        className="h-8 w-8 p-0 text-slate-400 hover:text-slate-800"
                        aria-label="View employee profile"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openEditEmployee(emp)}
                        className="h-8 w-8 p-0 text-slate-400 hover:text-orange-600"
                        aria-label="Edit employee"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {isSuperAdmin && emp.status === "Invited" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            void handleResendInvite(emp.id, emp.name, emp.email)
                          }
                          className="h-8 w-8 p-0 text-slate-400 hover:text-blue-600"
                          aria-label="Resend invite email"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      )}
                      {isSuperAdmin && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openDeleteEmployee(emp)}
                          className="h-8 w-8 p-0 text-slate-400 hover:text-red-600"
                          aria-label="Delete employee"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
      {/* Invite Link Preview Modal */}
      <Modal
        isOpen={Boolean(invitePreview)}
        onClose={() => setInvitePreview(null)}
        title={
          invitePreview?.emailStatus.delivered
            ? "Invitation Email Sent"
            : "Activation Link Ready (SMTP Not Configured)"
        }
        description={
          invitePreview
            ? `Email invitation status for ${invitePreview.name} (${invitePreview.email})`
            : undefined
        }
        size="md"
      >
        {invitePreview && (
          <div className="space-y-4 text-xs">
            <div
              className={`flex items-start gap-2.5 rounded-xl border p-3 ${
                invitePreview.emailStatus.delivered
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-amber-200 bg-amber-50 text-amber-900"
              }`}
            >
              {invitePreview.emailStatus.delivered ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600" />
              ) : (
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />
              )}
              <div className="space-y-1.5">
                <p className="font-bold">
                  {invitePreview.emailStatus.delivered
                    ? "Real Email Sent"
                    : "SMTP Not Configured — Real Gmail Not Sent"}
                </p>
                <p className="leading-relaxed">
                  {invitePreview.emailStatus.message}
                </p>
                {!invitePreview.emailStatus.delivered && (
                  <Link
                    href="/settings"
                    onClick={() => setInvitePreview(null)}
                    className="inline-flex items-center gap-1 font-bold text-amber-950 underline hover:text-orange-700"
                  >
                    <Settings className="h-3.5 w-3.5" />
                    <span>Configure Gmail App Password in Settings →</span>
                  </Link>
                )}
              </div>
            </div>
            <div className="space-y-1.5">
              <span className="font-bold text-slate-800 block">
                Activation Link (Valid 48 Hours)
              </span>
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  value={invitePreview.emailStatus.inviteUrl}
                  className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 font-mono text-[11px]"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    await navigator.clipboard.writeText(
                      invitePreview.emailStatus.inviteUrl
                    );
                    showToast("Copied", "Activation link copied.", "success");
                  }}
                  className="gap-1"
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy</span>
                </Button>
              </div>
            </div>
            {invitePreview.emailStatus.previewUrl && (
              <a
                href={invitePreview.emailStatus.previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-orange-600 font-semibold hover:underline"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>View Sandbox Email in Ethereal Mailbox</span>
              </a>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
