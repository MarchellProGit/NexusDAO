import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { getSigner, getContract, ACCOUNTS } from './lib/ethereum';
import { PlusCircle, CheckCircle2, AlertCircle, Building2, ThumbsUp, ThumbsDown, Trash2, LayoutDashboard, ChevronDown, Users, BookOpen, X, Code } from 'lucide-react';

interface Proposal {
  id: number;
  title: string;
  description: string;
  votesFor: number;
  votesAgainst: number;
  active: boolean;
}

// 3D Tilt Card Component for Proposals
const TiltCard = ({ children, className }: { children: React.ReactNode, className?: string }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [4, -4]);
  const rotateY = useTransform(x, [-100, 100], [-4, 4]);

  function handleMouse(event: React.MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    x.set(event.clientX - rect.left - rect.width / 2);
    y.set(event.clientY - rect.top - rect.height / 2);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      onMouseMove={handleMouse}
      onMouseLeave={handleMouseLeave}
      className={`perspective-1000 ${className}`}
    >
      <div style={{ transform: "translateZ(20px)" }} className="w-full h-full preserve-3d">
        {children}
      </div>
    </motion.div>
  );
};

function App() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Modals & Dropdowns State
  const [currentAccountIndex, setCurrentAccountIndex] = useState(0);
  const [showWalletDropdown, setShowWalletDropdown] = useState(false);
  const [showDocsModal, setShowDocsModal] = useState(false);

  const currentAccount = ACCOUNTS[currentAccountIndex];

  const loadData = async () => {
    try {
      const signer = getSigner(currentAccount.key);
      const contract = getContract(signer);
      
      const count = await contract.proposalCount();
      const loadedProposals: Proposal[] = [];
      
      for (let i = 1; i <= Number(count); i++) {
        const p = await contract.getProposal(i);
        if (p.title !== "") {
          loadedProposals.push({
            id: Number(p.id),
            title: p.title,
            description: p.description,
            votesFor: Number(p.votesFor),
            votesAgainst: Number(p.votesAgainst),
            active: p.active
          });
        }
      }
      setProposals(loadedProposals.reverse());
    } catch (err) {
      console.error(err);
      setError("Failed to load blockchain data. Ensure local Anvil node is running.");
    }
  };

  useEffect(() => {
    loadData();

    try {
      const signer = getSigner(currentAccount.key);
      const contract = getContract(signer);
      
      const onEvent = () => loadData();

      contract.on("ProposalCreated", onEvent);
      contract.on("Voted", onEvent);
      contract.on("ProposalDeleted", onEvent);

      return () => {
        contract.off("ProposalCreated", onEvent);
        contract.off("Voted", onEvent);
        contract.off("ProposalDeleted", onEvent);
      };
    } catch (err) {
      console.warn("Event listeners could not be attached.", err);
    }
  }, [currentAccountIndex]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDesc.trim()) return;
    
    setLoading(true);
    setError(null);
    setTxHash(null);
    try {
      const signer = getSigner(currentAccount.key);
      const contract = getContract(signer);
      const tx = await contract.createProposal(newTitle, newDesc);
      setTxHash(tx.hash);
      await tx.wait();
      setNewTitle('');
      setNewDesc('');
      loadData();
    } catch (err: any) {
      setError(err.reason || "Transaction failed.");
    }
    setLoading(false);
  };

  const handleVote = async (id: number, support: boolean) => {
    setLoading(true);
    setError(null);
    setTxHash(null);
    try {
      const signer = getSigner(currentAccount.key);
      const contract = getContract(signer);
      const tx = await contract.castVote(id, support);
      setTxHash(tx.hash);
      await tx.wait();
      loadData();
    } catch (err: any) {
      setError(err.reason || "Voting failed. You might have already voted from this account.");
    }
    setLoading(false);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to permanently delete this proposal from the blockchain?")) return;
    
    setLoading(true);
    setError(null);
    setTxHash(null);
    try {
      const signer = getSigner(currentAccount.key);
      const contract = getContract(signer);
      const tx = await contract.deleteProposal(id);
      setTxHash(tx.hash);
      await tx.wait();
      loadData();
    } catch (err: any) {
      setError(err.reason || "Deletion failed.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen text-slate-100 pb-20 selection:bg-primary/30 relative">
      <div className="noise-bg"></div>
      
      {/* Animated Glowing Background Orbs */}
      <div className="bg-glow-1"></div>
      <div className="bg-glow-2"></div>
      <div className="bg-glow-3"></div>

      {/* Premium Header */}
      <header className="glass border-b border-slate-700/30 sticky top-0 z-40 supports-backdrop-blur:bg-slate-900/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="bg-gradient-to-br from-primary to-accent p-2.5 rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.4)] group-hover:shadow-[0_0_30px_rgba(139,92,246,0.6)] transition-all duration-300">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-white text-glow">NexusDAO</h1>
              <p className="text-[10px] text-slate-400 font-bold tracking-[0.2em] uppercase">Decentralized Governance</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Team & Docs Button */}
            <button 
              onClick={() => setShowDocsModal(true)}
              className="hidden sm:flex items-center gap-2 text-sm font-bold text-slate-300 hover:text-white transition-all bg-slate-800/40 hover:bg-slate-700/60 px-5 py-2.5 rounded-full border border-slate-700/50 hover:border-slate-500/50 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]"
            >
              <Users className="w-4 h-4" /> Team & Docs
            </button>

            {/* Wallet Switcher Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setShowWalletDropdown(!showWalletDropdown)}
                className="flex items-center gap-3 bg-slate-800/60 hover:bg-slate-700/80 transition-all px-4 py-2.5 rounded-full border border-slate-700/80 shadow-inner group"
              >
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.8)]"></div>
                <div className="text-left hidden sm:block">
                  <p className="text-xs font-bold text-white leading-tight group-hover:text-emerald-400 transition-colors">{currentAccount.name}</p>
                  <p className="text-[10px] text-slate-400 font-mono tracking-wider">{currentAccount.address.substring(0,6)}...{currentAccount.address.substring(38)}</p>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400 ml-1 group-hover:text-white transition-colors" />
              </button>

              <AnimatePresence>
                {showWalletDropdown && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-3 w-64 glass rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.4)] overflow-hidden z-50 border border-slate-600/50"
                  >
                    <div className="px-5 py-3 border-b border-slate-700/50 bg-slate-900/80">
                      <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Select Identity</p>
                    </div>
                    <div className="p-2 space-y-1 bg-slate-900/60">
                      {ACCOUNTS.map((acc, idx) => (
                        <button
                          key={idx}
                          onClick={() => { setCurrentAccountIndex(idx); setShowWalletDropdown(false); }}
                          className={`w-full text-left px-4 py-3 rounded-xl flex items-center justify-between transition-all ${currentAccountIndex === idx ? 'bg-primary/20 text-primary border border-primary/30 shadow-inner' : 'hover:bg-slate-800/80 text-slate-300 border border-transparent'}`}
                        >
                          <div>
                            <p className="text-sm font-bold">{acc.name}</p>
                            <p className="text-xs opacity-70 font-mono tracking-wider mt-0.5">{acc.address.substring(0,6)}...{acc.address.substring(38)}</p>
                          </div>
                          {currentAccountIndex === idx && <CheckCircle2 className="w-5 h-5 drop-shadow-[0_0_5px_rgba(59,130,246,0.5)]" />}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      {/* Team & Docs Overlay Modal */}
      <AnimatePresence>
        {showDocsModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.95, y: 20, opacity: 0 }}
              className="glass border border-slate-600/50 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] max-w-4xl w-full max-h-[90vh] overflow-y-auto relative"
            >
              <button 
                onClick={() => setShowDocsModal(false)}
                className="absolute top-6 right-6 bg-slate-800/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 p-2.5 rounded-full transition-all z-10 border border-transparent hover:border-rose-500/30"
              >
                <X className="w-6 h-6" />
              </button>
              
              <div className="p-8 sm:p-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl"></div>

                <div className="text-center mb-12 relative z-10">
                  <h2 className="text-4xl font-extrabold text-white mb-4 text-glow">NexusDAO Ecosystem</h2>
                  <p className="text-slate-300 font-medium text-lg">A premium implementation of decentralized governance on the Ethereum Network.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16 relative z-10">
                  <div className="glass-input p-8 rounded-3xl group hover:border-primary/50 transition-all duration-300">
                    <BookOpen className="w-10 h-10 text-primary mb-5 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)] group-hover:scale-110 transition-transform" />
                    <h3 className="text-xl font-bold text-white mb-3">How it Works</h3>
                    <ul className="space-y-3 text-slate-300 font-medium">
                      <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary"></div><strong>Create:</strong> Submit on-chain proposals.</li>
                      <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary"></div><strong>Vote:</strong> Support or reject proposals (1 vote per wallet).</li>
                      <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary"></div><strong>Delete:</strong> Permanently erase data from EVM storage.</li>
                      <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary"></div><strong>Real-time:</strong> Powered by <code className="text-primary bg-primary/10 px-1.5 py-0.5 rounded-md font-mono text-sm ml-1">Ethers.js</code></li>
                    </ul>
                  </div>
                  <div className="glass-input p-8 rounded-3xl group hover:border-accent/50 transition-all duration-300">
                    <Code className="w-10 h-10 text-accent mb-5 drop-shadow-[0_0_15px_rgba(139,92,246,0.5)] group-hover:scale-110 transition-transform" />
                    <h3 className="text-xl font-bold text-white mb-3">Technical Stack</h3>
                    <ul className="space-y-3 text-slate-300 font-medium">
                      <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-accent"></div><strong>Smart Contract:</strong> Solidity, Foundry (Anvil).</li>
                      <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-accent"></div><strong>Frontend:</strong> React, TypeScript, Vite.</li>
                      <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-accent"></div><strong>Styling:</strong> TailwindCSS v4, Framer Motion.</li>
                      <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-accent"></div><strong>Network:</strong> Local RPC 127.0.0.1:8545.</li>
                    </ul>
                  </div>
                </div>

                <div className="text-center mb-10 relative z-10">
                  <h3 className="text-sm font-extrabold text-slate-400 tracking-[0.3em] uppercase">The Engineering Team</h3>
                </div>
                
                <div className="flex flex-col sm:flex-row justify-center gap-8 relative z-10">
                  <TiltCard className="w-full sm:w-64">
                    <div className="glass-input p-1 rounded-[2rem] shadow-[0_0_30px_rgba(0,0,0,0.3)] overflow-hidden h-full">
                      <div className="h-56 w-full bg-slate-800 relative overflow-hidden rounded-[1.8rem]">
                        <img src="/Marchell.jpg" alt="Marchell" className="object-cover w-full h-full opacity-80 hover:opacity-100 hover:scale-105 transition-all duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
                        <div className="absolute bottom-4 left-4 right-4 text-center">
                          <h4 className="text-lg font-extrabold text-white text-glow">Marchell Adi P.</h4>
                          <p className="text-[10px] text-primary font-bold tracking-widest uppercase mt-0.5">672023081</p>
                        </div>
                      </div>
                      <div className="p-5 text-center">
                        <p className="text-xs text-slate-400 font-medium">Lead Blockchain Engineer & UI/UX Architect.</p>
                      </div>
                    </div>
                  </TiltCard>

                  <TiltCard className="w-full sm:w-64">
                    <div className="glass-input p-1 rounded-[2rem] shadow-[0_0_30px_rgba(0,0,0,0.3)] overflow-hidden h-full">
                      <div className="h-56 w-full bg-slate-800 relative overflow-hidden rounded-[1.8rem]">
                        <img src="/Nova.png" alt="Nova" className="object-cover w-full h-full opacity-80 hover:opacity-100 hover:scale-105 transition-all duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
                        <div className="absolute bottom-4 left-4 right-4 text-center">
                          <h4 className="text-lg font-extrabold text-white text-glow">Nova Hendriyawan</h4>
                          <p className="text-[10px] text-accent font-bold tracking-widest uppercase mt-0.5">672023113</p>
                        </div>
                      </div>
                      <div className="p-5 text-center">
                        <p className="text-xs text-slate-400 font-medium">Smart Contract QA & Research Analyst.</p>
                      </div>
                    </div>
                  </TiltCard>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 mt-12 mb-20 relative z-10">
        
        {/* Toast Notifications */}
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 w-full max-w-sm px-4 sm:px-0 pointer-events-none">
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 50, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                className="glass border-l-4 border-rose-500 text-slate-200 p-5 rounded-2xl shadow-[0_10px_40px_rgba(244,63,94,0.3)] flex items-start gap-4 pointer-events-auto"
              >
                <AlertCircle className="w-6 h-6 flex-shrink-0 mt-0.5 text-rose-500" />
                <div>
                  <h3 className="font-extrabold text-sm text-white">Transaction Error</h3>
                  <p className="text-xs mt-1 text-slate-300 font-medium">{error}</p>
                </div>
                <button onClick={() => setError(null)} className="ml-auto text-slate-500 hover:text-white transition-colors">&times;</button>
              </motion.div>
            )}
            
            {txHash && (
              <motion.div 
                initial={{ opacity: 0, y: 50, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                className="glass border-l-4 border-emerald-500 text-slate-200 p-5 rounded-2xl shadow-[0_10px_40px_rgba(16,185,129,0.3)] flex items-start gap-4 pointer-events-auto"
              >
                <CheckCircle2 className="w-6 h-6 flex-shrink-0 mt-0.5 text-emerald-500" />
                <div>
                  <h3 className="font-extrabold text-sm text-white">State Confirmed</h3>
                  <p className="text-xs mt-1 font-mono tracking-wider text-slate-300">Tx: {txHash.substring(0,18)}...</p>
                </div>
                <button onClick={() => setTxHash(null)} className="ml-auto text-slate-500 hover:text-white transition-colors">&times;</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Main Board - Proposals */}
          <div className="lg:col-span-8 space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-extrabold flex items-center gap-3 text-white">
                <LayoutDashboard className="w-8 h-8 text-primary drop-shadow-[0_0_15px_rgba(59,130,246,0.6)]" />
                <span className="text-glow tracking-tight">Active Proposals</span>
              </h2>
              <span className="text-sm glass-input text-slate-200 font-bold px-5 py-2 rounded-full shadow-[0_0_15px_rgba(255,255,255,0.05)]">
                {proposals.length} Total
              </span>
            </div>
            
            {proposals.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-[2rem] p-20 text-center border-dashed border-slate-600/50">
                <div className="glass-input w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <LayoutDashboard className="w-10 h-10 text-slate-500" />
                </div>
                <h3 className="text-2xl font-extrabold text-white">No active proposals</h3>
                <p className="text-slate-400 mt-3 font-medium text-lg">The governance board is waiting for a new idea.</p>
              </motion.div>
            ) : (
              <div className="space-y-8">
                <AnimatePresence>
                  {proposals.map((p, index) => {
                    const total = p.votesFor + p.votesAgainst;
                    const forPercent = total === 0 ? 0 : Math.round((p.votesFor / total) * 100);
                    const againstPercent = total === 0 ? 0 : 100 - forPercent;
                    
                    return (
                      <motion.div
                        key={p.id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ delay: index * 0.05, type: "spring", stiffness: 100 }}
                      >
                        <TiltCard>
                          <div className="glass rounded-[2rem] p-8 sm:p-10 transition-all duration-300 hover:border-primary/40 hover:shadow-[0_0_50px_rgba(59,130,246,0.15)] group relative overflow-hidden h-full">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                            <div className="flex justify-between items-start mb-6 relative z-10">
                              <div>
                                <div className="flex items-center gap-3 mb-3">
                                  <span className="text-[11px] font-extrabold text-primary tracking-[0.2em] uppercase bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-lg shadow-[0_0_10px_rgba(59,130,246,0.2)]">
                                    PROP-{p.id}
                                  </span>
                                  <span className={`text-[11px] font-extrabold px-3 py-1.5 rounded-lg uppercase tracking-[0.1em] border ${p.active ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]' : 'bg-slate-800 text-slate-500 border-slate-700'}`}>
                                    {p.active ? 'Active' : 'Closed'}
                                  </span>
                                </div>
                                <h3 className="text-3xl font-extrabold text-white leading-tight drop-shadow-md">{p.title}</h3>
                              </div>
                              
                              {/* Delete Button */}
                              <button 
                                onClick={() => handleDelete(p.id)}
                                disabled={loading}
                                className="glass-input hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 p-3 rounded-xl transition-all hover:border-rose-500/40 hover:shadow-[0_0_15px_rgba(244,63,94,0.3)] group-hover:opacity-100 sm:opacity-0"
                                title="Delete Proposal"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                            
                            <div className="mb-10 relative z-10">
                              <p className="text-slate-300 text-base leading-relaxed glass-input p-6 rounded-2xl">
                                {p.description}
                              </p>
                            </div>
                            
                            {/* Voting Stats */}
                            <div className="mb-10 relative z-10">
                              <div className="flex justify-between text-sm font-extrabold mb-4">
                                <span className="text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.4)]">{p.votesFor} FOR ({forPercent}%)</span>
                                <span className="text-rose-400 drop-shadow-[0_0_10px_rgba(244,63,94,0.4)]">{p.votesAgainst} AGAINST ({againstPercent}%)</span>
                              </div>
                              <div className="w-full h-4 glass-input rounded-full overflow-hidden flex p-0.5">
                                <motion.div 
                                  initial={{ width: 0 }} animate={{ width: `${forPercent}%` }} transition={{ duration: 1.5, ease: "easeOut" }}
                                  className="h-full bg-emerald-500 rounded-l-full relative"
                                >
                                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/30 w-full h-full"></div>
                                </motion.div>
                                <motion.div 
                                  initial={{ width: 0 }} animate={{ width: `${againstPercent}%` }} transition={{ duration: 1.5, ease: "easeOut" }}
                                  className="h-full bg-rose-500 rounded-r-full relative"
                                >
                                  <div className="absolute inset-0 bg-gradient-to-l from-transparent to-white/30 w-full h-full"></div>
                                </motion.div>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col sm:flex-row gap-5 relative z-10">
                              <button
                                onClick={() => handleVote(p.id, true)}
                                disabled={loading || !p.active}
                                className="flex-1 flex items-center justify-center gap-3 glass-input hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-400 hover:border-emerald-500/50 font-bold py-4 rounded-2xl transition-all duration-300 hover:shadow-[0_0_20px_rgba(16,185,129,0.2)] disabled:opacity-40 group/btn"
                              >
                                <ThumbsUp className="w-5 h-5 group-hover/btn:scale-125 transition-transform" /> Support Idea
                              </button>
                              <button
                                onClick={() => handleVote(p.id, false)}
                                disabled={loading || !p.active}
                                className="flex-1 flex items-center justify-center gap-3 glass-input hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 hover:border-rose-500/50 font-bold py-4 rounded-2xl transition-all duration-300 hover:shadow-[0_0_20px_rgba(244,63,94,0.2)] disabled:opacity-40 group/btn"
                              >
                                <ThumbsDown className="w-5 h-5 group-hover/btn:scale-125 transition-transform" /> Reject Idea
                              </button>
                            </div>
                          </div>
                        </TiltCard>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Admin / Creation Panel */}
          <div className="lg:col-span-4 relative">
            <div className="sticky top-28">
              <TiltCard>
                <div className="glass rounded-[2rem] p-8 border border-slate-700/50 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden group">
                  <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-700 pointer-events-none"></div>

                  <h2 className="text-2xl font-extrabold flex items-center gap-3 text-white mb-8 relative z-10 text-glow">
                    <div className="glass-input p-2.5 rounded-xl text-primary border-primary/30 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                      <PlusCircle className="w-6 h-6" />
                    </div>
                    Draft Proposal
                  </h2>
                  
                  <form onSubmit={handleCreate} className="space-y-7 relative z-10">
                    <div>
                      <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-[0.2em] mb-3">
                        Proposal Title
                      </label>
                      <input
                        type="text"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        disabled={loading}
                        className="w-full bg-slate-950/50 backdrop-blur-md border border-slate-700/80 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all placeholder:text-slate-600 text-white font-semibold shadow-inner"
                        placeholder="e.g. Upgrade Security Protocol"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-[0.2em] mb-3">
                        Justification / Details
                      </label>
                      <textarea
                        value={newDesc}
                        onChange={(e) => setNewDesc(e.target.value)}
                        disabled={loading}
                        rows={6}
                        className="w-full bg-slate-950/50 backdrop-blur-md border border-slate-700/80 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all placeholder:text-slate-600 text-white font-medium resize-none shadow-inner"
                        placeholder="Explain why the DAO should support this initiative..."
                      />
                    </div>
                    
                    <button
                      type="submit"
                      disabled={loading || !newTitle.trim() || !newDesc.trim()}
                      className="w-full relative overflow-hidden bg-slate-800 text-white font-extrabold py-5 px-4 rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group/submit hover:shadow-[0_0_30px_rgba(59,130,246,0.4)]"
                    >
                      {/* Animated Gradient Background */}
                      <div className={`absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary animate-shimmer ${(!newTitle.trim() || !newDesc.trim()) ? 'opacity-20' : 'opacity-100'}`}></div>
                      
                      <div className="relative z-10 flex justify-center items-center gap-3">
                        {loading ? (
                          <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        ) : (
                          <>Submit to Network</>
                        )}
                      </div>
                    </button>
                  </form>
                </div>
              </TiltCard>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

export default App;
