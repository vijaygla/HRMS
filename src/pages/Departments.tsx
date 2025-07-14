import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Plus,
  Users,
  TrendingUp,
  Edit,
  Trash2,
  Building2,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";

import { departmentService } from "../services/departmentService";
import { Department } from "../types";

/* --------------------------------------------------------------------------
 *  Helpers
 * -----------------------------------------------------------------------*/
const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

const cardColors = [
  "bg-blue-500",
  "bg-green-500",
  "bg-purple-500",
  "bg-orange-500",
  "bg-red-500",
  "bg-cyan-500",
  "bg-pink-500",
  "bg-indigo-500",
];
const getCardColor = (idx: number) => cardColors[idx % cardColors.length];

/* --------------------------------------------------------------------------
 *  Add‑/Edit‑Department Modal
 * -----------------------------------------------------------------------*/
interface DepartmentDialogProps {
  open: boolean;
  onClose(): void;
  onSave(dept: Partial<Department>): Promise<void>;
  initial?: Partial<Department> | null;
}

const DepartmentDialog: React.FC<DepartmentDialogProps> = ({
  open,
  onClose,
  onSave,
  initial,
}) => {
  const isEdit = Boolean(initial?._id);
  const [form, setForm] = useState<Partial<Department>>(initial ?? {});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => setForm(initial ?? {}), [initial]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSave(form);
      onClose();
      toast.success(`Department ${isEdit ? "updated" : "created"}`);
    } catch (err: any) {
      toast.error(err.message ?? "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 bg-black/40 flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-lg w-full max-w-md p-6 space-y-4 animate-in fade-in zoom-in-95"
      >
        <h2 className="text-xl font-semibold text-gray-900">
          {isEdit ? "Edit" : "Create"} Department
        </h2>

        <input
          name="name"
          placeholder="Name"
          value={form.name ?? ""}
          onChange={handleChange}
          required
          className="w-full rounded-lg border px-3 py-2"
        />
        <input
          name="code"
          placeholder="Code"
          value={form.code ?? ""}
          onChange={handleChange}
          required
          className="w-full rounded-lg border px-3 py-2"
        />
        <input
          name="budget"
          type="number"
          placeholder="Budget"
          value={form.budget ?? ""}
          onChange={handleChange}
          className="w-full rounded-lg border px-3 py-2"
        />
        <input
          name="description"
          placeholder="Description"
          value={form.description ?? ""}
          onChange={handleChange}
          className="w-full rounded-lg border px-3 py-2"
        />

        <div className="flex justify-end gap-2 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg border"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white disabled:opacity-50 flex items-center gap-1"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />} Save
          </button>
        </div>
      </form>
    </div>
  );
};

/* --------------------------------------------------------------------------
 *  Department Card
 * -----------------------------------------------------------------------*/
interface CardProps {
  dept: Department;
  idx: number;
  onDelete(id: string): Promise<void>;
  onEdit(dept: Department): void;
}
const DepartmentCard: React.FC<CardProps> = ({ dept, idx, onDelete, onEdit }) => (
  <div className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md space-y-4">
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-3">
        <div
          className={`w-12 h-12 ${getCardColor(
            idx,
          )} rounded-lg flex items-center justify-center`}
        >
          <Building2 className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{dept.name}</h3>
          <p className="text-xs text-gray-600">Code: {dept.code}</p>
          <p className="text-xs text-gray-600">
            {dept.manager
              ? `Manager: ${dept.manager.personalInfo.firstName} ${dept.manager.personalInfo.lastName}`
              : "No manager"}
          </p>
        </div>
      </div>
    </div>

    {dept.description && <p className="text-sm text-gray-600">{dept.description}</p>}

    <div className="grid grid-cols-2 gap-4">
      <div className="text-center bg-gray-50 rounded-lg p-3">
        <p className="text-2xl font-bold text-gray-900">{dept.employeeCount ?? 0}</p>
        <p className="text-xs text-gray-600">Employees</p>
      </div>
      <div className="text-center bg-gray-50 rounded-lg p-3">
        <p className="text-lg font-bold text-gray-900">
          {dept.budget ? formatCurrency(dept.budget) : "N/A"}
        </p>
        <p className="text-xs text-gray-600">Budget</p>
      </div>
    </div>

    <div className="flex gap-2 pt-2">
      <button
        onClick={() => onEdit(dept)}
        className="flex-1 bg-blue-50 text-blue-600 py-2 rounded-lg text-sm hover:bg-blue-100"
      >
        <Edit className="w-4 h-4 inline" /> Edit
      </button>
      <button
        onClick={() => onDelete(dept._id)}
        className="px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  </div>
);

