import React from 'react';

const HomePage = () => {
    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-4xl font-black mb-6">Welcome to Alpha</h1>
            <p className="text-lg mb-6 text-gray-700 dark:text-gray-300">
                A neon-themed online graphics calculator inspired from Leibniz and Desmos!
                Experiment with different functions to make your own art!
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
                <div className="bg-light-card dark:bg-dark-card p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold mb-3 text-light-neonBlue dark:text-dark-neonBlue">Graphing Calculator</h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Plot functions and create tables to plot points!
                    </p>
                </div>
                <div className='bg-light-card dark:bg-dark-card p-6 rounded-lg border border-gray-200 dark:border-gray-700'>
                    <h2 className="text-xl font-bold mb-3 text-light-neonBlue dark:text-dark-neonBlue">Save & Share</h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Sign in to save & share your work!
                    </p>
                </div>
            </div>
        </div>
    );
};

export default HomePage;