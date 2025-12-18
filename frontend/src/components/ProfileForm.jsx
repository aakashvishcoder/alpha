// creating the css for the website for now, connect to the backend later 
/* 
Inspiration from https://www.leibniz.com.au!!
*/

import React, { useState } from 'react';

const ProfileForm = () => {
    const [schoolName, setSchoolName] = useState('yourschoolname High School')
    const [yearLevel, setYearLevel] = useState('Year 11');

    const handleSubmit = (e) => {
        e.preventDefault();
        alert(`Profile made for ${schoolName}, ${yearLevel}`);

        // backend handling will be here
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="bg-card p-8 rounded-lg shadow-xl max-w-md w-full space-y-6 text-white">

                <div className="flex justify-center mb-4">
                    <div className="bg-black p-3 rounded-mb">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2L2 7l10 5 10-5M2 12v5c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-5M2 7v5l10 5 10-5V7M2 7l10 5 10-5"/>
                        </svg>
                    </div>
                </div>

                <h1 className="text-2xl font-black text-center">Complete Your Profile</h1>
                <p className="text-center text-gray-300 text-sm">
                    Personalize your High School Math Experience!
                </p>

                <div className="bg-gray-900 p-3 rounded flex items-center gap-2 text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.1c1.11.35 2 1.22 2 2.22 0 .66-.31 1.26-.81 1.69-.51.42-1.13.68-1.77.68-1.14 0-2.2-.78-2.2-2.2 0-.98.47-1.85 1.2-2.35.73-.5 1.63-.75 2.55-.75z"/>
                    </svg>
                    Welcome, <span className="font-bold">Your Name Here</span>
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium">School Name</label>
                    <input
                        type="text"
                        value={schoolName}
                        onChange={(e) => setSchoolName(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded focus:outline-none focus:ring-neonBlue focus:border-transparent text-white"
                    />
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium">Year Level</label>
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={() => setYearLevel('Year 9')}
                            className={`px-3 py-2 rounded text-sm font-medium transition ${
                                yearLevel === 'Year 9'
                                    ? 'bg-black text-white border-2 border-neonBlue shadow-neon'
                                    : 'bg-gray-900 text-gray-300 hover:bg-gray-800'
                            }`}
                        >
                            Year 9
                        </button>
                        <button
                            onClick={() => setYearLevel('Year 10')}
                            className={`px-3 py-2 rounded text-sm font-medium transition ${
                                yearLevel === 'Year 10'
                                    ? 'bg-cream text-black border-2 border-neonBlue shadow-neon'
                                    : 'bg-gray-900 text-gray-300 hover:bg-gray-800'
                            }`}
                        >
                            Year 10
                        </button>
                        <button
                            onClick={() => setYearLevel('Year 11')}
                            className={`px-3 py-2 rounded text-sm font-medium transition ${
                                yearLevel === 'Year 11'
                                    ? 'bg-black text-white border-2 border-neonBlue shadow-neon'
                                    : 'bg-gray-900 text-gray-300 hover:bg-gray-800'
                            }`}
                        >
                            Year 11
                        </button>
                        <button
                            onClick={() => setYearLevel('Year 12')}
                            className={`px-3 py-2 rounded text-sm font-medium transition ${
                                yearLevel === 'Year 12'
                                    ? 'bg-cream text-black border-2 border-neonBlue shadow-neon'
                                    : 'bg-gray-900 text-gray-300 hover:bg-gray-800'
                            }`}
                        >
                            Year 12
                        </button>
                    </div>
                </div>

                <button
                    onClick={handleSubmit}
                    className="w-full bg-cream text-black py-2 px-4 rounded font-bold flex items-center justify-center gap-2 hover:bg-yellow-100 transition"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M12.736 3.97a.733.733 0 01-1.06.956l-4.25 4.25a.733.733 0 00-.527.527l-4.25 4.25a.733.733 0 01-1.06-.956l4.25-4.25a.733.733 0 00.527-.527l4.25-4.25a.733.733 0 011.06-.956z"/>
                    </svg>
                    Complete your Profile!
                </button>

                <p className="text-xs text-gray-500 text-center mt-4">
                    This information can help us make you a personalized syllabus!
                </p>
            </div>
        </div>
    );
};

export default ProfileForm;