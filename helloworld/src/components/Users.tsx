import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getIdToken } from "../firebase";
import { useUserDataContext } from "../contexts/UserDataContext";

interface User {
  id: string;
  name: string;
  email: string;
  status: "admin" | "user" | "disabled";
}

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isAdminMode } = useUserDataContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user?.isAdmin || !isAdminMode) {
      navigate("/");
      return;
    }

    fetchUsers();
  }, [user, isAdminMode, navigate]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const idToken = await getIdToken();
      const response = await fetch("/api/admin/users", {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      const data = await response.json();
      setUsers(data.users || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to load users. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (
    userId: string,
    newStatus: "admin" | "user" | "disabled",
  ) => {
    try {
      const idToken = await getIdToken();
      const response = await fetch("/api/admin/user", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, newStatus }),
      });
      if (!response.ok) {
        throw new Error("Failed to update user status");
      }
      await fetchUsers();
    } catch (err) {
      console.error("Error updating user status:", err);
      setError("Failed to update user status. Please try again.");
    }
  };

  if (!user?.isAdmin || !isAdminMode) {
    return null; // This will prevent any flickering before redirect
  }

  if (loading) {
    return <div className="p-4">Loading users...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Users</h1>
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Name</th>
            <th className="py-2 px-4 border-b">Email</th>
            <th className="py-2 px-4 border-b">Status</th>
            <th className="py-2 px-4 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td className="py-2 px-4 border-b">{user.name}</td>
              <td className="py-2 px-4 border-b">{user.email}</td>
              <td className="py-2 px-4 border-b">{user.status}</td>
              <td className="py-2 px-4 border-b">
                <select
                  value={user.status}
                  onChange={(e) =>
                    handleStatusChange(
                      user.id,
                      e.target.value as "admin" | "user" | "disabled",
                    )
                  }
                  className="border rounded p-1"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  <option value="disabled">Disabled</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Users;
