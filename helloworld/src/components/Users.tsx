import React, { useState, useEffect, useCallback } from "react";
import { getIdToken } from "../firebase";
import { useUserDataContext } from "../contexts/UserDataContext";
import { useNavigate } from "react-router-dom";

interface User {
  id: string;
  name: string;
  email: string;
  status: "admin" | "user" | "disabled";
}

const Users: React.FC<{ isAdminMode: boolean }> = ({ isAdminMode }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUserDataContext();
  const navigate = useNavigate();

  const fetchUsers = useCallback(async () => {
    try {
      console.log("Fetching users...");
      console.log("Is admin mode:", isAdminMode);
      console.log("Current user:", user);

      setLoading(true);
      const idToken = await getIdToken();
      console.log("Got ID token");

      const response = await fetch("/api/admin/users", {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });
      console.log("API response status:", response.status);

      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Received data:", data);

      setUsers(data.users || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to load users. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [isAdminMode, user]);

  useEffect(() => {
    if (!isAdminMode || !user?.isAdmin) {
      console.log("Not admin or admin mode not enabled. Redirecting...");
      navigate("/");
      return;
    }

    fetchUsers();
  }, [fetchUsers, isAdminMode, user, navigate]);

  if (!isAdminMode || !user?.isAdmin) {
    return null; // or return a "Permission Denied" message
  }

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
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.status === "admin"
                        ? "bg-green-100 text-green-800"
                        : user.status === "disabled"
                          ? "bg-red-100 text-red-800"
                          : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {user.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Users;
