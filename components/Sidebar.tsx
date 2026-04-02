import React from 'react';
import { HomeIcon, ChartBarIcon, UsersIcon, ShoppingCartIcon, TrendingUpIcon, CloseIcon, UploadIcon } from './icons';

type Page = 'home' | 'forecasting' | 'segmentation' | 'market-basket' | 'sales-raise' | 'datasources';

interface SidebarProps {
  activePage: Page;
  setActivePage: (page: Page) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
  isExpanded: boolean;
}> = ({ icon, label, isActive, onClick, isExpanded }) => (
  <li>
    <a
      href="#"
      onClick={(e) => { e.preventDefault(); onClick(); }}
      className={`flex items-center p-3 rounded-lg transition-colors duration-200 ${isActive ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}`}
    >
      {icon}
      {isExpanded && <span className="ml-4 font-medium">{label}</span>}
    </a>
  </li>
);

const Sidebar: React.FC<SidebarProps> = ({ activePage, setActivePage, isOpen, setIsOpen }) => {
  const navItems: { id: Page; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'Home', icon: <HomeIcon /> },
    { id: 'forecasting', label: 'Forecasting', icon: <ChartBarIcon /> },
    { id: 'datasources', label: 'Data Sources', icon: <UploadIcon /> },
    { id: 'segmentation', label: 'Segmentation', icon: <UsersIcon /> },
    { id: 'market-basket', label: 'Market Basket', icon: <ShoppingCartIcon /> },
    { id: 'sales-raise', label: 'Sales Predictor', icon: <TrendingUpIcon /> },
  ];

  const handleNavigation = (page: Page) => {
    setActivePage(page);
    if(window.innerWidth < 1024) { // Close sidebar on mobile after navigation
      setIsOpen(false);
    }
  }

  return (
    <>
      <div className={`fixed inset-0 bg-black/60 z-30 lg:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsOpen(false)}></div>
      <aside className={`absolute lg:relative z-40 flex flex-col bg-gray-800 text-white transition-all duration-300 ease-in-out ${isOpen ? 'w-64' : 'w-20'} -translate-x-full lg:translate-x-0 ${isOpen && 'translate-x-0'}`}>
        <div className={`flex items-center p-4 h-[73px] border-b border-gray-700 ${isOpen ? 'justify-between' : 'justify-center'}`}>
          {isOpen && <span className="text-2xl font-bold text-white">Analytics</span>}
           <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-gray-400 hover:text-white">
            {isOpen ? <CloseIcon className="lg:hidden"/> : <div />}
          </button>
        </div>
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navItems.map(item => (
              <NavItem
                key={item.id}
                icon={item.icon}
                label={item.label}
                isActive={activePage === item.id}
                onClick={() => handleNavigation(item.id)}
                isExpanded={isOpen}
              />
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;