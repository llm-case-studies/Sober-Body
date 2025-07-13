import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NewDrillWizard from '../components/NewDrillWizard';

export default function TeacherWizardPage() {
  const [showWizard, setShowWizard] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-4xl mx-auto px-6">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">🧙‍♂️ Teacher Drill Wizard</h1>
          
          <div className="space-y-6">
            <p className="text-lg text-gray-700">
              Welcome to the Teacher Drill Wizard! Create engaging pronunciation drills for your students with AI assistance.
            </p>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-blue-50 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-blue-900 mb-3">✨ Create New Drill</h2>
                <p className="text-blue-700 mb-4">
                  Use AI to generate pronunciation drills on any topic. Perfect for creating targeted practice sessions.
                </p>
                <button
                  onClick={() => setShowWizard(true)}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors font-medium"
                >
                  🚀 Launch Drill Creator
                </button>
              </div>
              
              <div className="bg-green-50 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-green-900 mb-3">📚 Manage Existing Drills</h2>
                <p className="text-green-700 mb-4">
                  Organize your drills into folders, import content, and manage your lesson library.
                </p>
                <button
                  onClick={() => navigate('/decks')}
                  className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:outline-none transition-colors font-medium"
                >
                  📁 Open Deck Manager
                </button>
              </div>
            </div>
            
            <div className="bg-amber-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-amber-900 mb-3">💡 Tips for Effective Drills</h2>
              <ul className="text-amber-800 space-y-2">
                <li>• <strong>Start simple:</strong> Use common vocabulary before advanced topics</li>
                <li>• <strong>Mix difficulties:</strong> Combine easy and challenging phrases for better learning</li>
                <li>• <strong>Use context:</strong> Create drills around real-life situations (restaurant, travel, etc.)</li>
                <li>• <strong>Organize folders:</strong> Group drills by topic, difficulty, or lesson plan</li>
                <li>• <strong>Test yourself:</strong> Practice the drills to ensure appropriate difficulty</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      <NewDrillWizard 
        open={showWizard} 
        onClose={() => setShowWizard(false)} 
      />
    </div>
  );
}
