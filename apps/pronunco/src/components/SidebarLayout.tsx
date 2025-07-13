import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface SidebarLayoutProps {
  children: React.ReactNode;
}

export default function SidebarLayout({ children }: SidebarLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();

  const navItems = [
    { name: 'Coach', path: '/coach/demo', icon: '🎤' },
    { name: 'Decks', path: '/decks', icon: '📚' },
    { name: 'Settings', path: '/settings', icon: '⚙️' },
    { name: 'Teacher Wizard', path: '/teacher-wizard', icon: '🧙‍♂️' }, // Placeholder
    { name: 'Challenge', path: '/c', icon: '🏆', hideable: true }, // Hideable for friends
  ];

  // Simple state to control visibility of Challenge link
  const [showChallengeLink, setShowChallengeLink] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`bg-gray-800 text-white transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'} flex flex-col`}
      >
        <div className="p-4 flex items-center justify-between">
          {isSidebarOpen && <h1 className="text-2xl font-bold">PronunCo</h1>}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            {isSidebarOpen ? '←' : '→'}
          </button>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-2">
          {navItems.map((item) => (
            (!(item.hideable && !showChallengeLink)) ? (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center py-2 px-3 rounded-md transition-colors duration-200 ${location.pathname.startsWith(item.path) ? 'bg-blue-600 text-white' : 'hover:bg-gray-700'}`}
            >
              <span className="text-xl mr-3">{item.icon}</span>
              {isSidebarOpen && <span className="font-medium">{item.name}</span>}
            </Link>
            ) : null
          ))}
        </nav>

        {/* Toggle for Challenge link visibility */}
        <div className="p-4 border-t border-gray-700">
          {isSidebarOpen && (
            <label className="flex items-center text-sm text-gray-400">
              <input
                type="checkbox"
                checked={showChallengeLink}
                onChange={() => setShowChallengeLink(!showChallengeLink)}
                className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
              />
              <span className="ml-2">Show Challenge Link</span>
            </label>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4">
          {children}
        </main>
      </div>
    </div>
  );
}
