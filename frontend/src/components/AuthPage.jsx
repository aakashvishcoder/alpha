import React, { useState } from 'react';

const AuthPage = () => {
    const [activeTab, setActiveTab] = useState('signin');

    const [signInEmail, setSignInEmail] = useState('');
    const [signInPassword, setSignInPassword] = useState('');

    const [signUpName, setSignUpName] = useState('');
    const [signUpEmail, setSignUpEmail] = useState('');
    const [signUpPassword, setSignUpPassword] = useState('');
    const [signUpSchool, setSignUpSchool] = useState('');
    const [signUpYearLevel, setSignUpYearLevel] = useState('Year 12');

    const handleSignIn = (e) => {
        e.preventDefault();
        alert(`Signing in with: ${signInEmail}`);
    };

    const handleSignUp = (e) => {
        e.preventDefault();
        alert(`Signing up: ${signUpName}, ${signUpEmail}`);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-dark">
            <div className="bg-card p-8 rounded-lg shadow-xl max-w-md w-full space-y-6 text-white">

                <h1 className="text-2xl font-black text-center">Alpha Calculator</h1>
                <p className="text-center text-gray-300 text-sm">
                    Sign in to save your graphing progress!
                </p>

                <div className="flex border-b border-gray-700">
                    <button
                        onClick={() => setActiveTab('signin')}
                        className={`flex-1 py-3 font-medium text-center transition ${
                            activeTab === "signin"
                                ? 'bg-black text-white border-t-2 border-neonBlue shadow-neon'
                                : 'bg-card text-gray-300 hover:bg-gray-800'
                        }`}
                    >
                        Sign In
                    </button>
                    <button
                        onClick={() => setActiveTab('signup')}
                        className={`flex-1 py-3 font-medium text-center transition ${
                            activeTab === 'signup'
                                ? 'bg-cream text-black border-t-2 border-neonBlue shadow-neon'
                                : 'bg-card text-gray-300 hover:bg-gray-800'
                        }`}
                    >
                        Sign Up
                    </button>
                </div>

                <div className="space-y-3 mt-4">
                    <button className="w-full bg-gray-900 p-3 rounded flex items-center justify-center gap-2 text-sm hover:bg-gray-800 transition">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.25 1.26-1.01 2.48-2.25 3.27V21h4.23c1.52-1.25 2.47-3.12 2.47-5.17z" fill="#4285F4"/>
                        <path d="M12 21c2.21 0 4.07-.8 5.41-2.13l-4.23-4.23c-.73.65-1.72 1.08-2.82 1.08C8.06 15.72 6.5 14.64 6.5 13s1.56-2.72 3.78-2.72c1.1 0 2.09.43 2.82 1.08l4.23-4.23C15.07 6.8 13.21 6 12 6c-3.67 0-6.7 2.7-6.7 6s3.03 6 6.7 6z" fill="#34A853"/>
                        <path d="M12 6c1.1 0 2.09.43 2.82 1.08L19.05 3C17.68 2.2 15.81 1.5 12 1.5c-3.67 0-6.7 2.7-6.7 6s3.03 6 6.7 6c1.1 0 2.09-.43 2.82-1.08L19.05 21C17.68 21.8 15.81 22.5 12 22.5c-3.67 0-6.7-2.7-6.7-6s3.03-6 6.7-6z" fill="#FBBC05"/>
                        <path d="M12 13c-1.1 0-2.09-.43-2.82-1.08L4.95 16.15C3.58 16.9 1.5 17.5 1.5 18c0 .5 2.08 1.1 3.45 1.85L9.18 15.72C9.89 15.2 10.9 15 12 15z" fill="#EA4335"/>
                        </svg>
                        Sign In with Google
                    </button>
                    <button className="w-full bg-gray-900 p-3 rounded flex items-center justify-center gap-2 text-sm hover:bg-gray-800 transition">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm-2 16.6l-2-2v-6l2-2h6l2 2v6l-2 2h-6z" fill="#F15123"/>
                        <path d="M12 12l-2-2h-2v4h2l2 2v-4z" fill="#0078D4"/>
                        </svg>
                        Sign In with Microsoft
                    </button>
                </div>

                <div className="flex items-center my-4">
                    <div className="flex-grow border-t border-gray-700"></div>
                    <span className='px-3 text-sm text-gray-400'>Continue to Email!</span>
                    <div className="flex-grow border-t border-gray-700"></div>
                </div>

                {activeTab === 'signin' && (
                    <form onSubmit={handleSignIn} className="space-y-4">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium">Email Address</label>
                            <input
                                type="email"
                                value={signInEmail}
                                onChange={(e) => setSignInEmail(e.target.value)}
                                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-neonBlue focus:border-transparent text-white"
                                placeholder="you@example.com"
                            />
                        </div>
                        <div className='space-y-2'>
                            <label className="block text-sm font-medium">Password</label>
                            <input 
                                type="password"
                                value={signInPassword}
                                onChange={(e) => setSignInPassword(e.target.value)}
                                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-neonBlue focus:border-transparent text-white"
                                placeholder="Enter your password"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="remember"
                                defaultChecked
                                className="w-4 h-4 accent-neonBlue"
                            />
                            <label htmlFor="remember" className="text-sm">
                                Remember me for 30 days
                            </label>
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-cream text-black py-2 px-4 rounded font-bold hover:bg-yellow-100 transition"
                        >
                            Sign In
                        </button>
                    </form>
                )}

                {activeTab === 'signup' && (
                    <form onSubmit={handleSignUp} className="space-y-4">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium">Full Name</label>
                            <input
                                type="text"
                                value={signUpName}
                                onChange={(e) => setSignUpName(e.target.value)}
                                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-neonBlue focus:border-transparent text-white"
                                placeholder="Your name"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium">School Name</label>
                            <input
                                type="text"
                                value={signUpSchool}
                                onChange={(e) => setSignUpSchool(e.target.value)}
                                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-neonBlue focus:border-transparent text-white"
                                placeholder='your school here'
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium">Year Level</label>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() => setSignUpYearLevel('Year 9')}
                                    className={`px-3 py-2 rounded text-sm font-medium transition ${
                                        signUpYearLevel === 'Year 9'
                                            ? 'bg-black text-white border-2 border-neonBlue shadow-neon'
                                            : 'bg-gray-900 text-gray-300 hover:bg-gray-800'
                                    }`}
                                >
                                    Year 9
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSignUpYearLevel('Year 10')}
                                    className={`px-3 py-2 rounded text-sm font-medium transition ${
                                        signUpYearLevel === 'Year 10'
                                            ? 'bg-cream text-black border-2 border-neonBlue shadow-neon'
                                            : 'bg-gray-900 text-gray-300 hover:bg-gray-800'
                                    }`}
                                >
                                    Year 10
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSignUpYearLevel('Year 11')}
                                    className={`px-3 py-2 rounded text-sm font-medium transition ${
                                        signUpYearLevel === 'Year 11'
                                            ? 'bg-black text-white border-2 border-neonBlue shadow-neon'
                                            : 'bg-gray-900 text-gray-300 hover:bg-gray-800'
                                    }`}
                                >
                                    Year 11
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSignUpYearLevel('Year 12')}
                                    className={`px-3 py-2 rounded text-sm font-medium transition ${
                                        signUpYearLevel === 'Year 12'
                                            ? 'bg-cream text-black border-2 border-neonBlue shadow-neon'
                                            : 'bg-gray-900 text-gray-300 hover:bg-gray-800'
                                    }`}
                                >
                                    Year 12
                                </button>
                            </div>
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-cream text-black py-2 px-4 rounded font-bold hover:bg-yellow-100 transition"
                        >
                            Sign Up
                        </button>
                    </form>
                )}

                <div className="text-center space-y-2">
                    {activeTab === 'signin' && (
                        <p className="text-sm text-gray-400">
                            <a href="#" className="underline hover:text-white">Forgot your password?</a>
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthPage;