import React, { useState } from 'react';

export default function App() {
  const [activeTab, setActiveTab] = useState('Calculator');
  const [basecampVisible, setBasecampVisible] = useState(false);

  return (
    <div className="relative min-h-screen bg-[#0D0D0D] text-white overflow-x-hidden select-none">
      
      {/* 🛣️ LIVE ANIMATED DRIVING ROAD BACKGROUND */}
      <div className="absolute inset-0 overflow-hidden z-0 pointer-events-none bg-[#0D0D0D]">
        <div className="animated-road-bg"></div>
        {/* Shading Contrast Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-[#0D0D0D]/90 pointer-events-none" />
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
            {/* Basecamp Dashboard View toggle icon */}
            <div 
              onClick={() => setBasecampVisible(!basecampVisible)} 
              className="w-9 h-9 rounded-full bg-[#1C1A14] border border-[#D4AF37] flex justify-center items-center cursor-pointer"
            >
              <span className="text-base">⛺</span>
            </div>
          </div>
        </div>

        {/* Primary Dashboard Navigation Tabs */}
        <div className="flex justify-around mt-2 border-b border-zinc-900">
          {['Calculator', 'Compare', 'Reports', 'Tax', 'Accepted'].map((tab) => (
            <div 
              key={tab} 
              onClick={() => setActiveTab(tab)}
              className={`p-2.5 text-xs font-medium cursor-pointer transition-all border-b-2 ${
                activeTab === tab 
                  ? 'text-[#D4AF37] border-[#D4AF37] font-bold' 
                  : 'text-zinc-500 border-transparent'
              }`}
            >
              {tab}
            </div>
          ))}
        </div>

        {/* Dynamic Context Tabs Viewport Layout */}
        {activeTab === 'Calculator' && (
          <div className="p-4 space-y-5">
            <div>
              <h1 className="text-white text-2xl font-black mt-2 leading-tight">Know your real earnings before every trip.</h1>
              <p className="text-zinc-400 text-sm mt-1.5">Fuel, wear & time — factored in automatically.</p>
            </div>
            
            {/* Core Golden Timeline display asset block */}
            <div className="h-1 bg-zinc-900 rounded-full relative my-4">
              <div className="h-full w-[45%] bg-[#D4AF37]" />
              <div className="absolute left-[45%] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#D4AF37]" />
            </div>

            {/* Ask Eric Anything Card (Cleaned to fix purple/teal shadow borders) */}
            <div className="flex items-center p-4 bg-[#141310] border border-[#D4AF37]/20 rounded-2xl">
              <div className="bg-[#1C1A15] p-2.5 rounded-xl">
                <span className="text-lg">✨</span>
              </div>
              <div className="flex-1 ml-3">
                <div className="text-white font-bold text-sm">Ask Eric anything</div>
                <div className="text-zinc-500 text-xs mt-0.5">Which offer should I take? How's my we...</div>
              </div>
              <span className="text-zinc-600 text-sm font-semibold">&gt;</span>
            </div>

            {/* Quick Presets Subsection Grid */}
            <div className="space-y-3">
              <div className="text-zinc-500 text-[11px] font-bold tracking-widest uppercase">
                QUICK PRESETS <span className="text-zinc-700 font-medium normal-case ml-1">• v2.259</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="bg-[#1A1813] p-3 rounded-xl flex flex-col items-center min-w-[75px] border border-[#D4AF37]">
                  <span className="text-xl mb-1">🚲</span>
                  <span className="text-white text-[11px] font-medium">DoorDash</span>
                </div>
                <div className="bg-[#141414] p-3 rounded-xl flex flex-col items-center min-w-[75px] border border-zinc-900">
                  <span className="text-xl mb-1">📦</span>
                  <span className="text-zinc-300 text-[11px] font-medium">Amazon I</span>
                </div>
                <div className="bg-[#141414] w-11 h-11 rounded-xl flex justify-center items-center border border-dashed border-zinc-800 cursor-pointer">
                  <span className="text-zinc-500 text-xl">+</span>
                </div>
              </div>
            </div>

            {/* Active Registered Vehicle Cell Row */}
            <div className="flex items-center bg-[#141414] border border-zinc-900 p-4 rounded-2xl">
              <span className="text-2xl">🚗</span>
              <div className="flex-1 ml-3">
                <div className="text-white font-semibold text-sm">Toyota Camry 2007–2...</div>
                <div className="text-[#D4AF37] text-xs font-medium mt-0.5">Gas • 25 mph</div>
              </div>
              <span className="text-zinc-600 text-sm">&gt;</span>
            </div>
          </div>
        )}

        {/* Performance reports page area with document downloads completely erased */}
        {activeTab === 'Reports' && (
          <div className="p-4 space-y-4">
            <div>
              <h1 className="text-white text-2xl font-black mt-2">Performance Reports</h1>
              <p className="text-zinc-400 text-sm mt-1">Detailed summary of your true margins and shift allocations.</p>
            </div>
            
            <div className="bg-[#141414] border border-zinc-900 p-4 rounded-xl">
              <div className="text-zinc-500 text-xs font-medium">Total Profit</div>
              <div className="text-[#D4AF37] text-2xl font-black mt-1">\$1,245.50</div>
            </div>
          </div>
        )}
      </div>

      {/* ⛺ BASECAMP EXPANDABLE WORKSPACE DRAWER MODAL SHEET */}
      {basecampVisible && (
        <div className="fixed inset-x-0 bottom-0 z-50 bg-[#0F0E0C] border-t-2 border-[#D4AF37] rounded-t-[24px] p-5 max-h-[85%] overflow-y-auto">
          {/* Central Drawer Structural Notch drag line */}
          <div className="w-10 h-1 bg-zinc-800 rounded-full mx-auto mb-4" />
          
          <div className="text-[#D4AF37] text-2xl font-black tracking-wide">Basecamp</div>
          <p className="text-zinc-400 text-xs leading-relaxed mt-2 font-normal">
            Your base for every journey. Track hydration, time your breaks, log expenses, scan meals for fuel value, check route weather, and ask the coach anything — here for you before, during, and after every trip.
          </p>

          {/* Real-time Weather Integration Component */}
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
          
          {/* Horizontal Swiper Action Layout List Container */}
          <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-none">
            <div className="flex flex-col items-center min-w-[90px]">
              <div className="w-20 h-20 rounded-xl bg-zinc-900 border border-zinc-800 flex justify-center items-center text-3xl">🧑‍🦱</div>
              <div className="text-white font-bold text-xs mt-2 text-center">Hydrate</div>
              <div className="text-[#D4AF37] text-[11px] mt-0.5 text-center">Log a glass</div>
            </div>

            <div className="flex flex-col items-center min-w-[90px]">
              <div className="w-20 h-20 rounded-xl bg-zinc-900 border border-zinc-800 flex justify-center items-center text-3xl">🏋️‍♀️</div>
              <div className="text-white font-bold text-xs mt-2 text-center">Work out</div>
              <div className="text-[#D4AF37] text-[11px] mt-0.5 text-center">5-min break</div>
            </div>

            <div className="flex flex-col items-center min-w-[90px]">
              <div className="w-20 h-20 rounded-xl bg-zinc-900 border border-zinc-800 flex justify-center items-center text-3xl">🧘</div>
              <div className="text-white font-bold text-xs mt-2 text-center">Stretch</div>
              <div className="text-[#D4AF37] text-[11px] mt-0.5 text-center">Best move</div>
            </div>
          </div>
          
          {/* Minimize toggle anchor block trigger link */}
          <div 
            onClick={() => setBasecampVisible(false)}
            className="mt-6 bg-[#1A1814] p-3 rounded-xl border border-[#D4AF37]/20 flex justify-center items-center cursor-pointer text-[#D4AF37] font-bold text-xs tracking-wider uppercase"
          >
            Minimize Basecamp
          </div>
        </div>
      )}
    </div>
  );
}
