import React from 'react';
import { NavLink } from 'react-router-dom';

export default function TabBar() {
  const navItems = [
    { name: 'Home', path: '/m/decks', icon: '🏠' },
    { name: 'Drill', path: '/m/coach', icon: '🎤' },
    { name: 'Wizard', path: '/m/teacher-wizard', icon: '🧙‍♂️' },
    { name: 'Settings', path: '/m/settings', icon: '⚙️' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-800 text-white flex justify-around py-2 shadow-lg">
      {navItems.map((item) => (
        <NavLink
          key={item.name}
          to={item.path}
          className={({ isActive }) =>
            `flex flex-col items-center text-xs px-2 py-1 rounded-md ${isActive ? 'text-blue-400' : 'text-gray-300'}`
          }
        >
          <span className="text-xl mb-1">{item.icon}</span>
          {item.name}
        </NavLink>
      ))}
    </div>
  );
}
