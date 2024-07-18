import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import UserMenu from './UserMenu';

// Mock the GoogleLogin component
jest.mock('@react-oauth/google', () => ({
  GoogleLogin: () => <button>Mock Google Login</button>,
}));

describe('UserMenu', () => {
  const mockUser = { name: 'Test User', avatar: 'https://example.com/avatar.jpg' };
  const mockLogin = jest.fn();
  const mockLogout = jest.fn();
  const mockBypassLogin = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders user menu button when logged in', () => {
    render(
      <UserMenu
        user={mockUser}
        isLoggedIn={true}
        login={mockLogin}
        logout={mockLogout}
        bypassLogin={mockBypassLogin}
      />
    );

    expect(screen.getByRole('button', { name: /user menu/i })).toBeInTheDocument();
    expect(screen.getByAltText('Test User')).toBeInTheDocument();
  });

  it('renders login button when not logged in', () => {
    render(
      <UserMenu
        user={null}
        isLoggedIn={false}
        login={mockLogin}
        logout={mockLogout}
        bypassLogin={mockBypassLogin}
      />
    );

    expect(screen.getByRole('button', { name: /user menu/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /user menu/i }));
    expect(screen.getByText('Login')).toBeInTheDocument();
  });

  it('calls logout function when logout is clicked', () => {
    render(
      <UserMenu
        user={mockUser}
        isLoggedIn={true}
        login={mockLogin}
        logout={mockLogout}
        bypassLogin={mockBypassLogin}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /user menu/i }));
    fireEvent.click(screen.getByText('Logout'));
    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

  it('shows login dialog when login is clicked', () => {
    render(
      <UserMenu
        user={null}
        isLoggedIn={false}
        login={mockLogin}
        logout={mockLogout}
        bypassLogin={mockBypassLogin}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /user menu/i }));
    fireEvent.click(screen.getByText('Login'));
    expect(screen.getByText('Mock Google Login')).toBeInTheDocument();
  });

  it('calls bypassLogin function when bypass login is clicked', () => {
    render(
      <UserMenu
        user={null}
        isLoggedIn={false}
        login={mockLogin}
        logout={mockLogout}
        bypassLogin={mockBypassLogin}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /user menu/i }));
    fireEvent.click(screen.getByText('Bypass Login'));
    expect(mockBypassLogin).toHaveBeenCalledTimes(1);
  });
});
