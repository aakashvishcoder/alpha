import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

// the sidebar on the left side of the screen

const Layout = ({ children, onNavigate }) => {
    const [activeView, setActiveView] = useState('home');
    const { theme, toggleTheme } = useTheme();

    const handleNav = (view) => {
        setActiveView(view);
        onNavigate(view);
    };

    return (
        <div className="flex h-screen bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text font-serif">
            <div className="w-64 bg-light-card dark:bg-dark-card p-6 flex flex-col gap-6 border-r border-gray-200 dark:border-gray-700">
                <h1 className="text-2xl font-black">Alpha</h1>

                <nav className="space-y-3">
                    <button
                        onClick={() => handleNav('home')}
                        className={`w-full text-left px-4 py-2 rounded flex items-center gap-3 transition ${
                            activeView === 'home'
                                ? 'bg-light-bg dark:bg-dark-bg border-1-2 border-light-neonBlue dark:border-dark-neonBlue font-bold'
                                : 'hover:bg-light-bg/50 dark:hover:bg-dark-bg/50'
                        }`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M6.5 14.5v-3.5H1v-9h14v9h-5.5v3.5h-2z"/>
                        </svg>
                        Home
                    </button>
                    <button
                        onClick={() => handleNav('graph')}
                        className={`w-full text-left px-4 py-2 rounded flex items-center gap-3 transition ${
                            activeView === 'graph'
                                ? 'bg-light-bg dark:bg-dark-bg border-1-2 border-light-neonBlue dark:border-dark-neonBlue font-bold'
                                : 'hover:bg-light-bg/50 dark:hover:bg-dark-bg/50'
                        }`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M2 3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3zm10-1H3a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1z"/>
                            <path d="M8 6.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
                            <path d="M8.5 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"/>
                        </svg>
                        Graphing Calculator
                    </button>
                </nav>

                <div className="mt-auto pt-6 border-t border-gray-200 dark:border-gray-700">
                    <button
                        onClick={toggleTheme}
                        className="flex items-center gap-3 px-4 py-2 rounded hover:bg-light-bg/50 dark:hover:bg-dark-bg/50 w-full"
                    >
                        {theme === 'dark' ? (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M8 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm0 1a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0zm0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13zm8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5zM3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8zm10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0zm-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0zm9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707zM4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708z"/>
                                </svg>
                                Light Mode
                            </>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M8 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm0 1a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0zm0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13zm8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5zM3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8zm10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0zm-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0zm9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707zM4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708z"/>
                                </svg>
                                Dark Mode
                            </>
                        )}
                    </button>
                </div>
            </div>

            <main className="flex-1 overflow-auto">
                {children}
            </main>
        </div>
    );
};

export default Layout;