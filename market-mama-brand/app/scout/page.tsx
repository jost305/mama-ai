'use client';

import React, { useState } from 'react';
import { 
  MapPin, 
  Camera, 
  Tag, 
  Receipt, 
  CheckCircle2,
  Wallet,
  Star,
  Award,
  ShieldCheck,
  TrendingUp,
  Clock,
  ChevronRight,
  Target
} from 'lucide-react';

export default function ScoutPortalPage() {
  const [activeTab, setActiveTab] = useState('missions');
  const [activeMissionStep, setActiveMissionStep] = useState(0);
  const [hasActiveMission, setHasActiveMission] = useState(false);
  const [walletBalance, setWalletBalance] = useState(42500);
  const [alphaPoints, setAlphaPoints] = useState(14500);
  
  const missions = [
    { id: 'MIS-001', type: 'Price Verification', product: 'Golden Penny Flour (10kg)', location: 'Mile 12 Market', reward: 750, points: 50, urgency: 'High' },
    { id: 'MIS-002', type: 'Counterfeit Check', product: 'Peak Milk (Tin)', location: 'Balogun Market', reward: 1200, points: 100, urgency: 'Normal' },
    { id: 'MIS-003', type: 'Shelf Audit', product: 'Indomie Super Pack', location: 'Oyingbo Market', reward: 500, points: 40, urgency: 'Normal' },
  ];

  const handleAcceptMission = () => {
    setHasActiveMission(true);
    setActiveTab('active');
    setActiveMissionStep(0);
  };

  const advanceMission = () => {
    if (activeMissionStep < 3) {
      setActiveMissionStep(prev => prev + 1);
    } else {
      // Submit Mission
      setWalletBalance(prev => prev + 750);
      setAlphaPoints(prev => prev + 50);
      setHasActiveMission(false);
      setActiveTab('history');
      alert("Mission Submitted! Verified by Intelligence Layer.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-gray-200 font-sans pb-20">
      
      {/* HEADER / IDENTITY */}
      <header className="sticky top-0 z-50 bg-[#0A0A0A]/90 backdrop-blur-md border-b border-gray-800 p-4">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
              <ShieldCheck className="text-emerald-400 h-5 w-5" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-white tracking-wide">SC_CHINEDU</h1>
              <p className="text-xs text-emerald-400 font-medium">Master Scout</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-gray-500 uppercase tracking-widest">Status</p>
            <div className="flex items-center gap-1.5 justify-end mt-0.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs text-gray-300">Online</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-6 mt-2">
        
        {/* WALLET CARD */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 to-black border border-gray-800 p-5 shadow-2xl">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Target className="w-32 h-32 text-emerald-500" />
          </div>
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Available Balance</p>
          <div className="flex items-baseline gap-1 mb-6">
            <span className="text-xl text-emerald-400 font-medium">₦</span>
            <span className="text-4xl font-bold text-white tracking-tight">{walletBalance.toLocaleString()}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-800/50">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <Star className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-xs text-gray-400 uppercase tracking-wider">AlphaPoints</span>
              </div>
              <p className="text-lg font-semibold text-gray-200">{alphaPoints.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <button className="bg-white/5 hover:bg-white/10 transition-colors text-white text-xs font-medium py-2 px-4 rounded-full border border-gray-700">
                Withdraw
              </button>
            </div>
          </div>
        </div>

        {/* DNA PROFILE MINIMAL */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <div className="flex-none bg-gray-900/50 border border-gray-800 rounded-lg px-3 py-2 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <div className="text-xs"><span className="text-gray-400">Accuracy:</span> <span className="text-white font-medium">95%</span></div>
          </div>
          <div className="flex-none bg-gray-900/50 border border-gray-800 rounded-lg px-3 py-2 flex items-center gap-2">
            <Award className="w-4 h-4 text-purple-400" />
            <div className="text-xs"><span className="text-gray-400">Domains:</span> <span className="text-white font-medium">Food, FMCG</span></div>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className="flex gap-4 border-b border-gray-800">
          {['missions', 'active', 'history'].map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === tab ? 'text-emerald-400' : 'text-gray-500'}`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {activeTab === tab && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-400 rounded-t-full shadow-[0_-2px_10px_rgba(52,211,153,0.5)]"></span>
              )}
            </button>
          ))}
        </div>

        {/* TAB CONTENTS */}
        
        {/* TAB: MISSIONS (FEED) */}
        {activeTab === 'missions' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {missions.map((mission) => (
              <div key={mission.id} className="bg-gray-900/40 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded">
                      {mission.type}
                    </span>
                    <h3 className="text-white font-medium mt-2">{mission.product}</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-emerald-400">₦{mission.reward}</p>
                    <p className="text-[10px] text-amber-400">+{mission.points} AP</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
                  <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {mission.location}</div>
                  <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> 15 mins</div>
                </div>
                
                <button 
                  onClick={handleAcceptMission}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-semibold py-2.5 rounded-lg transition-colors shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                >
                  Accept Mission
                </button>
              </div>
            ))}
          </div>
        )}

        {/* TAB: ACTIVE MISSION (FLOW) */}
        {activeTab === 'active' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            {!hasActiveMission ? (
              <div className="text-center py-10 bg-gray-900/20 border border-gray-800 rounded-xl border-dashed">
                <Target className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No active missions right now.</p>
                <button onClick={() => setActiveTab('missions')} className="text-emerald-400 text-xs mt-2 hover:underline">Browse Feed</button>
              </div>
            ) : (
              <div className="bg-gray-900/40 border border-gray-800 rounded-xl p-5 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                
                <div className="mb-6">
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Current Objective</p>
                  <h2 className="text-lg font-medium text-white">Golden Penny Flour (10kg)</h2>
                  <p className="text-sm text-gray-400 flex items-center gap-1.5 mt-1"><MapPin className="w-4 h-4 text-emerald-400"/> Mile 12 Market</p>
                </div>

                <div className="space-y-3 relative before:absolute before:inset-0 before:ml-[1.1rem] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-emerald-500 before:to-gray-800">
                  
                  {/* Step 0: Location */}
                  <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                    <div className={`flex items-center justify-center w-9 h-9 rounded-full border-2 bg-gray-900 z-10 shrink-0 ${activeMissionStep > 0 ? 'border-emerald-500 text-emerald-500' : 'border-gray-600 text-gray-500'}`}>
                      {activeMissionStep > 0 ? <CheckCircle2 className="w-5 h-5"/> : <MapPin className="w-4 h-4"/>}
                    </div>
                    <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] p-3 rounded-lg border border-gray-800 bg-black/50 ml-4">
                      <p className={`text-sm font-medium ${activeMissionStep > 0 ? 'text-gray-400' : 'text-white'}`}>Verify Location</p>
                    </div>
                  </div>

                  {/* Step 1: Image */}
                  <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                    <div className={`flex items-center justify-center w-9 h-9 rounded-full border-2 bg-gray-900 z-10 shrink-0 ${activeMissionStep > 1 ? 'border-emerald-500 text-emerald-500' : (activeMissionStep === 1 ? 'border-white text-white shadow-[0_0_10px_rgba(255,255,255,0.2)]' : 'border-gray-800 text-gray-700')}`}>
                       {activeMissionStep > 1 ? <CheckCircle2 className="w-5 h-5"/> : <Camera className="w-4 h-4"/>}
                    </div>
                    <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] p-3 rounded-lg border border-gray-800 bg-black/50 ml-4">
                      <p className={`text-sm font-medium ${activeMissionStep > 1 ? 'text-gray-400' : (activeMissionStep === 1 ? 'text-white' : 'text-gray-600')}`}>Take Photo</p>
                    </div>
                  </div>

                  {/* Step 2: Price */}
                  <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                    <div className={`flex items-center justify-center w-9 h-9 rounded-full border-2 bg-gray-900 z-10 shrink-0 ${activeMissionStep > 2 ? 'border-emerald-500 text-emerald-500' : (activeMissionStep === 2 ? 'border-white text-white shadow-[0_0_10px_rgba(255,255,255,0.2)]' : 'border-gray-800 text-gray-700')}`}>
                       {activeMissionStep > 2 ? <CheckCircle2 className="w-5 h-5"/> : <Tag className="w-4 h-4"/>}
                    </div>
                    <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] p-3 rounded-lg border border-gray-800 bg-black/50 ml-4">
                      <p className={`text-sm font-medium ${activeMissionStep > 2 ? 'text-gray-400' : (activeMissionStep === 2 ? 'text-white' : 'text-gray-600')}`}>Log Price</p>
                    </div>
                  </div>

                  {/* Step 3: Receipt */}
                  <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                    <div className={`flex items-center justify-center w-9 h-9 rounded-full border-2 bg-gray-900 z-10 shrink-0 ${activeMissionStep > 3 ? 'border-emerald-500 text-emerald-500' : (activeMissionStep === 3 ? 'border-white text-white shadow-[0_0_10px_rgba(255,255,255,0.2)]' : 'border-gray-800 text-gray-700')}`}>
                       {activeMissionStep > 3 ? <CheckCircle2 className="w-5 h-5"/> : <Receipt className="w-4 h-4"/>}
                    </div>
                    <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] p-3 rounded-lg border border-gray-800 bg-black/50 ml-4">
                      <p className={`text-sm font-medium ${activeMissionStep > 3 ? 'text-gray-400' : (activeMissionStep === 3 ? 'text-white' : 'text-gray-600')}`}>Upload Receipt</p>
                    </div>
                  </div>

                </div>

                <div className="mt-8">
                  <button 
                    onClick={advanceMission}
                    className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-200 text-black font-semibold py-3 rounded-lg transition-colors"
                  >
                    {activeMissionStep === 3 ? "Submit Intelligence" : "Complete Current Step"} 
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

              </div>
            )}
          </div>
        )}

        {/* TAB: HISTORY */}
        {activeTab === 'history' && (
          <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {[
              { id: 'rep_1', title: 'Golden Penny Flour', status: 'Verified', date: 'Today, 2:14 PM', reward: '₦750' },
              { id: 'rep_2', title: 'Dangote Sugar (50kg)', status: 'Verified', date: 'Yesterday', reward: '₦1,200' },
              { id: 'rep_3', title: 'Peak Milk (Tin)', status: 'Rejected', date: 'Mon, 14th', reward: '₦0' },
            ].map(hist => (
              <div key={hist.id} className="bg-gray-900/40 border border-gray-800 rounded-lg p-3 flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-white">{hist.title}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">{hist.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-white">{hist.reward}</p>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full mt-1 inline-block ${hist.status === 'Verified' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                    {hist.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  );
}
