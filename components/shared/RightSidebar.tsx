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

const RightSidebar = () => {
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

  return (
    <section className="custom-scrollbar rightsidebar">
      <div className="flex flex-1 flex-col justify-start">
        <h3 className="text-heading4-medium text-light-1">
          Suggested Communities
        </h3>
        {/* Communities will be added here later */}
      </div>

      <div className="flex flex-1 flex-col justify-start">
        <h3 className="text-heading4-medium text-light-1">Suggested Users</h3>
        <div className="mt-7 flex w-[350px] flex-col gap-4">
          {loading ? (
            <p className="text-gray-400">Loading users...</p>
          ) : users.length > 0 ? (
            <>
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between bg-dark-3 p-4 rounded-lg hover:bg-dark-4 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={user.image}
                      alt={user.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="text-light-1 font-medium">{user.name}</h3>
                      <p className="text-gray-1 text-small-medium">
                        @{user.username}
                      </p>
                    </div>
                  </div>
                  <Link href={`/profile/${user.id}`} className="user-card_btn">
                    View
                  </Link>
                </div>
              ))}
            </>
          ) : (
            <p className="text-gray-1">No users found</p>
          )}
        </div>
      </div>
    </section>
  );
};

export default RightSidebar;
