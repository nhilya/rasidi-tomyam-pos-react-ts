import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Loader2, ShieldCheck, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { getRoles, getPermissions, createRole, updateRole, deleteRole } from '@/api/staff';
import type { ApiRole } from '@/api/staff';
import { ApiError } from '@/lib/api';

const PERMISSION_GROUPS = [
  {
    key: 'menu',
    label: 'Menu Management',
    permissions: ['view-menu', 'create-menu', 'update-menu', 'delete-menu'],
  },
  {
    key: 'orders',
    label: 'Order Management',
    permissions: ['view-orders', 'create-orders', 'update-order-status', 'sync-external-orders'],
  },
  {
    key: 'customers',
    label: 'Customer Management',
    permissions: ['view-customers'],
  },
  {
    key: 'expenses',
    label: 'Expense Management',
    permissions: ['view-expenses', 'create-expenses', 'delete-expenses'],
  },
  {
    key: 'reports',
    label: 'Reports',
    permissions: ['view-reports'],
  },
  {
    key: 'tables',
    label: 'Tables',
    permissions: ['manage-tables'],
  },
  {
    key: 'staff',
    label: 'Staff & Roles',
    permissions: ['manage-staff'],
  },
];

function GroupCheckbox({
  checked,
  indeterminate,
  onChange,
}: {
  checked: boolean;
  indeterminate: boolean;
  onChange: () => void;
}) {
  const ref = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate;
  }, [indeterminate]);
  return (
    <input
      ref={ref}
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="accent-primary h-4 w-4"
    />
  );
}

const PERM_FALLBACK = [
  'view-menu', 'create-menu', 'update-menu', 'delete-menu',
  'view-orders', 'create-orders', 'update-order-status', 'sync-external-orders',
  'view-customers', 'view-expenses', 'create-expenses', 'delete-expenses',
  'view-reports', 'manage-tables', 'manage-staff',
];

