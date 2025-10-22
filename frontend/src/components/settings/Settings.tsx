import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser } from "@/hooks/useApi";
import { User, CreateUserRequest } from "@/types";

const initialForm: CreateUserRequest = {
  username: "",
  email: "",
  first_name: "",
  last_name: "",
  password: "",
};

const Settings: React.FC = () => {
  const { data: users, isLoading } = useUsers();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  const [showDialog, setShowDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form, setForm] = useState<CreateUserRequest>(initialForm);
  const [showDelete, setShowDelete] = useState<{ open: boolean; user: User | null }>({ open: false, user: null });

  const openCreate = () => {
    setEditingUser(null);
    setForm(initialForm);
    setShowDialog(true);
  };

  const openEdit = (user: User) => {
    setEditingUser(user);
    setForm({
      username: user.username,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      password: "",
    });
    setShowDialog(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      await updateUser.mutateAsync({ id: editingUser.id, data: { ...form, password: form.password || undefined } });
    } else {
      await createUser.mutateAsync(form);
    }
    setShowDialog(false);
  };

  const handleDelete = async () => {
    if (showDelete.user) {
      await deleteUser.mutateAsync(showDelete.user.id);
      setShowDelete({ open: false, user: null });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between mb-4">
            <div className="text-lg font-semibold">Users</div>
            <Button onClick={openCreate}>Add User</Button>
          </div>
          {isLoading ? (
            <div>Loading users...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 px-4 text-left">Username</th>
                    <th className="py-2 px-4 text-left">Email</th>
                    <th className="py-2 px-4 text-left">Name</th>
                    <th className="py-2 px-4 text-center">Joined</th>
                    <th className="py-2 px-4 text-center">Last Login</th>
                    <th className="py-2 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users?.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-4">{user.username}</td>
                      <td className="py-2 px-4">{user.email}</td>
                      <td className="py-2 px-4">{user.first_name} {user.last_name}</td>
                      <td className="py-2 px-4 text-center">{new Date(user.date_joined).toLocaleDateString()}</td>
                      <td className="py-2 px-4 text-center">{user.last_login ? new Date(user.last_login).toLocaleString() : "-"}</td>
                      <td className="py-2 px-4 text-center space-x-2">
                        <Button size="sm" variant="outline" onClick={() => openEdit(user)}>Edit</Button>
                        <Button size="sm" variant="destructive" onClick={() => setShowDelete({ open: true, user })}>Delete</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit User Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingUser ? "Edit User" : "Add User"}</DialogTitle>
            <DialogDescription>
              {editingUser ? "Update user details." : "Create a new user account."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="Username"
              value={form.username}
              onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
              required
            />
            <Input
              placeholder="Email"
              type="email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              required
            />
            <div className="flex gap-2">
              <Input
                placeholder="First Name"
                value={form.first_name}
                onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))}
                required
              />
              <Input
                placeholder="Last Name"
                value={form.last_name}
                onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))}
                required
              />
            </div>
            <Input
              placeholder="Password"
              type="password"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              required={!editingUser}
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createUser.isLoading || updateUser.isLoading}>
                {editingUser ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      {showDelete.open && (
        <Dialog open={showDelete.open} onOpenChange={open => setShowDelete({ open, user: showDelete.user })}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete User</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete user <b>{showDelete.user?.username}</b>?
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowDelete({ open: false, user: null })}>Cancel</Button>
              <Button variant="destructive" onClick={handleDelete} disabled={deleteUser.isLoading}>
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Settings; 