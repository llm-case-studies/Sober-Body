import { useState, useEffect, useCallback } from 'react';

export interface AzureUsageEntry {
  type: 'azure_call';
  secs: number;
  costUSD: number;
  timestamp: number;
}

// Daily budget limit in USD
const DAILY_BUDGET_LIMIT = 3.0;

// Get today's date string for comparison
function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

// Load usage data from localStorage
function loadUsageData(): AzureUsageEntry[] {
  try {
    const data = localStorage.getItem('azure_usage_outbox');
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading Azure usage data:', error);
    return [];
  }
}

// Save usage data to localStorage
function saveUsageData(entries: AzureUsageEntry[]): void {
  try {
    localStorage.setItem('azure_usage_outbox', JSON.stringify(entries));
  } catch (error) {
    console.error('Error saving Azure usage data:', error);
  }
}

// Get today's total spending
function getTodaySpending(entries: AzureUsageEntry[]): number {
  const today = getTodayString();
  return entries
    .filter(entry => {
      const entryDate = new Date(entry.timestamp).toISOString().split('T')[0];
      return entryDate === today;
    })
    .reduce((total, entry) => total + entry.costUSD, 0);
}

export function useAzureBudget() {
  const [budgetExceeded, setBudgetExceeded] = useState(false);
  const [todaySpending, setTodaySpending] = useState(0);
  const [usageEntries, setUsageEntries] = useState<AzureUsageEntry[]>([]);

  // Load initial data
  useEffect(() => {
    const entries = loadUsageData();
    setUsageEntries(entries);
    
    const spending = getTodaySpending(entries);
    setTodaySpending(spending);
    setBudgetExceeded(spending >= DAILY_BUDGET_LIMIT);
  }, []);

  // Check budget every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      const entries = loadUsageData();
      const spending = getTodaySpending(entries);
      
      setTodaySpending(spending);
      
      if (spending >= DAILY_BUDGET_LIMIT && !budgetExceeded) {
        setBudgetExceeded(true);
        // Show toast notification
        showBudgetExceededToast();
      }
    }, 5 * 60 * 1000); // 5 minutes
    
    return () => clearInterval(interval);
  }, [budgetExceeded]);

  // Reset budget at midnight
  useEffect(() => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const timeUntilMidnight = tomorrow.getTime() - now.getTime();
    
    const timeout = setTimeout(() => {
      setBudgetExceeded(false);
      setTodaySpending(0);
      // Cleanup old entries (keep last 7 days)
      cleanupOldEntries();
    }, timeUntilMidnight);
    
    return () => clearTimeout(timeout);
  }, []);

  // Add new usage entry
  const addUsageEntry = useCallback((secs: number, costUSD: number) => {
    const newEntry: AzureUsageEntry = {
      type: 'azure_call',
      secs,
      costUSD,
      timestamp: Date.now()
    };
    
    const updatedEntries = [...usageEntries, newEntry];
    setUsageEntries(updatedEntries);
    saveUsageData(updatedEntries);
    
    const newSpending = todaySpending + costUSD;
    setTodaySpending(newSpending);
    
    if (newSpending >= DAILY_BUDGET_LIMIT) {
      setBudgetExceeded(true);
      showBudgetExceededToast();
    }
  }, [usageEntries, todaySpending]);

  // Clean up old entries (older than 7 days)
  const cleanupOldEntries = useCallback(() => {
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    const filteredEntries = usageEntries.filter(entry => entry.timestamp > sevenDaysAgo);
    
    if (filteredEntries.length !== usageEntries.length) {
      setUsageEntries(filteredEntries);
      saveUsageData(filteredEntries);
    }
  }, [usageEntries]);

  return {
    budgetExceeded,
    todaySpending,
    remainingBudget: Math.max(0, DAILY_BUDGET_LIMIT - todaySpending),
    addUsageEntry,
    usageEntries: usageEntries.filter(entry => {
      const entryDate = new Date(entry.timestamp).toISOString().split('T')[0];
      return entryDate === getTodayString();
    })
  };
}

// Show budget exceeded toast notification
function showBudgetExceededToast() {
  // Create a simple toast notification
  const toast = document.createElement('div');
  toast.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 max-w-sm';
  toast.innerHTML = `
    <div class="flex items-center gap-2">
      <span class="text-xl">⚠️</span>
      <div>
        <div class="font-medium">Daily Azure budget reached</div>
        <div class="text-sm opacity-90">Azure scoring paused until midnight</div>
      </div>
    </div>
  `;
  
  document.body.appendChild(toast);
  
  // Remove toast after 5 seconds
  setTimeout(() => {
    if (toast.parentNode) {
      toast.parentNode.removeChild(toast);
    }
  }, 5000);
}