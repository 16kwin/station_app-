// TabContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

export interface Tab {
  id: string;
  path: string;
  label: string;
  component: ReactNode;
  parentTabId?: string;
}

interface TabContextType {
  tabs: Tab[];
  activeTabId: string | null;
  openTab: (path: string, label: string, component: ReactNode, parentTabId?: string) => string;
  closeTab: (id: string) => void;
  switchTab: (id: string) => void;
  openNewTab: () => void;
  updateTabComponent: (id: string, component: ReactNode) => void;
  updateTabLabel: (id: string, label: string) => void;
}

const TabContext = createContext<TabContextType | undefined>(undefined);

const getLabelWithNumber = (path: string, baseLabel: string, existingTabs: Tab[]): string => {
  const samePathTabs = existingTabs.filter(tab => tab.path === path);
  const count = samePathTabs.length;
  
  if (count === 0) {
    return baseLabel;
  }
  
  return `${baseLabel} (${count + 1})`;
};

const saveTabsToStorage = (tabs: Tab[], activeId: string | null) => {
  const toSave = {
    tabs: tabs.map(tab => ({
      id: tab.id,
      path: tab.path,
      label: tab.label,
      parentTabId: tab.parentTabId,
    })),
    activeTabId: activeId,
  };
  localStorage.setItem('tabs_state', JSON.stringify(toSave));
};

const loadTabsFromStorage = (): { tabs: Omit<Tab, 'component'>[]; activeTabId: string | null } | null => {
  const saved = localStorage.getItem('tabs_state');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }
  }
  return null;
};

export const TabProvider = ({ children }: { children: ReactNode }) => {
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [isRestored, setIsRestored] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const saved = loadTabsFromStorage();
    if (saved && saved.tabs.length > 0) {
      const restoredTabs: Tab[] = saved.tabs.map(tab => ({
        ...tab,
        component: null,
      }));
      setTabs(restoredTabs);
      setActiveTabId(saved.activeTabId);
      
      const activeTab = restoredTabs.find(t => t.id === saved.activeTabId);
      if (activeTab) {
        navigate(activeTab.path);
      } else if (restoredTabs.length > 0) {
        navigate(restoredTabs[0].path);
      }
    } else {
      const mainTab: Tab = {
        id: Date.now().toString(),
        path: '/main',
        label: 'Главная',
        component: null,
      };
      setTabs([mainTab]);
      setActiveTabId(mainTab.id);
      navigate('/main');
    }
    setIsRestored(true);
  }, []);

  useEffect(() => {
    if (isRestored && tabs.length > 0) {
      saveTabsToStorage(tabs, activeTabId);
    }
  }, [tabs, activeTabId, isRestored]);

  const openTab = useCallback((path: string, baseLabel: string, component: ReactNode, parentTabId?: string): string => {
    const existingTab = tabs.find(tab => tab.path === path);
    if (existingTab) {
      if (activeTabId !== existingTab.id) {
        setActiveTabId(existingTab.id);
      }
      navigate(path);
      return existingTab.id;
    }
    
    const label = getLabelWithNumber(path, baseLabel, tabs);
    const newId = Date.now().toString() + Math.random().toString(36).substr(2, 6);
    const newTab: Tab = {
      id: newId,
      path,
      label,
      component,
      parentTabId,
    };
    
    setTabs(prev => [...prev, newTab]);
    setActiveTabId(newId);
    navigate(path);
    return newId;
  }, [tabs, activeTabId, navigate]);

  const closeTab = useCallback((id: string) => {
    const tabToClose = tabs.find(tab => tab.id === id);
    
    if (tabs.length === 1 && tabToClose?.path === '/main') {
      return;
    }
    
    const newTabs = tabs.filter(tab => tab.id !== id);
    
    if (newTabs.length === 0) {
      const mainTab: Tab = {
        id: Date.now().toString(),
        path: '/main',
        label: 'Главная',
        component: null,
      };
      setTabs([mainTab]);
      setActiveTabId(mainTab.id);
      navigate('/main');
      return;
    }
    
    setTabs(newTabs);
    
    if (activeTabId === id) {
      // Если у закрываемой вкладки есть родитель — пробуем перейти на него
      if (tabToClose?.parentTabId) {
        const parentTab = newTabs.find(t => t.id === tabToClose.parentTabId);
        if (parentTab) {
          setActiveTabId(parentTab.id);
          navigate(parentTab.path);
          return;
        }
      }
      
      // Иначе переключаемся на ближайшую сверху
      const tabIndex = tabs.findIndex(tab => tab.id === id);
      const newActiveIndex = tabIndex > 0 ? tabIndex - 1 : 0;
      const newActiveTab = newTabs[newActiveIndex];
      setActiveTabId(newActiveTab.id);
      navigate(newActiveTab.path);
    }
  }, [tabs, activeTabId, navigate]);

  const switchTab = useCallback((id: string) => {
    const tab = tabs.find(t => t.id === id);
    if (tab) {
      setActiveTabId(id);
      navigate(tab.path);
    }
  }, [tabs, navigate]);

  const openNewTab = useCallback(() => {
    openTab('/main', 'Главная', null);
  }, [openTab]);

  const updateTabComponent = useCallback((id: string, component: ReactNode) => {
    setTabs(prevTabs => 
      prevTabs.map(tab => 
        tab.id === id ? { ...tab, component } : tab
      )
    );
  }, []);

  const updateTabLabel = useCallback((id: string, label: string) => {
    setTabs(prevTabs => 
      prevTabs.map(tab => 
        tab.id === id ? { ...tab, label } : tab
      )
    );
  }, []);

  if (!isRestored) {
    return null;
  }

  return (
    <TabContext.Provider value={{ 
      tabs, 
      activeTabId, 
      openTab, 
      closeTab, 
      switchTab, 
      openNewTab, 
      updateTabComponent,
      updateTabLabel,
    }}>
      {children}
    </TabContext.Provider>
  );
};

export const useTabs = () => {
  const context = useContext(TabContext);
  if (!context) {
    throw new Error('useTabs must be used within TabProvider');
  }
  return context;
};