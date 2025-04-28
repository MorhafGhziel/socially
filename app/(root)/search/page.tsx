"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface User {
  id: string;
  name: string;
  username: string;
  image: string;
  bio?: string;
}

const SearchPage = () => {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const response = await fetch("/api/users");
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error("Error loading users:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(
        `/api/search/users?q=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error searching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = query
    ? users.filter(
        (user) =>
          user.name?.toLowerCase().includes(query.toLowerCase()) ||
          user.username?.toLowerCase().includes(query.toLowerCase())
      )
    : users;

  return (
    <div className="flex min-h-screen bg-[#121212]">
      <div className="flex-1 p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-4">Search Users</h1>
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search users..."
              className="w-full px-4 py-2 bg-[#1E1E1E] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-purple-500 px-4 py-1 rounded-md text-white"
            >
              Search
            </button>
          </form>
        </div>

        <div className="bg-[#1E1E1E] p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-white mb-4">
            {query ? "Search Results" : "Suggested Users"}
          </h2>
          {loading ? (
            <p className="text-gray-400">Loading users...</p>
          ) : filteredUsers.length > 0 ? (
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between bg-[#2A2A2A] p-4 rounded-lg hover:bg-[#333333] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={user.image}
                      alt={user.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="text-white font-medium">{user.name}</h3>
                      <p className="text-gray-400 text-sm">@{user.username}</p>
                    </div>
                  </div>
                  <Link
                    href={`/profile/${user.id}`}
                    className="bg-purple-500 px-4 py-1 rounded-md text-white text-sm hover:bg-purple-600 transition-colors"
                  >
                    View Profile
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">No users found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
