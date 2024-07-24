import React, { useState, useEffect } from "react";
import { getIdToken } from "../firebase"; // Assume this function exists to get the current user's ID token

interface User {
  id: string;
  name: string;
  email: string;
  status: "admin" | "user" | "disabled";
}

interface UsersProps {
  isAdminMode: boolean;
}

const Users: React.FC<UsersProps> = ({ isAdminMode }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<{
    [key: string]: "admin" | "user" | "disabled";
  }>({});

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const idToken = await getIdToken();
      const response = await fetch(
        "https://us-central1-olympiads.cloudfunctions.net/admin_users",
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        },
      );
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      const data = await response.json();
      setUsers(data.users);
      const initialSelectedStatus = data.users.reduce(
        (acc: { [key: string]: string }, user: User) => {
          acc[user.id] = user.status;
          return acc;
        },
        {},
      );
      setSelectedStatus(initialSelectedStatus);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to load users. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "admin":
        return "text-green-600 bg-green-100";
      case "user":
        return "text-blue-600 bg-blue-100";
      case "disabled":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const handleStatusChange = (
    userId: string,
    newStatus: "admin" | "user" | "disabled",
  ) => {
    setSelectedStatus((prev) => ({ ...prev, [userId]: newStatus }));
  };

  const handleSubmitChange = async (userId: string) => {
    try {
      const idToken = await getIdToken();
      const response = await fetch("api/update_user_status", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, newStatus: selectedStatus[userId] }),
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Users</h1>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              {isAdminMode && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(user.status)}`}
                  >
                    {user.status}
                  </span>
                </td>
                {isAdminMode && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={selectedStatus[user.id]}
                      onChange={(e) =>
                        handleStatusChange(
                          user.id,
                          e.target.value as "admin" | "user" | "disabled",
                        )
                      }
                      disabled={user.status === "admin"}
                      className="mr-2 p-1 border rounded"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                      <option value="disabled">Disabled</option>
                    </select>
                    <button
                      onClick={() => handleSubmitChange(user.id)}
                      disabled={
                        user.status === "admin" ||
                        user.status === selectedStatus[user.id]
                      }
                      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded disabled:opacity-50"
                    >
                      Update
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Users;