/* --------------------------------------------------------------------------
 *  Main Component
 * -----------------------------------------------------------------------*/
const Departments: React.FC = () => {
  const [depts, setDepts] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState<{ open: boolean; initial: Department | null }>(
    { open: false, initial: null },
  );

  /* ----------------------------- CRUD Handlers ----------------------------*/
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const { data, success } = await departmentService.getDepartments();
      if (success) setDepts(data ?? []);
    } catch (err: any) {
      toast.error(err.message ?? "Unable to fetch departments");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const addOrUpdate = async (payload: Partial<Department>) => {
    if (payload._id) {
      // update
      const updated = await departmentService.updateDepartment(payload._id, payload);
      setDepts((prev) => prev.map((d) => (d._id === updated._id ? updated : d)));
    } else {
      // create
      const created = await departmentService.createDepartment(payload);
      setDepts((prev) => [created, ...prev]);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this department?")) return;
    try {
      await departmentService.deleteDepartment(id);
      setDepts((prev) => prev.filter((d) => d._id !== id));
      toast.success("Department deleted");
    } catch (err: any) {
      toast.error(err.message ?? "Delete failed");
    }
  };

  /* --------------------------- Derived statistics --------------------------*/
  const stats = useMemo(() => {
    const totalEmployees = depts.reduce((s, d) => s + (d.employeeCount ?? 0), 0);
    const totalBudget = depts.reduce((s, d) => s + (d.budget ?? 0), 0);
    return {
      totalDepartments: depts.length,
      totalEmployees,
      totalBudget,
    };
  }, [depts]);

  /* -------------------------------- Render --------------------------------*/
  if (loading)
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Departments</h1>
          <p className="text-gray-600 mt-1">Manage organisational departments</p>
        </div>
        <button
          onClick={() => setDialog({ open: true, initial: null })}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" /> Add Department
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon={<Building2 className="w-6 h-6 text-blue-600" />}
          label="Departments"
          value={stats.totalDepartments}
          bg="bg-blue-100"
        />
        <StatCard
          icon={<Users className="w-6 h-6 text-green-600" />}
          label="Employees"
          value={stats.totalEmployees}
          bg="bg-green-100"
        />
        <StatCard
          icon={<TrendingUp className="w-6 h-6 text-purple-600" />}
          label="Budget"
          value={formatCurrency(stats.totalBudget)}
          bg="bg-purple-100"
        />
      </div>

      {/* Grid */}
      {depts.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {depts.map((d, i) => (
            <DepartmentCard
              key={d._id}
              dept={d}
              idx={i}
              onDelete={handleDelete}
              onEdit={(dept) => setDialog({ open: true, initial: dept })}
            />
          ))}
        </div>
      ) : (
        <EmptyState onAdd={() => setDialog({ open: true, initial: null })} />
      )}

      {/* Modal */}
      <DepartmentDialog
        open={dialog.open}
        initial={dialog.initial}
        onClose={() => setDialog({ open: false, initial: null })}
        onSave={addOrUpdate}
      />
    </div>
  );
};

/* --------------------------------------------------------------------------
 *  Stat Card & Empty State components
 * -----------------------------------------------------------------------*/
interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  bg: string;
}
const StatCard: React.FC<StatCardProps> = ({ icon, label, value, bg }) => (
  <div className="bg-white rounded-xl shadow-sm border p-6">
    <div className="flex items-center gap-4">
      <div className={`w-12 h-12 ${bg} rounded-lg flex items-center justify-center`}>{icon}</div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-600">{label}</p>
      </div>
    </div>
  </div>
);

const EmptyState: React.FC<{ onAdd(): void }> = ({ onAdd }) => (
  <div className="text-center py-12 max-w-md mx-auto">
    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
      <Building2 className="w-12 h-12 text-gray-400" />
    </div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">No departments yet</h3>
    <p className="text-gray-500 mb-6">
      Create your first department to organise your workforce.
    </p>
    <button
      onClick={onAdd}
      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
    >
      Create Department
    </button>
  </div>
);

export default Departments;
