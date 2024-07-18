import { useState, useEffect, useCallback } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
}

export const fetchUsers = async (): Promise<User[]> => {
  const response = await fetch(
    "https://us-central1-olympiads.cloudfunctions.net/admin_users"
  );
  if (!response.ok) {
    throw new Error("Failed to fetch users");
  }
  const data = await response.json();
  return data.users || [];
};

const useAdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const fetchedUsers = await fetchUsers();
      setUsers(fetchedUsers);
      setError(null);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to load users. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  return { users, loading, error, refetch: loadUsers };
};

export default useAdminUsers;
