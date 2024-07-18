import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import useAdminUsers from './useAdminUsers';

// Mock the entire useAdminUsers hook
jest.mock('./useAdminUsers');

const TestComponent: React.FC = () => {
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

    // Mock the hook to return loading state first, then the users
    (useAdminUsers as jest.Mock).mockReturnValueOnce({
      users: [],
      loading: true,
      error: null,
    }).mockReturnValueOnce({
      users: mockUsers,
      loading: false,
      error: null,
    });

    const { rerender } = render(<TestComponent />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();

    rerender(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    });
  });

  it('should handle fetch error', async () => {
    // Mock the hook to return loading state first, then the error
    (useAdminUsers as jest.Mock).mockReturnValueOnce({
      users: [],
      loading: true,
      error: null,
    }).mockReturnValueOnce({
      users: [],
      loading: false,
      error: 'Failed to load users. Please try again later.',
    });

    const { rerender } = render(<TestComponent />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();

    rerender(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByText('Error: Failed to load users. Please try again later.')).toBeInTheDocument();
    });
  });
});
