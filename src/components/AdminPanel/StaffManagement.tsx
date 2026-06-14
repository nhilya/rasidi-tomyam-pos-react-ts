import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Loader2,
  ChevronDown,
  ChevronRight,
  TriangleAlert,
  Eye,
  EyeOff,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useStore } from "@/store";
import {
  getStaff,
  getPastStaff,
  getRoles,
  getPermissions,
  assignPermissions,
  createStaff,
  updateStaff,
  deleteStaff,
  restoreStaff,
} from "@/api/staff";
import type { ApiUser } from "@/api/types";
import { ApiError } from "@/lib/api";
import { formatPhone, rawPhone } from "@/lib/phone";

const ROLE_COLORS: Record<string, string> = {
  super_admin: "bg-primary/10 text-primary border-primary/20",
  boss:        "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900",
  staff:       "bg-green-100 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-900",
};

const EMPTY_FORM = { name: "", phone: "", password: "", role: "staff" };

interface StaffTableProps {
  members: ApiUser[];
  loading?: boolean;
  onEdit: (member: ApiUser) => void;
  onDelete: (member: ApiUser) => void;
  onRestore?: (member: ApiUser) => void;
  emptyKey: string;
  showDeletedAt?: boolean;
}

function StaffTable({
  members,
  loading,
  onEdit,
  onDelete,
  onRestore,
  emptyKey,
  showDeletedAt,
}: StaffTableProps) {
  const { t } = useTranslation();
  const colSpan = showDeletedAt ? 7 : 6;
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t("staff.table.id")}</TableHead>
          <TableHead>{t("staff.table.name")}</TableHead>
          <TableHead>{t("staff.table.phone")}</TableHead>
          <TableHead>{t("staff.table.role")}</TableHead>
          <TableHead>{t("staff.table.joined")}</TableHead>
          {showDeletedAt && <TableHead>{t("staff.table.deletedAt")}</TableHead>}
          <TableHead className="text-right">{t("pos.actions")}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading ? (
          <TableRow>
            <TableCell
              colSpan={colSpan}
              className="h-32 text-center text-muted-foreground"
            >
              <Loader2 className="w-5 h-5 animate-spin mx-auto" />
            </TableCell>
          </TableRow>
        ) : members.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={colSpan}
              className="h-24 text-center text-muted-foreground text-sm"
            >
              {t(emptyKey)}
            </TableCell>
          </TableRow>
        ) : (
          members.map((member) => {
            const role = member.roles[0] ?? "staff";
            return (
              <TableRow key={member.id}>
                <TableCell className="text-muted-foreground font-mono text-sm w-12">
                  {member.id}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium text-foreground">
                      {member.name}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground font-mono text-sm">
                  {member.phone ? formatPhone(member.phone) : "—"}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={`capitalize text-[10px] uppercase ${ROLE_COLORS[role] ?? ""}`}
                  >
                    {t(`login.roles.${role}`, role)}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-xs">
                  {new Date(member.created_at).toLocaleDateString()}
                </TableCell>
                {showDeletedAt && (
                  <TableCell className="text-muted-foreground text-xs">
                    {member.deleted_at
                      ? new Date(member.deleted_at).toLocaleDateString()
                      : "—"}
                  </TableCell>
                )}
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {showDeletedAt ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-green-600"
                        onClick={() => onRestore?.(member)}
                        title={t("staff.restore")}
                      >
                        <RotateCcw className="w-4 h-4" />
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => onEdit(member)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => onDelete(member)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  );
}

export default function StaffManagement() {
  const { t } = useTranslation();
  const { user } = useStore();
  const [staff, setStaff] = React.useState<ApiUser[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingStaff, setEditingStaff] = React.useState<ApiUser | null>(null);
  const [form, setForm] = React.useState(EMPTY_FORM);
  const [pastExpanded, setPastExpanded] = React.useState(false);
  const [pastStaff, setPastStaff] = React.useState<ApiUser[]>([]);
  const [loadingPast, setLoadingPast] = React.useState(false);
  const [availableRoles, setAvailableRoles] = React.useState<string[]>([]);
  const [availablePermissions, setAvailablePermissions] = React.useState<
    string[]
  >([]);
  const [selectedPermissions, setSelectedPermissions] = React.useState<
    string[]
  >([]);
  const [deleteTarget, setDeleteTarget] = React.useState<ApiUser | null>(null);
  const [deleting, setDeleting] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  const canSeePastStaff = user?.role === "super_admin" || user?.role === "boss";

  React.useEffect(() => {
    getStaff()
      .then((res) => setStaff(res.data))
      .catch((err) =>
        toast.error(
          err instanceof ApiError ? err.message : "Failed to load staff",
        ),
      )
      .finally(() => setLoading(false));
    getRoles()
      .then(data => {
        const arr = Array.isArray(data) ? data : (data as { data?: unknown[] })?.data ?? [];
        setAvailableRoles(arr.map((r: unknown) =>
          typeof r === 'string' ? r : (r as { name: string }).name,
        ));
      })
      .catch(() => setAvailableRoles(["boss", "staff"]));
    getPermissions()
      .then(data => {
        if (Array.isArray(data)) {
          setAvailablePermissions(data);
        } else if (data && typeof data === 'object') {
          setAvailablePermissions((Object.values(data) as string[][]).flat());
        }
      })
      .catch(() =>
        setAvailablePermissions([
          "view-menu", "create-menu", "update-menu", "delete-menu",
          "view-orders", "create-orders", "update-order-status", "sync-external-orders",
          "view-customers", "view-expenses", "create-expenses", "delete-expenses",
          "view-reports", "manage-tables", "manage-staff",
        ]),
      );
  }, []);

  React.useEffect(() => {
    if (!pastExpanded || !canSeePastStaff || pastStaff.length > 0) return;
    setLoadingPast(true);
    getPastStaff()
      .then((res) => setPastStaff(res.data))
      .catch((err) =>
        toast.error(
          err instanceof ApiError ? err.message : "Failed to load past staff",
        ),
      )
      .finally(() => setLoadingPast(false));
  }, [pastExpanded, canSeePastStaff, pastStaff.length]);

  const applyFilters = (members: ApiUser[]) =>
    members.filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.phone ?? "").includes(searchTerm);
      const matchRole =
        roleFilter === "all" || (s.roles[0] ?? "") === roleFilter;
      return matchSearch && matchRole;
    });

  const filteredActive = applyFilters(staff);
  const filteredPast = applyFilters(pastStaff);

  const openCreate = () => {
    setEditingStaff(null);
    setForm(EMPTY_FORM);
    setSelectedPermissions([]);
    setIsDialogOpen(true);
  };

  const openEdit = (member: ApiUser) => {
    setEditingStaff(member);
    setForm({
      name: member.name,
      phone: member.phone ?? "",
      password: "",
      role: member.roles[0] ?? "staff",
    });
    setSelectedPermissions(member.permissions ?? []);
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.phone) {
      toast.error(t("staff.fillRequired"));
      return;
    }
    if (!editingStaff && !form.password) {
      toast.error(t("staff.fillRequired"));
      return;
    }
    const isGranularRole = form.role === "staff";
    setSaving(true);
    try {
      if (editingStaff) {
        const payload = {
          name: form.name,
          phone: form.phone,
          role: form.role,
          ...(form.password ? { password: form.password } : {}),
        };
        const updated = await updateStaff(editingStaff.id, payload);
        if (isGranularRole) {
          await assignPermissions(editingStaff.id, selectedPermissions);
        }
        setStaff((prev) =>
          prev.map((s) => (s.id === updated.id ? updated : s)),
        );
      } else {
        const created = await createStaff({
          name: form.name,
          phone: form.phone,
          password: form.password,
          role: form.role,
        });
        if (isGranularRole) {
          await assignPermissions(created.id, selectedPermissions);
        }
        setStaff((prev) => [...prev, created]);
      }
      toast.success(t("staff.saveSuccess"));
      setIsDialogOpen(false);
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Failed to save staff",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (member: ApiUser) => setDeleteTarget(member);

  const handleRestore = async (member: ApiUser) => {
    try {
      const restored = await restoreStaff(member.id);
      setPastStaff((prev) => prev.filter((s) => s.id !== member.id));
      setStaff((prev) => [...prev, restored]);
      toast.success(t("staff.restoreSuccess"));
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to restore staff");
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteStaff(deleteTarget.id);
      setStaff((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      setPastStaff((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      toast.success(t("staff.deleteSuccess"));
      setDeleteTarget(null);
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Failed to delete staff",
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-serif font-bold text-foreground">
            {t("staff.title")}
          </h2>
          <p className="text-muted-foreground">{t("staff.subtitle")}</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <Input
              placeholder={t("staff.search")}
              className="h-8 pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Dialog
            open={isDialogOpen}
            onOpenChange={(v) => {
              setIsDialogOpen(v);
              if (!v) {
                setShowPassword(false);
                setSelectedPermissions([]);
              }
            }}
          >
            <DialogTrigger
              render={
                <Button onClick={openCreate}>
                  <Plus className="w-4 h-4 mr-2" />
                  {t("staff.addStaff")}
                </Button>
              }
            />
            <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingStaff ? t("staff.editStaff") : t("staff.addStaff")}
                </DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>{t("staff.name")}</Label>
                  <Input
                    placeholder="Ahmad bin Ali"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>{t("staff.phone")}</Label>
                  <Input
                    type="tel"
                    placeholder="011-1234 5678"
                    value={formatPhone(form.phone)}
                    onChange={(e) =>
                      setForm({ ...form, phone: rawPhone(e.target.value) })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label>
                    {t("staff.password")}
                    {editingStaff && (
                      <span className="text-xs text-muted-foreground ml-2">
                        ({t("staff.passwordHint")})
                      </span>
                    )}
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pr-10"
                      value={form.password}
                      onChange={(e) =>
                        setForm({ ...form, password: e.target.value })
                      }
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>{t("staff.role")}</Label>
                  <Select
                    value={form.role}
                    onValueChange={(v) => {
                      setForm({ ...form, role: v });
                      if (v !== "staff")
                        setSelectedPermissions([]);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("staff.selectRole")} />
                    </SelectTrigger>
                    <SelectContent>
                      {availableRoles.map((role) => (
                        <SelectItem key={role} value={role}>
                          {String(
                            t(`login.roles.${role}`, { defaultValue: role }),
                          )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {(form.role === "staff") && (
                  <div className="grid gap-2">
                    <Label>{t("staff.permissions")}</Label>
                    <div className="border rounded-md p-3 max-h-52 overflow-y-auto space-y-1">
                      {availablePermissions.map((perm) => (
                        <label
                          key={perm}
                          className="flex items-center gap-2 cursor-pointer py-0.5 select-none"
                        >
                          <input
                            type="checkbox"
                            checked={selectedPermissions.includes(perm)}
                            onChange={(e) =>
                              setSelectedPermissions((prev) =>
                                e.target.checked
                                  ? [...prev, perm]
                                  : prev.filter((p) => p !== perm),
                              )
                            }
                            className="accent-primary h-4 w-4"
                          />
                          <span className="text-sm text-foreground">
                            {perm
                              .split("-")
                              .map(
                                (w) => w.charAt(0).toUpperCase() + w.slice(1),
                              )
                              .join(" ")}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  {t("staff.cancel")}
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  {t("staff.save")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setRoleFilter("all")}
          className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${roleFilter === "all" ? "bg-foreground text-background border-foreground" : "bg-transparent text-muted-foreground border-border hover:border-foreground hover:text-foreground"}`}
        >
          {t("categories.all")} ({staff.length})
        </button>
        {availableRoles.map((role) => {
          const count = staff.filter(
            (s: ApiUser) => (s.roles[0] ?? "") === role,
          ).length;
          if (count === 0) return null;
          return (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${roleFilter === role ? "bg-foreground text-background border-foreground" : "bg-transparent text-muted-foreground border-border hover:border-foreground hover:text-foreground"}`}
            >
              {String(t(`login.roles.${role}`, { defaultValue: role }))} (
              {count})
            </button>
          );
        })}
      </div>

      {/* Active Staff */}
      <Card className="border-border shadow-sm overflow-hidden">
        <StaffTable
          members={filteredActive}
          loading={loading}
          onEdit={openEdit}
          onDelete={handleDelete}
          emptyKey="staff.noStaff"
        />
      </Card>

      {/* Past Staff */}
      {canSeePastStaff && (
        <Card className="border-border shadow-sm overflow-hidden">
          <button
            type="button"
            onClick={() => setPastExpanded((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-foreground">
                {t("staff.pastStaff")}
              </span>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                {pastStaff.length}
              </span>
            </div>
            {pastExpanded ? (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
          {pastExpanded && (
            <StaffTable
              members={filteredPast}
              loading={loadingPast}
              onEdit={openEdit}
              onDelete={handleDelete}
              onRestore={handleRestore}
              emptyKey="staff.noPastStaff"
              showDeletedAt
            />
          )}
        </Card>
      )}

      {/* Delete confirmation dialog */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <DialogContent className="sm:max-w-sm text-center">
          <div className="flex flex-col items-center gap-4 py-2">
            <div className="w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-950/40 flex items-center justify-center">
              <TriangleAlert className="w-10 h-10 text-amber-500" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-foreground">
                {t("staff.confirmDeleteTitle")}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t("staff.confirmDeleteDesc", {
                  name: deleteTarget?.name ?? "",
                })}
              </p>
            </div>
            <div className="w-full space-y-2 pt-2">
              <Button
                variant="outline"
                className="w-full bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-900 dark:bg-amber-950/20 dark:border-amber-900 dark:text-amber-200"
                onClick={confirmDelete}
                disabled={deleting}
              >
                {deleting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                {t("staff.confirmDeleteYes")}
              </Button>
              <Button
                className="w-full"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
              >
                {t("staff.cancel")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
