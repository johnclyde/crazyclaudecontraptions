import React, { useState, useEffect } from "react";
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

        setUsers(data.users || []);
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
      )}
    </div>
  );
};

export default Users;
