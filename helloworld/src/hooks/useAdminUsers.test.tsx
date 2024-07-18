import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import useAdminUsers, { fetchUsers } from './useAdminUsers';

// Mock the fetchUsers function
jest.mock('./useAdminUsers', () => {
  const originalModule = jest.requireActual('./useAdminUsers');
  return {
    __esModule: true,
    ...originalModule,
    fetchUsers: jest.fn(),
  };
});

const TestComponent = () => {
  const { users, loading, error } = useAdminUsers();
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  return (
    <ul>
      {users.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
};

describe('useAdminUsers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch users and update state', async () => {
    const mockUsers = [
      { id: '1', name: 'John Doe', email: 'john@example.com' },
      { id: '2', name: 'Jane Doe', email: 'jane@example.com' },
    ];

    (fetchUsers as jest.Mock).mockResolvedValueOnce(mockUsers);

    render(<TestComponent />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    });
  });

  it('should handle fetch error', async () => {
    (fetchUsers as jest.Mock).mockRejectedValueOnce(new Error('Fetch failed'));

    render(<TestComponent />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Error: Failed to load users. Please try again later.')).toBeInTheDocument();
    });
  });
});
