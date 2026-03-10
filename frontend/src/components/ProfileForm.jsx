import React, { useState } from 'react';

const ProfileForm = () => {
    const [name, setName] = useState('');
    const [schoolName, setSchoolName] = useState('');
    const [yearLevel, setYearLevel] = useState('Year 11');

    const handleSubmit = () => {
        if (!name.trim()) { alert('Please enter your name.'); return; }
        if (!schoolName.trim()) { alert('Please enter your school name.'); return; }
        alert(`Profile created for ${name}, ${schoolName}, ${yearLevel}!`);
        // backend additions here (eventually)
    };

    const years = ['Year 9', 'Year 10', 'Year 11', 'Year 12'];

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 font-sans">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Mono:wght@400;500&family=DM+Sans:wght@300;400;500;600&display=swap');
                .font-playfair { font-family: 'Playfair Display', serif; }
                .font-mono-dm { font-family: 'DM Mono', monospace; }
                .font-dm { font-family: 'DM Sans', sans-serif; }
                .field-input:focus { border-color: #c8a96e; outline: none; }
            `}</style>

            <div className="w-full max-w-sm border border-[#2a2a2a] rounded-sm bg-[#111]">

                <div className="border-b border-[#2a2a2a] px-8 py-4 flex items-center gap-2">
                    <span className="font-playfair text-xl font-black text-[#f0e6d0] tracking-tight">alpha</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#c8a96e] mb-0.5" />
                </div>

                <div className="px-8 py-9 space-y-6">

                    <div>
                        <h1 className="font-playfair text-[1.6rem] font-bold text-[#f0e6d0] leading-tight tracking-tight">
                            Complete your<br />profile!
                        </h1>
                        <p className="font-dm text-xs text-[#555] mt-1.5 tracking-wide">
                            Make your own math experience!
                        </p>
                    </div>

                    <div className="space-y-2">
                        <label className="font-mono-dm text-[0.65rem] uppercase tracking-widest text-[#555] block">
                            Your Name
                        </label>
                        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-sm px-3.5 py-2.5 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#c8a96e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                <circle cx="12" cy="7" r="4"/>
                            </svg>
                            <input
                                type="text"
                                value={name}
                                placeholder="Your full name"
                                onChange={(e) => setName(e.target.value)}
                                className="field-input bg-transparent flex-1 font-mono-dm text-xs text-[#c8a96e] placeholder-[#444] outline-none border-none"
                            />
                        </div>
                    </div>

                    {/* might remove school entirely */}
                    <div className="space-y-2">
                        <label className="font-mono-dm text-[0.65rem] uppercase tracking-widest text-[#555] block">
                            School Name
                        </label>
                        <input
                            type="text"
                            value={schoolName}
                            placeholder="e.g. Riverside High School"
                            onChange={(e) => setSchoolName(e.target.value)}
                            className="field-input w-full bg-[#0d0d0d] border border-[#2a2a2a] rounded-sm px-3.5 py-2.5 text-[#f0e6d0] font-dm text-sm placeholder-[#333] transition-colors"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="font-mono-dm text-[0.65rem] uppercase tracking-widest text-[#555] block">
                            Year Level
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                            {years.map((year) => (
                                <button
                                    key={year}
                                    onClick={() => setYearLevel(year)}
                                    className={`font-mono-dm text-[0.7rem] py-2.5 rounded-sm border transition-all ${
                                        yearLevel === year
                                            ? 'bg-[#1a1505] border-[#c8a96e] text-[#c8a96e]'
                                            : 'bg-[#0d0d0d] border-[#2a2a2a] text-[#555] hover:border-[#444] hover:text-[#999]'
                                    }`}
                                >
                                    {year}
                                </button>
                            ))}
                        </div>
                    </div>

                    <hr className="border-[#1e1e1e]" />

                    <button
                        onClick={handleSubmit}
                        className="w-full bg-[#f0e6d0] hover:bg-[#fff8ee] text-[#0a0a0a] font-dm font-semibold text-sm py-3 rounded-sm flex items-center justify-center gap-2 transition-all hover:-translate-y-px hover:shadow-[0_6px_24px_rgba(200,169,110,0.15)] active:translate-y-0"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        Complete Profile
                    </button>

                    <p className="font-dm text-[0.7rem] text-[#333] text-center">
                        Helps us build a personalized syllabus for you.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ProfileForm;