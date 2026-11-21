'use client';

import React from 'react';
import { useI18n } from '@/lib/i18n/context';
import { 
  CalendarCheck, 
  Home, 
  ArrowLeftRight, 
  MessageSquare, 
  Users, 
  Settings 
} from 'lucide-react';

export type NavTab = 'today' | 'iaq' | 'alternatives' | 'ask' | 'community' | 'settings';

interface NavigationProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const { t } = useI18n();

  const tabs: { id: NavTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'today', label: t.nav.today, icon: CalendarCheck },
    { id: 'iaq', label: t.nav.iaq, icon: Home },
    { id: 'alternatives', label: t.nav.alternatives, icon: ArrowLeftRight },
    { id: 'ask', label: t.nav.ask, icon: MessageSquare },
    { id: 'community', label: t.nav.community, icon: Users },
    { id: 'settings', label: t.nav.settings, icon: Settings },
  ];

  return (
    <nav 
      aria-label="Main Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg"
    >
      <div className="max-w-xl mx-auto flex items-center justify-around py-1.5 px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
                isActive 
                  ? 'text-teal-700 font-bold scale-105' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-[64px]">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
