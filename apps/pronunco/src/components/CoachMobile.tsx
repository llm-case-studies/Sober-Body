import React, { useEffect } from 'react';
import { PronunciationCoachUI } from 'coach-ui';

const CoachMobile: React.FC = () => {
  useEffect(() => {
    // Add mobile-specific CSS overrides
    const style = document.createElement('style');
    style.textContent = `
      .mobile-coach-wrapper .min-h-screen {
        min-height: auto !important;
        padding: 0 !important;
      }
      
      .mobile-coach-wrapper .max-w-7xl {
        max-width: 100% !important;
        padding: 0 !important;
      }
      
      .mobile-coach-wrapper .flex-row,
      .mobile-coach-wrapper .flex.flex-row,
      .mobile-coach-wrapper div.flex {
        flex-direction: column !important;
        gap: 1rem !important;
        display: flex !important;
      }
      
      .mobile-coach-wrapper .min-h-\\[600px\\] {
        min-height: auto !important;
      }
      
      /* Override inline styles with !important */
      .mobile-coach-wrapper div[style*="minWidth"] {
        min-width: auto !important;
        max-width: 100% !important;
        width: 100% !important;
      }
      
      /* Make the panels stack vertically and adjust sizes */
      .mobile-coach-wrapper > div > div > div:first-child,
      .mobile-coach-wrapper .flex-1:first-child {
        max-height: 75vh !important;
        max-width: 100% !important;
        min-width: auto !important;
        margin-bottom: 1rem !important;
        flex: none !important;
        width: 100% !important;
      }
      
      .mobile-coach-wrapper > div > div > div:last-child,
      .mobile-coach-wrapper .flex-1:last-child {
        max-width: 100% !important;
        min-width: auto !important;
        flex: none !important;
        width: 100% !important;
      }
      
      /* Adjust text areas for mobile */
      .mobile-coach-wrapper textarea {
        max-height: 30vh !important;
        min-height: 120px !important;
      }
      
      /* Make buttons larger for mobile */
      .mobile-coach-wrapper button {
        min-height: 44px !important;
        padding: 0.75rem 1rem !important;
        font-size: 1rem !important;
      }
      
      /* Adjust select elements */
      .mobile-coach-wrapper select {
        min-height: 44px !important;
        padding: 0.75rem !important;
        font-size: 1rem !important;
      }
      
      /* Stack grid items on mobile */
      .mobile-coach-wrapper .grid-cols-2,
      .mobile-coach-wrapper .sm\\:grid-cols-2 {
        grid-template-columns: 1fr !important;
        gap: 1rem !important;
      }
      
      /* Improve spacing for mobile */
      .mobile-coach-wrapper .space-y-4 > * + * {
        margin-top: 1rem !important;
      }
      
      /* Make the prompt text larger and more readable */
      .mobile-coach-wrapper .text-2xl {
        font-size: 1.5rem !important;
        line-height: 1.4 !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Mobile-optimized coach layout with vertical stacking */}
      <div className="flex-1 p-4">
        <div className="mobile-coach-wrapper">
          <PronunciationCoachUI />
        </div>
      </div>
    </div>
  );
};

export default CoachMobile;