import React, { useState, useEffect } from "react";
import { getIdToken } from "../firebase";
import { useUserDataContext } from "../contexts/UserDataContext";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isAdmin: boolean;
  isStaff: boolean;
  createdAt: string;
  lastLogin: string;
  points: number;
}

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isAdminMode } = useUserDataContext();

  const addDebugInfo = (info: string) => {
    console.log(info);
  };

  useEffect(() => {
    addDebugInfo("Users component mounted");
    addDebugInfo(`isAdminMode: ${isAdminMode}`);
    addDebugInfo(`user: ${JSON.stringify(user)}`);

    const fetchUsers = async () => {
      try {
        addDebugInfo("Fetching users...");
        setLoading(true);
        const idToken = await getIdToken();
        addDebugInfo("Got ID token");

        const response = await fetch("/api/admin/users", {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });
        addDebugInfo(`API response status: ${response.status}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch users: ${response.statusText}`);
        }

        const data = await response.json();
        addDebugInfo(`Received data: ${JSON.stringify(data)}`);

        if (Array.isArray(data.users)) {
          setUsers(data.users);
        } else {
          throw new Error("Unexpected data structure");
        }
        setError(null);
      } catch (err) {
        console.error("Error fetching users:", err);
        setError("Failed to load users. Please try again later.");
        addDebugInfo(`Error: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [user, isAdminMode]);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Users</h1>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-500">{error}</div>}
      {!loading && !error && (
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
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Admin
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Staff
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Points
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created At
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Login
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.role}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.isAdmin ? "Yes" : "No"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.isStaff ? "Yes" : "No"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.points}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(user.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(user.lastLogin).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Users;
