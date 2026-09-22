import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  Search, 
  Filter, 
  Calendar, 
  MapPin, 
  ExternalLink, 
  Users, 
  Sparkles, 
  ArrowRight,
  ShieldCheck,
  Award,
  Check
} from 'lucide-react';
import { Charity } from '../types.ts';
import { useAuth } from '../context/AuthContext.tsx';

interface CharitiesDirectoryProps {
  openDonateModal: (charity: Charity) => void;
  openAuthModal: () => void;
  openSubscribeModal: () => void;
}

export const CharitiesDirectory: React.FC<CharitiesDirectoryProps> = ({
  openDonateModal,
  openAuthModal,
  openSubscribeModal
}) => {
  const { user, updateCharity } = useAuth();
  const [charities, setCharities] = useState<Charity[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCharityDetails, setSelectedCharityDetails] = useState<Charity | null>(null);
  const [updatingCharityId, setUpdatingCharityId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const categories = [
    'All',
    'Veterans & First Responders',
    'Youth Athletic Grants',
    'Cancer Research & Care',
    'Mental Health Support',
    'Adaptive Sports'
  ];

  const fetchCharities = () => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (selectedCategory && selectedCategory !== 'All') params.set('category', selectedCategory);

    fetch(`/api/charities?${params.toString()}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setCharities(data.charities);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchCharities();
  }, [search, selectedCategory]);

  const handleSelectAsPrimary = async (charity: Charity) => {
    if (!user) {
      openAuthModal();
      return;
    }
    setUpdatingCharityId(charity.id);
    const success = await updateCharity(charity.id, user.charitySelection?.percentage || 15);
    setUpdatingCharityId(null);
    if (success) {
      setSuccessMsg(`Your subscription contribution is now directed to ${charity.name}!`);
      setTimeout(() => setSuccessMsg(null), 4000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-xs font-semibold text-rose-300">
          <Heart className="w-3.5 h-3.5 fill-rose-400" />
          <span>Charity Directory & Giving Engine (§08)</span>
        </div>
        <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
          Every Stroke Powers A Cause
        </h1>
        <p className="text-sm text-slate-300 leading-relaxed">
          Subscribers direct a minimum of 10% (and up to 100%) of their monthly fees to the verified partner of their choice. Explore our vetted roster, view upcoming charity golf invitationals, or contribute directly.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-between text-xs text-emerald-300">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Search & Filter Controls */}
      <div className="glass-panel p-4 rounded-2xl border border-white/10 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          
          {/* Search Input */}
          <div className="md:col-span-6 relative">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search charities by mission, title, or cause keyword..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Category Pills Bar */}
          <div className="md:col-span-6 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-2 rounded-xl whitespace-nowrap font-medium transition-all ${
                  selectedCategory === cat
                    ? 'bg-amber-500 text-black font-semibold shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-white/5'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {charities.map(charity => {
          const isUserSelected = user?.charitySelection?.charityId === charity.id;

          return (
            <div 
              key={charity.id}
              className={`glass-panel rounded-3xl overflow-hidden border transition-all flex flex-col justify-between ${
                isUserSelected 
                  ? 'border-amber-500/50 card-glow-amber bg-slate-900/90' 
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              <div>
                {/* Banner */}
                <div className="relative h-44 w-full overflow-hidden">
                  <img 
                    src={charity.bannerUrl} 
                    alt={charity.name} 
                    onError={e => {
                      (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1592919505780-303950717480?auto=format&fit=crop&w=1200&q=80';
                    }}
                    className="w-full h-full object-cover" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F17] via-transparent to-transparent"></div>
                  
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-white/10 text-[10px] font-semibold text-amber-400">
                    {charity.category}
                  </div>

                  {isUserSelected && (
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-amber-500 text-black text-[10px] font-bold flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      Your Cause ({user.charitySelection.percentage}%)
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6 space-y-3">
                  <div className="flex items-center gap-3">
                    <img 
                      src={charity.logoUrl} 
                      alt="" 
                      onError={e => {
                        (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?auto=format&fit=crop&w=400&q=80';
                      }}
                      className="w-10 h-10 rounded-xl object-cover border border-white/10 shrink-0" 
                    />
                    <div>
                      <h3 className="font-display text-lg font-bold text-white leading-snug">
                        {charity.name}
                      </h3>
                      <p className="text-[11px] text-amber-400/90 font-medium">
                        {charity.tagline}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                    {charity.description}
                  </p>

                  {/* Impact pill */}
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-[11px] text-slate-300">
                    <span className="font-semibold text-white">Impact: </span>
                    {charity.impactStatement}
                  </div>

                  {/* Upcoming events preview */}
                  {charity.upcomingEvents.length > 0 && (
                    <div className="text-[11px] space-y-1 pt-1">
                      <span className="font-semibold text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-cyan-400" />
                        Next Golf Event:
                      </span>
                      <p className="text-white font-medium truncate">
                        {charity.upcomingEvents[0].title} ({charity.upcomingEvents[0].date})
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action surface */}
              <div className="p-6 pt-0 space-y-3">
                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Total Directed</span>
                    <span className="font-bold text-white font-mono text-sm">${charity.totalRaised.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Supporters</span>
                    <span className="font-bold text-slate-200 font-mono">{charity.supporterCount}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => openDonateModal(charity)}
                    className="py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Heart className="w-3.5 h-3.5 fill-rose-400 text-rose-400" />
                    Direct Gift
                  </button>

                  <button
                    onClick={() => handleSelectAsPrimary(charity)}
                    disabled={updatingCharityId === charity.id || isUserSelected}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                      isUserSelected
                        ? 'bg-amber-500 text-black cursor-default'
                        : 'bg-white/10 hover:bg-white/15 text-white border border-white/10'
                    }`}
                  >
                    {isUserSelected ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        Selected
                      </>
                    ) : (
                      'Select Cause'
                    )}
                  </button>
                </div>

                <button
                  onClick={() => setSelectedCharityDetails(charity)}
                  className="w-full text-center text-[11px] text-slate-400 hover:text-white pt-1"
                >
                  View full profile & golf day events →
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Charity Details Modal */}
      {selectedCharityDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl glass-panel rounded-3xl p-6 sm:p-8 border border-white/15 max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setSelectedCharityDetails(null)}
              className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
            >
              ✕
            </button>

            <div className="relative h-56 rounded-2xl overflow-hidden mb-6">
              <img 
                src={selectedCharityDetails.bannerUrl} 
                alt={selectedCharityDetails.name} 
                onError={e => {
                  (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1592919505780-303950717480?auto=format&fit=crop&w=1200&q=80';
                }}
                className="w-full h-full object-cover" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F17] via-transparent to-transparent"></div>
              <div className="absolute bottom-4 left-4 flex items-center gap-3">
                <img 
                  src={selectedCharityDetails.logoUrl} 
                  alt="" 
                  onError={e => {
                    (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?auto=format&fit=crop&w=400&q=80';
                  }}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-white/20" 
                />
                <div>
                  <h3 className="text-xl font-bold font-display text-white">{selectedCharityDetails.name}</h3>
                  <p className="text-xs text-amber-400">{selectedCharityDetails.category}</p>
                </div>
              </div>
            </div>

            <div className="space-y-6 text-xs text-slate-300">
              <div>
                <h4 className="text-sm font-bold text-white mb-1">Mission & Purpose</h4>
                <p className="leading-relaxed">{selectedCharityDetails.description}</p>
              </div>

              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300">
                <span className="font-bold text-amber-400 block mb-1">Key Tangible Impact</span>
                <p>{selectedCharityDetails.impactStatement}</p>
              </div>

              {/* Upcoming Events (§08.2: upcoming events such as golf days) */}
              <div>
                <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-cyan-400" />
                  Upcoming Charity Golf Days & Galas
                </h4>
                <div className="space-y-3">
                  {selectedCharityDetails.upcomingEvents.map(evt => (
                    <div key={evt.id} className="p-4 rounded-xl bg-slate-900 border border-white/10 space-y-1.5">
                      <div className="flex justify-between items-start">
                        <span className="font-semibold text-white text-xs">{evt.title}</span>
                        <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 font-mono text-[10px]">
                          {evt.date}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                        <MapPin className="w-3 h-3 text-amber-400" />
                        <span>{evt.location}</span>
                      </div>
                      <p className="text-slate-400 text-[11px] leading-relaxed pt-1">
                        {evt.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-white/10 flex gap-3">
                <button
                  onClick={() => {
                    const c = selectedCharityDetails;
                    setSelectedCharityDetails(null);
                    openDonateModal(c);
                  }}
                  className="flex-1 py-3 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-rose-500/20"
                >
                  <Heart className="w-4 h-4 fill-white" />
                  Make Direct Gift
                </button>
                <button
                  onClick={() => {
                    handleSelectAsPrimary(selectedCharityDetails);
                    setSelectedCharityDetails(null);
                  }}
                  className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-all shadow-md shadow-amber-500/20"
                >
                  Make Primary Subscription Recipient
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
