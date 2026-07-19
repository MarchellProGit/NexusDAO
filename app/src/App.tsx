import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { getSigner, getContract, ACCOUNTS } from './lib/ethereum';
import { Wallet, PlusCircle, CheckCircle2, AlertCircle, Building2, ThumbsUp, ThumbsDown, Trash2, LayoutDashboard, ChevronDown, Users, BookOpen, X, Github } from 'lucide-react';

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
  const rotateX = useTransform(y, [-100, 100], [5, -5]);
  const rotateY = useTransform(x, [-100, 100], [-5, 5]);

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
      <div style={{ transform: "translateZ(30px)" }} className="w-full h-full preserve-3d">
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
        // Only show if title is not empty (deleted proposals have empty titles in our Solidity implementation)
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
      setProposals(loadedProposals.reverse()); // Show newest first
    } catch (err) {
      console.error(err);
      setError("Failed to load blockchain data. Ensure local Anvil node is running.");
    }
  };

  useEffect(() => {
    loadData();

    try {
      // Re-attach event listeners with the current signer to prevent stale references
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
  }, [currentAccountIndex]); // Reload when account changes

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
    <div className="min-h-screen font-sans text-slate-100 pb-20 selection:bg-primary/30 relative">
      
      {/* Animated Glowing Background Orbs */}
      <div className="bg-glow-1"></div>
      <div className="bg-glow-2"></div>

      {/* Premium Header */}
      <header className="bg-slate-900/40 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-primary to-accent p-2.5 rounded-xl shadow-[0_0_15px_rgba(59,130,246,0.3)]">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">NexusDAO</h1>
              <p className="text-xs text-slate-400 font-medium tracking-wide uppercase">Decentralized Governance</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Team & Docs Button */}
            <button 
              onClick={() => setShowDocsModal(true)}
              className="hidden sm:flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors bg-slate-800/50 hover:bg-slate-700/50 px-4 py-2.5 rounded-full border border-slate-700/50"
            >
              <Users className="w-4 h-4" /> Team & Docs
            </button>

            {/* Wallet Switcher Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setShowWalletDropdown(!showWalletDropdown)}
                className="flex items-center gap-3 bg-slate-800/80 hover:bg-slate-700/80 transition-colors px-4 py-2.5 rounded-full border border-slate-700 shadow-inner"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]"></div>
                <div className="text-left hidden sm:block">
                  <p className="text-xs font-bold text-white leading-tight">{currentAccount.name}</p>
                  <p className="text-[10px] text-slate-400 font-mono">{currentAccount.address.substring(0,8)}...{currentAccount.address.substring(38)}</p>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400 ml-1" />
              </button>

              <AnimatePresence>
                {showWalletDropdown && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-64 bg-slate-800/95 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl overflow-hidden z-50"
                  >
                    <div className="px-4 py-3 border-b border-slate-700 bg-slate-900/50">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Select Identity</p>
                    </div>
                    <div className="p-2 space-y-1">
                      {ACCOUNTS.map((acc, idx) => (
                        <button
                          key={idx}
                          onClick={() => { setCurrentAccountIndex(idx); setShowWalletDropdown(false); }}
                          className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between transition-colors ${currentAccountIndex === idx ? 'bg-primary/20 text-primary' : 'hover:bg-slate-700/50 text-slate-300'}`}
                        >
                          <div>
                            <p className="text-sm font-bold">{acc.name}</p>
                            <p className="text-xs opacity-70 font-mono">{acc.address.substring(0,6)}...{acc.address.substring(38)}</p>
                          </div>
                          {currentAccountIndex === idx && <CheckCircle2 className="w-4 h-4" />}
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
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-lg"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative"
            >
              <button 
                onClick={() => setShowDocsModal(false)}
                className="absolute top-6 right-6 bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 p-2 rounded-full transition-colors z-10"
              >
                <X className="w-6 h-6" />
              </button>
              
              <div className="p-8 sm:p-12">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-extrabold text-white mb-3">NexusDAO Ecosystem</h2>
                  <p className="text-slate-400">A premium implementation of decentralized governance on the Ethereum Network.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                  <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
                    <BookOpen className="w-8 h-8 text-primary mb-4" />
                    <h3 className="text-lg font-bold text-white mb-2">How it Works</h3>
                    <ul className="space-y-3 text-sm text-slate-300">
                      <li><strong>Create:</strong> Submit on-chain proposals.</li>
                      <li><strong>Vote:</strong> Support or reject proposals (1 vote per wallet).</li>
                      <li><strong>Delete:</strong> Permanently erase data from EVM storage.</li>
                      <li><strong>Real-time:</strong> Powered by <code className="text-primary bg-primary/10 px-1 rounded">Ethers.js</code> event listeners.</li>
                    </ul>
                  </div>
                  <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
                    <Github className="w-8 h-8 text-accent mb-4" />
                    <h3 className="text-lg font-bold text-white mb-2">Technical Stack</h3>
                    <ul className="space-y-3 text-sm text-slate-300">
                      <li><strong>Smart Contract:</strong> Solidity, Foundry (Anvil).</li>
                      <li><strong>Frontend:</strong> React, TypeScript, Vite.</li>
                      <li><strong>Styling:</strong> TailwindCSS v4, Framer Motion (3D).</li>
                      <li><strong>Network:</strong> Local RPC 127.0.0.1:8545.</li>
                    </ul>
                  </div>
                </div>

                <h3 className="text-2xl font-extrabold text-center text-white mb-8 border-t border-slate-700/50 pt-8">The Engineering Team</h3>
                
                <div className="flex flex-col sm:flex-row justify-center gap-8">
                  {/* Creator 1 - Marchell */}
                  <TiltCard className="w-full sm:w-64">
                    <div className="bg-gradient-to-b from-slate-800 to-slate-900 p-1 rounded-3xl border border-slate-700 shadow-xl overflow-hidden h-full">
                      <div className="h-48 w-full bg-slate-700 relative overflow-hidden rounded-t-[1.3rem]">
                        <img src="/Marchell.jpg" alt="Marchell Adi Pratama" className="object-cover w-full h-full opacity-90 hover:opacity-100 transition-opacity" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
                      </div>
                      <div className="p-6 text-center">
                        <h4 className="text-lg font-extrabold text-white">Marchell Adi P.</h4>
                        <p className="text-xs text-primary font-bold tracking-widest uppercase mt-1">672023081</p>
                        <p className="text-sm text-slate-400 mt-3">Lead Blockchain Engineer & UI/UX Architect.</p>
                      </div>
                    </div>
                  </TiltCard>

                  {/* Creator 2 - Nova */}
                  <TiltCard className="w-full sm:w-64">
                    <div className="bg-gradient-to-b from-slate-800 to-slate-900 p-1 rounded-3xl border border-slate-700 shadow-xl overflow-hidden h-full">
                      <div className="h-48 w-full bg-slate-700 relative overflow-hidden rounded-t-[1.3rem]">
                        <img src="/Nova.png" alt="Nova Hendriyawan Putra" className="object-cover w-full h-full opacity-90 hover:opacity-100 transition-opacity" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
                      </div>
                      <div className="p-6 text-center">
                        <h4 className="text-lg font-extrabold text-white">Nova Hendriyawan P.</h4>
                        <p className="text-xs text-accent font-bold tracking-widest uppercase mt-1">672023113</p>
                        <p className="text-sm text-slate-400 mt-3">Smart Contract QA & Research Analyst.</p>
                      </div>
                    </div>
                  </TiltCard>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 mt-12 relative z-10">
        
        {/* Toast Notifications */}
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 w-full max-w-sm px-4 sm:px-0 pointer-events-none">
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, x: 50, scale: 0.9 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                className="bg-slate-800/95 backdrop-blur-md border-l-4 border-rose-500 text-slate-200 p-4 rounded-xl shadow-2xl flex items-start gap-3 pointer-events-auto"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-500" />
                <div>
                  <h3 className="font-bold text-sm text-white">Transaction Error</h3>
                  <p className="text-xs mt-1 text-slate-400">{error}</p>
                </div>
                <button onClick={() => setError(null)} className="ml-auto text-slate-500 hover:text-white">&times;</button>
              </motion.div>
            )}
            
            {txHash && (
              <motion.div 
                initial={{ opacity: 0, x: 50, scale: 0.9 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                className="bg-slate-800/95 backdrop-blur-md border-l-4 border-emerald-500 text-slate-200 p-4 rounded-xl shadow-2xl flex items-start gap-3 pointer-events-auto"
              >
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-500" />
                <div>
                  <h3 className="font-bold text-sm text-white">State Confirmed</h3>
                  <p className="text-xs mt-1 font-mono break-all text-slate-400">Tx: {txHash.substring(0,20)}...</p>
                </div>
                <button onClick={() => setTxHash(null)} className="ml-auto text-slate-500 hover:text-white">&times;</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 xl:gap-12">
          
          {/* Main Board - Proposals */}
          <div className="xl:col-span-2 space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-extrabold flex items-center gap-3 text-white">
                <LayoutDashboard className="w-8 h-8 text-primary drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                Active Proposals
              </h2>
              <span className="text-sm bg-slate-800/80 text-slate-300 font-semibold px-4 py-1.5 rounded-full border border-slate-700 shadow-inner">
                {proposals.length} Total
              </span>
            </div>
            
            {proposals.length === 0 ? (
              <div className="glass rounded-3xl p-16 text-center border-dashed border-slate-600/50">
                <div className="bg-slate-800/50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <LayoutDashboard className="w-10 h-10 text-slate-500" />
                </div>
                <h3 className="text-xl font-bold text-white">No active proposals</h3>
                <p className="text-sm text-slate-400 mt-2">The governance board is waiting for a new idea.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {proposals.map((p, index) => {
                  const total = p.votesFor + p.votesAgainst;
                  const forPercent = total === 0 ? 0 : Math.round((p.votesFor / total) * 100);
                  const againstPercent = total === 0 ? 0 : 100 - forPercent;
                  
                  return (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, type: "spring", stiffness: 100 }}
                    >
                      <TiltCard>
                        <div className="glass rounded-3xl p-8 transition-all duration-300 border border-slate-700/50 hover:border-primary/50 hover:shadow-[0_0_40px_rgba(59,130,246,0.2)] group relative overflow-hidden h-full">
                          {/* Subtle gradient overlay on hover */}
                          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                          <div className="flex justify-between items-start mb-6 relative z-10">
                            <div>
                              <div className="flex items-center gap-3 mb-2">
                                <span className="text-[10px] font-extrabold text-primary tracking-[0.2em] uppercase bg-primary/10 px-2 py-1 rounded-md">
                                  PROP-{p.id}
                                </span>
                                <span className={`text-[10px] font-extrabold px-2 py-1 rounded-md uppercase tracking-wider ${p.active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                                  {p.active ? 'Active' : 'Closed'}
                                </span>
                              </div>
                              <h3 className="text-2xl font-extrabold text-white leading-tight drop-shadow-sm">{p.title}</h3>
                            </div>
                            
                            {/* Delete Button (Only visible on hover or mobile) */}
                            <button 
                              onClick={() => handleDelete(p.id)}
                              disabled={loading}
                              className="bg-slate-800/50 hover:bg-rose-500/20 hover:text-rose-400 text-slate-500 p-2.5 rounded-xl transition-all border border-transparent hover:border-rose-500/30 group-hover:opacity-100 sm:opacity-0"
                              title="Delete Proposal"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                          
                          <p className="text-slate-300 text-sm leading-relaxed mb-8 bg-slate-900/60 p-5 rounded-2xl border border-slate-800/80 shadow-inner relative z-10">
                            {p.description}
                          </p>
                          
                          {/* Voting Stats Bar */}
                          <div className="mb-8 relative z-10">
                            <div className="flex justify-between text-sm font-bold mb-3">
                              <span className="text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]">{p.votesFor} FOR ({forPercent}%)</span>
                              <span className="text-rose-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.3)]">{p.votesAgainst} AGAINST ({againstPercent}%)</span>
                            </div>
                            <div className="w-full h-3.5 bg-slate-900 rounded-full overflow-hidden flex shadow-inner border border-slate-800">
                              <motion.div 
                                initial={{ width: 0 }} animate={{ width: `${forPercent}%` }} transition={{ duration: 1.5, ease: "easeOut" }}
                                className="h-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.6)] relative"
                              >
                                <div className="absolute inset-0 bg-white/20 w-full h-full"></div>
                              </motion.div>
                              <motion.div 
                                initial={{ width: 0 }} animate={{ width: `${againstPercent}%` }} transition={{ duration: 1.5, ease: "easeOut" }}
                                className="h-full bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.6)] relative"
                              >
                                <div className="absolute inset-0 bg-white/20 w-full h-full"></div>
                              </motion.div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex flex-col sm:flex-row gap-4 relative z-10">
                            <button
                              onClick={() => handleVote(p.id, true)}
                              disabled={loading || !p.active}
                              className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-400 border border-slate-700 hover:border-emerald-500/50 font-bold py-3.5 rounded-2xl transition-all disabled:opacity-30 disabled:hover:bg-slate-800 group/btn"
                            >
                              <ThumbsUp className="w-5 h-5 group-hover/btn:scale-110 transition-transform" /> Support
                            </button>
                            <button
                              onClick={() => handleVote(p.id, false)}
                              disabled={loading || !p.active}
                              className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 border border-slate-700 hover:border-rose-500/50 font-bold py-3.5 rounded-2xl transition-all disabled:opacity-30 disabled:hover:bg-slate-800 group/btn"
                            >
                              <ThumbsDown className="w-5 h-5 group-hover/btn:scale-110 transition-transform" /> Reject
                            </button>
                          </div>
                        </div>
                      </TiltCard>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Admin / Creation Panel */}
          <div className="space-y-6">
            <TiltCard className="xl:sticky xl:top-28">
              <div className="glass rounded-3xl p-8 border border-slate-700 shadow-2xl relative overflow-hidden h-full">
                {/* Subtle background flair */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>

                <h2 className="text-xl font-extrabold flex items-center gap-3 text-white mb-8 relative z-10">
                  <div className="bg-primary/20 p-2 rounded-xl text-primary shadow-[0_0_10px_rgba(59,130,246,0.3)]">
                    <PlusCircle className="w-6 h-6" />
                  </div>
                  Draft Proposal
                </h2>
                
                <form onSubmit={handleCreate} className="space-y-6 relative z-10">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                      Proposal Title
                    </label>
                    <input
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      disabled={loading}
                      className="w-full bg-slate-900/80 border border-slate-700 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-primary/70 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-slate-600 text-white font-medium shadow-inner"
                      placeholder="e.g. Upgrade Security Protocol"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                      Justification / Details
                    </label>
                    <textarea
                      value={newDesc}
                      onChange={(e) => setNewDesc(e.target.value)}
                      disabled={loading}
                      rows={5}
                      className="w-full bg-slate-900/80 border border-slate-700 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-primary/70 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-slate-600 text-white resize-none shadow-inner"
                      placeholder="Explain why the DAO should support this initiative..."
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading || !newTitle.trim() || !newDesc.trim()}
                    className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-extrabold py-4 px-4 rounded-2xl transition-all disabled:opacity-50 disabled:grayscale flex justify-center items-center gap-3 shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] transform hover:-translate-y-0.5 active:translate-y-0"
                  >
                    {loading ? (
                      <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    ) : (
                      <>Submit to Network</>
                    )}
                  </button>
                </form>
              </div>
            </TiltCard>
          </div>

        </div>
      </main>
    </div>
  );
}

export default App;
