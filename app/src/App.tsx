import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getSigner, getContract } from './lib/ethereum';
import { Wallet, PlusCircle, CheckCircle2, AlertCircle, Building2, ThumbsUp, ThumbsDown, Info, LayoutDashboard, HelpCircle } from 'lucide-react';

interface Proposal {
  id: number;
  title: string;
  description: string;
  votesFor: number;
  votesAgainst: number;
  active: boolean;
}

function App() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState<string>("0xac09...ff80");
  const [showDocs, setShowDocs] = useState(false);

  const loadData = async () => {
    try {
      const signer = getSigner();
      const contract = getContract(signer);
      
      const count = await contract.proposalCount();
      const loadedProposals: Proposal[] = [];
      
      for (let i = 1; i <= Number(count); i++) {
        const p = await contract.getProposal(i);
        loadedProposals.push({
          id: Number(p.id),
          title: p.title,
          description: p.description,
          votesFor: Number(p.votesFor),
          votesAgainst: Number(p.votesAgainst),
          active: p.active
        });
      }
      setProposals(loadedProposals.reverse()); // Show newest first
    } catch (err) {
      console.error(err);
      setError("Failed to load blockchain data. Ensure local node is running.");
    }
  };

  useEffect(() => {
    loadData();

    try {
      const signer = getSigner();
      const contract = getContract(signer);
      
      const onProposalCreated = (id: bigint, title: string) => {
        console.log(`ProposalCreated: ${title}`);
        loadData();
      };

      const onVoted = (id: bigint, voter: string, support: boolean) => {
        console.log(`Voted on ${id}: ${support}`);
        loadData();
      };

      contract.on("ProposalCreated", onProposalCreated);
      contract.on("Voted", onVoted);

      return () => {
        contract.off("ProposalCreated", onProposalCreated);
        contract.off("Voted", onVoted);
      };
    } catch (err) {
      console.warn("Event listeners could not be attached.", err);
    }
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDesc.trim()) return;
    
    setLoading(true);
    setError(null);
    setTxHash(null);
    try {
      const signer = getSigner();
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
      const signer = getSigner();
      const contract = getContract(signer);
      const tx = await contract.castVote(id, support);
      setTxHash(tx.hash);
      await tx.wait();
      loadData();
    } catch (err: any) {
      setError(err.reason || "Voting failed. You might have already voted.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen font-sans text-slate-100 pb-20 selection:bg-primary/30">
      
      {/* Premium Header */}
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50 shadow-xl shadow-black/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-primary to-accent p-2.5 rounded-xl shadow-lg shadow-primary/20">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">NexusDAO</h1>
              <p className="text-xs text-slate-400 font-medium tracking-wide uppercase">Decentralized Governance</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 bg-slate-800/80 px-4 py-2 rounded-full border border-slate-700 shadow-inner">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]"></div>
            <span className="text-sm font-semibold text-slate-300 hidden sm:inline-block">{walletAddress}</span>
            <Wallet className="w-4 h-4 text-slate-400 ml-2" />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 mt-8 sm:mt-10">
        
        {/* Toast Notifications */}
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 w-full max-w-sm px-4 sm:px-0 pointer-events-none">
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, x: 50, scale: 0.9 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                className="bg-slate-800 border-l-4 border-rose-500 text-slate-200 p-4 rounded-xl shadow-2xl flex items-start gap-3 pointer-events-auto"
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
                className="bg-slate-800 border-l-4 border-emerald-500 text-slate-200 p-4 rounded-xl shadow-2xl flex items-start gap-3 pointer-events-auto"
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

        {/* Documentation / Guide Banner */}
        <motion.div layout className="mb-10">
          <button 
            onClick={() => setShowDocs(!showDocs)}
            className="w-full flex items-center justify-between bg-slate-800/40 hover:bg-slate-800/60 border border-slate-700 p-4 rounded-2xl transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="bg-primary/20 p-2 rounded-lg">
                <HelpCircle className="w-5 h-5 text-primary" />
              </div>
              <span className="font-semibold text-slate-200">How to use NexusDAO</span>
            </div>
            <span className="text-slate-400 text-sm font-medium">{showDocs ? 'Hide Guide' : 'Show Guide'}</span>
          </button>
          
          <AnimatePresence>
            {showDocs && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-slate-800/40 border border-t-0 border-slate-700 p-6 rounded-b-2xl mt-[-8px] text-sm text-slate-300 space-y-4 pt-8">
                  <p><strong className="text-white">1. Create a Proposal:</strong> Use the form on the right (or below on mobile) to submit a new idea. This will trigger a <code className="bg-slate-900 px-1 py-0.5 rounded text-primary">createProposal</code> transaction on the Ethereum network.</p>
                  <p><strong className="text-white">2. Vote on Proposals:</strong> Click "Support" or "Reject" on any active proposal. This sends a <code className="bg-slate-900 px-1 py-0.5 rounded text-primary">castVote</code> transaction. Note: A wallet address can only vote once per proposal.</p>
                  <p><strong className="text-white">3. Real-time Web3:</strong> All changes are instantly synced using Ethers.js Event Listeners (<code className="bg-slate-900 px-1 py-0.5 rounded text-primary">ProposalCreated</code> and <code className="bg-slate-900 px-1 py-0.5 rounded text-primary">Voted</code>). No page reload required!</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
          
          {/* Main Board - Proposals */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold flex items-center gap-2 text-white">
                <LayoutDashboard className="w-6 h-6 text-primary" />
                Active Proposals
              </h2>
              <span className="text-sm bg-primary/10 text-primary font-semibold px-3 py-1 rounded-full border border-primary/20">
                {proposals.length} Total
              </span>
            </div>
            
            {proposals.length === 0 ? (
              <div className="glass rounded-2xl p-16 text-center border border-dashed border-slate-600">
                <Info className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-300">No proposals yet</h3>
                <p className="text-sm text-slate-500 mt-1">Be the first to create a proposal for the DAO.</p>
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
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.01 }}
                      className="glass rounded-2xl p-6 transition-all duration-300 border border-slate-700 hover:border-slate-500 hover:shadow-primary/5"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <span className="text-xs font-bold text-primary tracking-widest uppercase mb-1 block opacity-80">
                            Proposal #{p.id}
                          </span>
                          <h3 className="text-xl font-bold text-white leading-tight">{p.title}</h3>
                        </div>
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${p.active ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-500 border border-slate-700'}`}>
                          {p.active ? 'ACTIVE' : 'CLOSED'}
                        </span>
                      </div>
                      
                      <p className="text-slate-300 text-sm leading-relaxed mb-6 bg-slate-900/50 p-4 rounded-xl border border-slate-800/50">
                        {p.description}
                      </p>
                      
                      {/* Voting Stats Bar */}
                      <div className="mb-6">
                        <div className="flex justify-between text-xs font-bold mb-2">
                          <span className="text-emerald-400">{p.votesFor} For ({forPercent}%)</span>
                          <span className="text-rose-400">{p.votesAgainst} Against ({againstPercent}%)</span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden flex shadow-inner">
                          <motion.div 
                            initial={{ width: 0 }} animate={{ width: `${forPercent}%` }} transition={{ duration: 1, ease: "easeOut" }}
                            className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                          />
                          <motion.div 
                            initial={{ width: 0 }} animate={{ width: `${againstPercent}%` }} transition={{ duration: 1, ease: "easeOut" }}
                            className="h-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]"
                          />
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col sm:flex-row gap-3 pt-5 border-t border-slate-700/50">
                        <button
                          onClick={() => handleVote(p.id, true)}
                          disabled={loading || !p.active}
                          className="flex-1 flex items-center justify-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold py-3 rounded-xl transition-all disabled:opacity-30 disabled:hover:bg-emerald-500/10"
                        >
                          <ThumbsUp className="w-4 h-4" /> Support
                        </button>
                        <button
                          onClick={() => handleVote(p.id, false)}
                          disabled={loading || !p.active}
                          className="flex-1 flex items-center justify-center gap-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-semibold py-3 rounded-xl transition-all disabled:opacity-30 disabled:hover:bg-rose-500/10"
                        >
                          <ThumbsDown className="w-4 h-4" /> Reject
                        </button>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Admin / Creation Panel */}
          <div className="space-y-6">
            <div className="glass rounded-2xl p-6 border border-slate-700 lg:sticky lg:top-28">
              <h2 className="text-lg font-bold flex items-center gap-2 text-white mb-6">
                <PlusCircle className="w-5 h-5 text-primary" />
                Submit Proposal
              </h2>
              
              <form onSubmit={handleCreate} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    disabled={loading}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-slate-600 text-slate-200 font-medium"
                    placeholder="e.g. Upgrade Security Protocol"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                    Description
                  </label>
                  <textarea
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    disabled={loading}
                    rows={4}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-slate-600 text-slate-200 resize-none"
                    placeholder="Explain why the DAO should support this..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !newTitle.trim() || !newDesc.trim()}
                  className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white font-bold py-3.5 px-4 rounded-xl transition-all disabled:opacity-50 flex justify-center items-center gap-2 shadow-lg shadow-primary/20"
                >
                  {loading ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  ) : 'Sign & Submit'}
                </button>
              </form>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

export default App;
