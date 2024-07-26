import React, { useState, useEffect } from "react";
import { useUserDataContext } from "../contexts/UserDataContext";
import { getIdToken } from "../firebase";

interface UserProfileData {
  name: string;
  email: string;
  avatar: string;
  role: string;
  isAdmin: boolean;
  isStaff: boolean;
  createdAt: string;
  lastLogin: string;
  points: number;
  testsTaken: string[];
}

const UserProfile: React.FC = () => {
  const { user } = useUserDataContext();
  const [profileData, setProfileData] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return;

      try {
        const idToken = await getIdToken();
        const response = await fetch("/api/user/profile", {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch profile data");
        }

        const data = await response.json();
        setProfileData(data);
      } catch (err) {
        setError("Failed to load profile data. Please try again later.");
        console.error("Error fetching profile data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [user]);

  if (loading) {
    return <div>Loading profile...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!profileData) {
    return <div>No profile data available.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">User Profile</h1>
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 flex flex-col">
        <div className="mb-4">
          <img
            src={profileData.avatar}
            alt={profileData.name}
            className="w-24 h-24 rounded-full mx-auto"
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="name"
          >
            Name
          </label>
          <p className="text-gray-700" id="name">
            {profileData.name}
          </p>
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="email"
          >
            Email
          </label>
          <p className="text-gray-700" id="email">
            {profileData.email}
          </p>
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="role"
          >
            Role
          </label>
          <p className="text-gray-700" id="role">
            {profileData.role}
          </p>
        </div>
        {profileData.isAdmin && (
          <div className="mb-4">
            <p className="text-green-500 font-bold">Admin</p>
          </div>
        )}
        {profileData.isStaff && (
          <div className="mb-4">
            <p className="text-blue-500 font-bold">Staff</p>
          </div>
        )}
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="points"
          >
            Points
          </label>
          <p className="text-gray-700" id="points">
            {profileData.points}
          </p>
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="created-at"
          >
            Account Created
          </label>
          <p className="text-gray-700" id="created-at">
            {new Date(profileData.createdAt).toLocaleString()}
          </p>
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="last-login"
          >
            Last Login
          </label>
          <p className="text-gray-700" id="last-login">
            {new Date(profileData.lastLogin).toLocaleString()}
          </p>
        </div>
        {profileData.testsTaken.length > 0 && (
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="tests-taken"
            >
              Tests Taken
            </label>
            <ul className="list-disc list-inside" id="tests-taken">
              {profileData.testsTaken.map((test, index) => (
                <li key={index} className="text-gray-700">
                  {test}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