export default function RolesManagement() {
  const { t } = useTranslation();
  const [roles, setRoles] = React.useState<ApiRole[]>([]);
  const [availablePermissions, setAvailablePermissions] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(true);

  // form state (shared between create + edit)
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingRole, setEditingRole] = React.useState<ApiRole | null>(null);
  const [roleName, setRoleName] = React.useState('');
  const [selectedPermissions, setSelectedPermissions] = React.useState<string[]>([]);
  const [saving, setSaving] = React.useState(false);

  // delete state
  const [deletingRole, setDeletingRole] = React.useState<ApiRole | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  React.useEffect(() => {
    Promise.all([
      getRoles().catch(() => [] as ApiRole[]),
      getPermissions().catch(() => ({}) as Record<string, string[]>),
    ])
      .then(([rolesData, permsData]) => {
        // roles: handle paginated wrapper
        const rolesArr: ApiRole[] = Array.isArray(rolesData)
          ? rolesData
          : Array.isArray((rolesData as { data?: ApiRole[] })?.data)
            ? (rolesData as { data: ApiRole[] }).data
            : [];
        setRoles(rolesArr);

        // permissions: grouped object → flat array
        const permsFlat: string[] = Array.isArray(permsData)
          ? permsData as unknown as string[]
          : permsData && typeof permsData === 'object'
            ? (Object.values(permsData) as string[][]).flat()
            : PERM_FALLBACK;
        setAvailablePermissions(permsFlat.length > 0 ? permsFlat : PERM_FALLBACK);
      })
      .finally(() => setLoading(false));
  }, []);

  const openCreate = () => {
    setEditingRole(null);
    setRoleName('');
    setSelectedPermissions([]);
    setIsFormOpen(true);
  };

  const openEdit = (role: ApiRole) => {
    setEditingRole(role);
    setRoleName(role.name.replace(/_/g, ' '));
    setSelectedPermissions([...role.permissions]);
    setIsFormOpen(true);
  };

  const togglePermission = (perm: string) => {
    setSelectedPermissions(prev =>
      prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm],
    );
  };

  const toggleGroup = (groupPerms: string[]) => {
    const available = groupPerms.filter(p => availablePermissions.includes(p));
    const allChecked = available.every(p => selectedPermissions.includes(p));
    if (allChecked) {
      setSelectedPermissions(prev => prev.filter(p => !available.includes(p)));
    } else {
      setSelectedPermissions(prev => [...new Set([...prev, ...available])]);
    }
  };

  const handleSave = async () => {
    if (!roleName.trim()) {
      toast.error('Role name is required.');
      return;
    }
    setSaving(true);
    try {
      const slug = roleName.trim().toLowerCase().replace(/\s+/g, '_');
      if (editingRole) {
        const updated = await updateRole(editingRole.id, { name: slug, permissions: selectedPermissions });
        setRoles(prev => prev.map(r => r.id === updated.id ? updated : r));
        toast.success('Role updated.');
      } else {
        const created = await createRole({ name: slug, permissions: selectedPermissions });
        setRoles(prev => [...prev, created]);
        toast.success('Role created.');
      }
      setIsFormOpen(false);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to save role.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingRole) return;
    setDeleting(true);
    try {
      await deleteRole(deletingRole.id);
      setRoles(prev => prev.filter(r => r.id !== deletingRole.id));
      toast.success('Role deleted.');
      setDeletingRole(null);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to delete role.');
    } finally {
      setDeleting(false);
    }
  };

  const isEditMode = editingRole !== null;
  const roleNameSlug = roleName.trim().toLowerCase().replace(/\s+/g, '_');

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-serif font-bold text-foreground">
            {t('nav.roles')}
          </h2>
          <p className="text-muted-foreground">
            Manage roles and their access permissions.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Create New Role
        </Button>
      </div>

      <Card className="border-border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Role</TableHead>
              <TableHead>Permissions</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="w-24" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : roles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground text-sm">
                  No roles found.
                </TableCell>
              </TableRow>
            ) : (
              roles.map(role => (
                <TableRow key={role.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium text-foreground capitalize">
                        {String(t(`login.roles.${role.name}`, { defaultValue: role.name.replace(/_/g, ' ') }))}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {role.permissions.length} permission{role.permissions.length !== 1 ? 's' : ''}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        role.is_system
                          ? 'text-muted-foreground border-border'
                          : 'text-primary border-primary/30 bg-primary/5'
                      }
                    >
                      {role.is_system ? 'System' : 'Custom'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {!role.is_system && (
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={() => openEdit(role)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => setDeletingRole(role)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Create / Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Edit Role' : 'Create New Role'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-5 py-4">
            <div className="grid gap-2">
              <Label>Role Name</Label>
              <Input
                placeholder="e.g. Kitchen Supervisor"
                value={roleName}
                onChange={e => setRoleName(e.target.value)}
              />
              {roleNameSlug && (
                <p className="text-xs text-muted-foreground">
                  Will be saved as: <code className="bg-muted px-1 rounded text-xs">{roleNameSlug}</code>
                </p>
              )}
            </div>

            <div className="grid gap-3">
              <Label>Permissions</Label>
              {PERMISSION_GROUPS.map(group => {
                const groupAvail = group.permissions.filter(p =>
                  availablePermissions.includes(p),
                );
                if (groupAvail.length === 0) return null;
                const allChecked = groupAvail.every(p => selectedPermissions.includes(p));
                const someChecked = groupAvail.some(p => selectedPermissions.includes(p));
                return (
                  <div key={group.key} className="border rounded-md overflow-hidden">
                    <label className="flex items-center gap-2 px-3 py-2 bg-muted/50 cursor-pointer select-none">
                      <GroupCheckbox
                        checked={allChecked}
                        indeterminate={someChecked && !allChecked}
                        onChange={() => toggleGroup(group.permissions)}
                      />
                      <span className="font-medium text-sm text-foreground">{group.label}</span>
                      <span className="ml-auto text-xs text-muted-foreground">
                        {groupAvail.filter(p => selectedPermissions.includes(p)).length}/{groupAvail.length}
                      </span>
                    </label>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 px-3 py-2">
                      {groupAvail.map(perm => (
                        <label
                          key={perm}
                          className="flex items-center gap-2 cursor-pointer py-0.5 select-none"
                        >
                          <input
                            type="checkbox"
                            checked={selectedPermissions.includes(perm)}
                            onChange={() => togglePermission(perm)}
                            className="accent-primary h-4 w-4"
                          />
                          <span className="text-sm text-foreground">
                            {perm
                              .split('-')
                              .map(w => w.charAt(0).toUpperCase() + w.slice(1))
                              .join(' ')}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="text-xs text-muted-foreground">
              {selectedPermissions.length} permission{selectedPermissions.length !== 1 ? 's' : ''} selected
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {isEditMode ? 'Save Changes' : 'Create Role'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deletingRole !== null} onOpenChange={open => { if (!open) setDeletingRole(null); }}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete Role</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground py-2">
            Delete <span className="font-medium text-foreground capitalize">{deletingRole?.name.replace(/_/g, ' ')}</span>?
            Staff assigned this role will lose their permissions.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingRole(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
