import React, { useState } from 'react';

export default function App() {
  const [activeTab, setActiveTab] = useState('Calculator');
  const [basecampVisible, setBasecampVisible] = useState(false);

  return (
    <div className="relative min-h-screen bg-[#0D0D0D] text-white overflow-x-hidden select-none font-sans">
      
      {/* 🛣️ PERSISTENT BACKGROUND LAYER */}
      <div className="absolute inset-0 overflow-hidden z-0 pointer-events-none bg-[#0D0D0D]">
        <div className="animated-road-bg"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-[#0D0D0D]/95 pointer-events-none" />
      </div>

      {/* FOREGROUND APPLICATION LAYOUT */}
      <div className="relative z-10 pb-24">
        
        {/* Top Header Section */}
        <div className="flex justify-between items-center p-4 pt-8">
          <div className="flex items-center space-x-3">
            <span className="text-white text-2xl cursor-pointer">≡</span>
            <div>
              <div className="text-[#D4AF37] font-bold text-lg tracking-wide">RouteMax Pro</div>
              <div className="text-zinc-500 text-xs">True Profit Calculator</div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-white text-lg cursor-pointer">?</span>
            <div 
              onClick={() => setBasecampVisible(!basecampVisible)} 
              className="w-9 h-9 rounded-full bg-[#1C1A14] border border-[#D4AF37] flex justify-center items-center cursor-pointer shadow-[0_0_10px_rgba(212,175,55,0.2)]"
            >
              <span className="text-base">⛺</span>
            </div>
          </div>
        </div>

        {/* Primary Dashboard Navigation Tabs */}
        <div className="flex justify-around mt-2 border-b border-zinc-900/60 bg-black/20 backdrop-blur-sm">
          {[
            { id: 'Calculator', name: 'Calculator', icon: '🧮' },
            { id: 'Compare', name: 'Compare', icon: '⚖️' },
            { id: 'Reports', name: 'Reports', icon: '📊' },
            { id: 'Tax', name: 'Tax', icon: '💵' },
            { id: 'Accepted', name: 'Accepted', icon: '✅' }
          ].map((tab) => (
            <div 
              key={tab.id} 
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center pt-2 pb-3 px-1 text-center cursor-pointer transition-all border-b-2 flex-1 ${
                activeTab === tab.id 
                  ? 'text-[#D4AF37] border-[#D4AF37] font-bold bg-gradient-to-b from-transparent to-[#D4AF37]/5' 
                  : 'text-zinc-500 border-transparent'
              }`}
            >
              <span className={`text-lg mb-1 filter transition-all ${activeTab === tab.id ? 'opacity-100 drop-shadow-[0_0_4px_#D4AF37]' : 'opacity-40'}`}>{tab.icon}</span>
              <span className="text-[11px] tracking-tight">{tab.name}</span>
            </div>
          ))}
        </div>

        {/* Dynamic Context Tabs Viewport Layout */}
        {activeTab === 'Calculator' && (
          <div className="p-4 space-y-6">
            <div>
              <h1 className="text-white text-3xl font-black mt-2 leading-tight tracking-tight">
                Know your real <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-[#D4AF37] drop-shadow-[0_0_12px_rgba(212,175,55,0.2)]">earnings</span> <br />before every trip.
              </h1>
              <p className="text-zinc-400 text-sm mt-2 font-light">Fuel, wear & time — factored in automatically.</p>
            </div>
            
            {/* Dashed Metric Segment Progress Bar */}
            <div className="relative flex items-center justify-between h-4 my-2 px-1">
              <div className="absolute left-0 right-0 h-[3px] bg-zinc-800 rounded" />
              <div className="absolute left-0 w-[60%] h-[3px] bg-gradient-to-r from-[#D4AF37]/50 to-[#D4AF37] rounded" />
              {[...Array(9)].map((_, i) => (
                <div 
                  key={i} 
                  className={`z-10 w-3 h-[3px] rounded-sm transition-colors ${i <= 5 ? 'bg-[#D4AF37]' : 'bg-zinc-700'}`} 
                />
              ))}
              <div className="absolute left-[60%] -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-white shadow-[0_0_10px_#D4AF37] border-2 border-[#D4AF37]" />
            </div>

            {/* Ask Eric Anything Card (Cleaned to fix purple/teal shadow borders) */}
            <div className="flex items-center p-4 bg-[#141310]/90 border border-[#D4AF37]/20 rounded-2xl shadow-xl backdrop-blur-md">
              <div className="bg-[#1C1A15] p-3 rounded-xl border border-[#D4AF37]/10 flex items-center justify-center">
                <span className="text-xl filter drop-shadow-[0_0_3px_#D4AF37]">✨</span>
              </div>
              <div className="flex-1 ml-4">
                <div className="text-white font-bold text-base tracking-tight">Ask Eric anything</div>
                <div className="text-zinc-500 text-xs mt-0.5 font-light">Which offer should I take? How's my week looking?</div>
              </div>
              <span className="text-zinc-600 text-lg font-bold pr-1">&gt;</span>
            </div>

            {/* Quick Presets Section */}
            <div className="space-y-3">
              <div className="text-zinc-500 text-[10px] font-bold tracking-widest uppercase">
                QUICK PRESETS <span className="text-zinc-700 font-medium normal-case ml-1">• v2.259</span>
              </div>
              
              <div className="flex items-center space-x-3 overflow-x-auto pb-1">
                <div className="bg-[#1A1813] p-3 rounded-xl flex flex-col items-center min-w-[80px] border border-[#D4AF37] shadow-[0_4px_12px_rgba(212,175,55,0.1)]">
                  <span className="text-xl mb-1 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">🚲</span>
                  <span className="text-white text-[11px] font-semibold">DoorDash</span>
                </div>
                <div className="bg-[#141414]/80 p-3 rounded-xl flex flex-col items-center min-w-[80px] border border-zinc-900/80">
                  <span className="text-xl mb-1 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">📦</span>
                  <span className="text-zinc-400 text-[11px] font-medium">Amazon I</span>
                </div>
                <div className="bg-[#141414]/40 w-12 h-12 rounded-xl flex justify-center items-center border border-dashed border-zinc-800 cursor-pointer hover:bg-zinc-900/40 transition-colors">
                  <span className="text-zinc-500 text-2xl font-light">+</span>
                </div>
              </div>
            </div>

            {/* Registered Vehicle Layout Block */}
            <div className="flex items-center bg-[#141414]/90 border border-zinc-900/60 p-4 rounded-2xl shadow-md">
              <div className="bg-zinc-900/60 p-2 rounded-xl text-xl">🚗</div>
              <div className="flex-1 ml-3.5">
                <div className="text-white font-bold text-sm tracking-tight">Toyota Camry 2007–2011</div>
                <div className="text-[#D4AF37] text-xs font-semibold mt-0.5">Gas • 25 mph</div>
              </div>
              <span className="text-zinc-600 text-base">&gt;</span>
            </div>
          </div>
        )}

        {/* Performance Reports (Export buttons permanently removed) */}
        {activeTab === 'Reports' && (
          <div className="p-4 space-y-4">
            <div>
              <h1 className="text-white text-2xl font-black mt-2">Performance Reports</h1>
              <p className="text-zinc-400 text-sm mt-1">Detailed summary of your true margins and shift allocations.</p>
            </div>
            
            <div className="bg-[#141414] border border-zinc-900 p-4 rounded-xl">
              <div className="text-zinc-500 text-xs font-medium">Total Profit</div>
              <div className="text-[#D4AF37] text-2xl font-black mt-1">$1,245.50</div>
            </div>
          </div>
        )}
      </div>

      {/* ⛺ BASECAMP BOTTOM SHEET MODAL DRAWER */}
      {basecampVisible && (
        <div className="fixed inset-x-0 bottom-0 z-50 bg-[#0F0E0C] border-t-2 border-[#D4AF37] rounded-t-[24px] p-5 shadow-[0_-12px_30px_rgba(212,175,55,0.12)] max-h-[85%] overflow-y-auto">
          <div className="w-10 h-1 bg-zinc-800 rounded-full mx-auto mb-4" />
          
          <div className="text-[#D4AF37] text-2xl font-black tracking-wide">Basecamp</div>
          <p className="text-zinc-400 text-xs leading-relaxed mt-2 font-normal">
            Your base for every journey. Track hydration, time your breaks, log expenses, scan meals for fuel value, check route weather, and ask the coach anything — here for you before, during, and after every trip.
          </p>

          {/* Real-time Weather Widget */}
          <div className="flex justify-between items-center bg-[#171512] border border-[#D4AF37]/10 rounded-xl p-4 mt-5">
            <div className="flex items-center space-x-3">
              <span className="text-3xl">☀️</span>
              <div>
                <div className="text-[#D4AF37] text-[10px] font-black tracking-wider">LIVE WEATHER</div>
                <div className="text-white text-base font-bold mt-0.5">42°F • Clear sky</div>
              </div>
            </div>
            <span className="text-zinc-500 text-base cursor-pointer">🔄</span>
          </div>

          <div className="text-zinc-500 text-[10px] font-bold tracking-widest mt-6 mb-3 uppercase">CREW IN ACTION — TAP TO JOIN IN</div>
          
          <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-none">
            <div className="flex flex-col items-center min-w-[95px]">
              <div className="w-20 h-20 rounded-xl bg-zinc-900 border border-zinc-800 flex justify-center items-center text-3xl shadow-inner">🧑‍🦱</div>
