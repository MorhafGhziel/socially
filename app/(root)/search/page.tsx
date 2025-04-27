"use client";

import { useState } from "react";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ users: any[]; threads: any[] }>({
    users: [],
    threads: [],
  });
  const [loading, setLoading] = useState(false);

  async function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
    const data = await res.json();
    setResults(data);
    setLoading(false);
  }

  return (
    <main className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="head-text mb-6">Search</h1>
      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search users..."
          className="flex-1 px-4 py-2 rounded-lg bg-dark-3 text-light-1 border border-dark-4 focus:outline-none"
        />
        <button
          type="submit"
          className="bg-primary-500 text-light-1 px-4 py-2 rounded-lg"
        >
          Search
        </button>
      </form>
      {loading && <p className="text-light-3">Searching...</p>}
      {!loading && (results.users.length > 0 || results.threads.length > 0) && (
        <div className="space-y-6">
          {results.users.length > 0 && (
            <div>
              <h2 className="text-light-2 text-lg mb-2">Users</h2>
              <ul className="space-y-2">
                {results.users.map((user) => (
                  <li
                    key={user.id}
                    className="flex items-center gap-3 bg-dark-2 p-3 rounded-lg"
                  >
                    <img
                      src={user.image}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <span className="text-light-1">{user.name}</span>
                    <span className="text-light-3 text-xs">
                      @{user.username}
                    </span>
                    <a
                      href={`/profile/${user.id}`}
                      className="ml-auto bg-primary-500 text-light-1 px-4 py-1.5 rounded-lg text-sm hover:bg-primary-600 transition-colors"
                    >
                      View
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {results.threads.length > 0 && (
            <div>
              <h2 className="text-light-2 text-lg mb-2">Threads</h2>
              <ul className="space-y-2">
                {results.threads.map((thread) => (
                  <li key={thread.id} className="bg-dark-2 p-3 rounded-lg">
                    <span className="text-light-1">{thread.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      {!loading &&
        query &&
        results.users.length === 0 &&
        results.threads.length === 0 && (
          <p className="text-light-3">No results found.</p>
        )}
    </main>
  );
}
