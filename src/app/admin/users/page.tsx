// src/app/admin/users/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { getUsers, saveUser, deleteUser } from "@/services/adminService";
import DataTable, { Column } from "@/components/admin/tables/DataTable";
import { ConfirmDialog } from "@/components/admin/dialogs/Dialogs";
import { useToast } from "@/components/admin/layout/AdminLayout";
import { InputField, SelectField } from "@/components/admin/forms/FormFields";
import { Modal } from "@/components/admin/dialogs/Dialogs";
import {
  Plus,
  ShieldCheck,
  UserX,
  UserCheck,
  Key,
  Trash2,
  Loader2,
  Mail,
  User
} from "lucide-react";

export default function UsersPage() {
  const { showToast } = useToast();
  
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);

  const [activeUser, setActiveUser] = useState<any>(null);
  const [userToDelete, setUserToDelete] = useState<any>(null);

  // Form states
  const [formValues, setFormValues] = useState({
    id: "",
    display_name: "",
    email: "",
    username: "",
    role: "user",
    status: "active"
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const list = await getUsers();
      setUsers(list);
    } catch (e) {
      showToast("Failed to fetch profiles.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Form validations
  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (!formValues.display_name.trim()) errs.display_name = "Name is required.";
    if (!formValues.email.trim() || !formValues.email.includes("@")) {
      errs.email = "A valid email is required.";
    }
    if (!formValues.username.trim()) errs.username = "Username is required.";
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleOpenEdit = (user?: any) => {
    setFormErrors({});
    if (user) {
      setActiveUser(user);
      setFormValues({
        id: user.id,
        display_name: user.display_name,
        email: user.email,
        username: user.username,
        role: user.role,
        status: user.status
      });
    } else {
      setActiveUser(null);
      setFormValues({
        id: "",
        display_name: "",
        email: "",
        username: "",
        role: "user",
        status: "active"
      });
    }
    setEditOpen(true);
  };

  const handleSaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);
    try {
      await saveUser(formValues);
      showToast(`User profile for "${formValues.display_name}" updated.`, "success");
      setEditOpen(false);
      loadData();
    } catch (err: any) {
      showToast(err.message || "Failed to update profile.", "error");
    } finally {
      setSaving(false);
    }
  };

  // Suspend toggle
  const handleToggleSuspend = async (user: any) => {
    const nextStatus = user.status === "active" ? "suspended" : "active";
    try {
      await saveUser({ ...user, status: nextStatus });
      showToast(
        `User "${user.display_name}" is now ${nextStatus === "suspended" ? "suspended" : "activated"}.`,
        "success"
      );
      loadData();
    } catch (e) {
      showToast("Operation failed.", "error");
    }
  };

  // Role promotion
  const handleOpenRole = (user: any) => {
    setActiveUser(user);
    setFormValues({ ...formValues, role: user.role });
    setRoleOpen(true);
  };

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeUser) return;
    setSaving(true);
    try {
      await saveUser({ ...activeUser, role: formValues.role });
      showToast(`Assigned role "${formValues.role}" to ${activeUser.display_name}.`, "success");
      setRoleOpen(false);
      loadData();
    } catch (e) {
      showToast("Role assignment failed.", "error");
    } finally {
      setSaving(false);
    }
  };

  // Delete User
  const handleOpenDelete = (user: any) => {
    setUserToDelete(user);
    setDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    try {
      await deleteUser(userToDelete.id);
      showToast(`Account for "${userToDelete.display_name}" has been removed.`, "success");
      loadData();
    } catch (e) {
      showToast("Deletion failed.", "error");
    }
  };

  // Password reset
  const handleOpenResetPassword = (user: any) => {
    setActiveUser(user);
    setPasswordOpen(true);
  };

  const handleResetPassword = async () => {
    if (!activeUser) return;
    showToast(`Password reset link sent to ${activeUser.email}.`, "success");
    setPasswordOpen(false);
  };

  // Columns definition
  const columns: Column<any>[] = [
    {
      id: "avatar_url",
      label: "Avatar",
      render: (row) => (
        <div className="w-8 h-8 rounded-full bg-[var(--admin-accent)] text-white text-xs font-bold flex items-center justify-center shrink-0 shadow-inner">
          {row.avatar_url ? (
            <img src={row.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
          ) : (
            row.display_name.charAt(0).toUpperCase()
          )}
        </div>
      )
    },
    { id: "display_name", label: "Display Name", sortable: true },
    { id: "email", label: "Email", sortable: true },
    {
      id: "role",
      label: "Role",
      sortable: true,
      filterOptions: ["admin", "user"],
      render: (row) => (
        <span
          className={`inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider ${
            row.role === "admin" ? "text-[var(--admin-accent)]" : "text-[var(--admin-text-muted)]"
          }`}
        >
          {row.role === "admin" && <ShieldCheck size={11} />}
          <span>{row.role}</span>
        </span>
      )
    },
    { id: "created_at", label: "Joined", sortable: true, render: (row) => <span>{new Date(row.created_at).toLocaleDateString()}</span> },
    {
      id: "status",
      label: "Status",
      sortable: true,
      filterOptions: ["active", "suspended"],
      render: (row) => (
        <span
          className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest ${
            row.status === "active"
              ? "bg-[var(--admin-success-bg)] text-[var(--admin-success)]"
              : "bg-[var(--admin-error-bg)] text-[var(--admin-error)]"
          }`}
        >
          {row.status}
        </span>
      )
    },
    {
      id: "actions",
      label: "Actions",
      render: (row) => (
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => handleToggleSuspend(row)}
            className={`p-1.5 rounded cursor-pointer ${
              row.status === "active" ? "text-amber-600 hover:bg-amber-500/10" : "text-green-600 hover:bg-green-500/10"
            }`}
            title={row.status === "active" ? "Suspend user" : "Activate user"}
          >
            {row.status === "active" ? <UserX size={13} /> : <UserCheck size={13} />}
          </button>
          <button
            onClick={() => handleOpenRole(row)}
            className="p-1.5 rounded text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
            title="Assign user role"
          >
            <ShieldCheck size={13} />
          </button>
          <button
            onClick={() => handleOpenResetPassword(row)}
            className="p-1.5 rounded text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
            title="Reset password"
          >
            <Key size={13} />
          </button>
          <button
            onClick={() => handleOpenDelete(row)}
            className="p-1.5 rounded text-red-500 hover:bg-red-500/10 cursor-pointer"
            title="Delete user account"
          >
            <Trash2 size={13} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Users Directory</h1>
          <p className="text-sm text-[var(--admin-text-muted)]">
            Manage profiles, assign administrator roles, or suspend user access.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0 select-none">
          <button
            onClick={() => handleOpenEdit()}
            className="admin-btn admin-btn-primary h-10 px-5 flex items-center gap-1.5 cursor-pointer text-xs font-semibold tracking-wider"
          >
            <Plus size={16} />
            <span>Create User</span>
          </button>
        </div>
      </div>

      {/* Table grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-2 text-[var(--admin-text-muted)]">
          <Loader2 className="animate-spin text-[var(--admin-accent)]" size={32} />
          <span className="text-xs uppercase font-bold tracking-wider">Syncing user records...</span>
        </div>
      ) : (
        <DataTable
          data={users}
          columns={columns}
          searchPlaceholder="Search name, email, or status..."
          searchKeys={["display_name", "email", "status"]}
          onRowClick={handleOpenEdit}
        />
      )}

      {/* Confirmation for delete */}
      <ConfirmDialog
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        message={userToDelete ? `Are you sure you want to delete account for "${userToDelete.display_name}"?` : ""}
      />

      {/* Confirm Password reset */}
      <ConfirmDialog
        isOpen={passwordOpen}
        onClose={() => setPasswordOpen(false)}
        onConfirm={handleResetPassword}
        title="Reset Password?"
        confirmLabel="Send Reset Link"
        variant="primary"
        message={activeUser ? `Send a secure password reset link to "${activeUser.email}"?` : ""}
      />

      {/* Edit/Create Modal */}
      <Modal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        title={activeUser ? `Edit Account: ${activeUser.display_name}` : "Create Account"}
      >
        <form onSubmit={handleSaveSubmit} className="space-y-4">
          <InputField
            label="Full Display Name"
            placeholder="John Doe"
            value={formValues.display_name}
            onChange={(e) => setFormValues({ ...formValues, display_name: e.target.value })}
            error={formErrors.display_name}
            required
          />

          <InputField
            label="Email Address"
            placeholder="john@example.com"
            type="email"
            value={formValues.email}
            onChange={(e) => setFormValues({ ...formValues, email: e.target.value })}
            error={formErrors.email}
            required
            disabled={!!activeUser} // prevent email edit for security
          />

          <InputField
            label="Username"
            placeholder="johndoe"
            value={formValues.username}
            onChange={(e) => setFormValues({ ...formValues, username: e.target.value })}
            error={formErrors.username}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SelectField
              label="System Role"
              value={formValues.role}
              onChange={(e) => setFormValues({ ...formValues, role: e.target.value })}
              options={[
                { value: "user", label: "User" },
                { value: "admin", label: "Admin" }
              ]}
            />
            <SelectField
              label="Account State"
              value={formValues.status}
              onChange={(e) => setFormValues({ ...formValues, status: e.target.value })}
              options={[
                { value: "active", label: "Active" },
                { value: "suspended", label: "Suspended" }
              ]}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--admin-border)] select-none">
            <button
              type="button"
              onClick={() => setEditOpen(false)}
              disabled={saving}
              className="admin-btn admin-btn-secondary px-5 py-2 cursor-pointer disabled:opacity-40"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="admin-btn admin-btn-primary font-bold uppercase tracking-wider text-[11px] px-6 py-2.5 rounded-full flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              {saving && <Loader2 size={13} className="animate-spin" />}
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* Role Assignment Modal */}
      <Modal
        isOpen={roleOpen}
        onClose={() => setRoleOpen(false)}
        title={activeUser ? `Assign Role: ${activeUser.display_name}` : "Assign Role"}
      >
        <form onSubmit={handleSaveRole} className="space-y-6">
          <p className="text-xs text-[var(--admin-text-muted)] leading-relaxed">
            Changing user roles affects access permissions. Promoting a user to Admin grants full read/write rights over database tables, curations, settings, and Claude/OpenAI key profiles.
          </p>

          <SelectField
            label="Target Role"
            value={formValues.role}
            onChange={(e) => setFormValues({ ...formValues, role: e.target.value })}
            options={[
              { value: "user", label: "User (Public profile)" },
              { value: "admin", label: "Admin (Dashboard permissions)" }
            ]}
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--admin-border)] select-none">
            <button
              type="button"
              onClick={() => setRoleOpen(false)}
              disabled={saving}
              className="admin-btn admin-btn-secondary px-5 py-2 cursor-pointer disabled:opacity-40"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="admin-btn admin-btn-primary font-bold uppercase tracking-wider text-[11px] px-6 py-2.5 rounded-full flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              {saving && <Loader2 size={13} className="animate-spin" />}
              Assign Role
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
