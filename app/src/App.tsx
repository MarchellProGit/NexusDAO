import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getSigner, getContract } from './lib/ethereum';
import { Wallet, PlusCircle, CheckCircle2, AlertCircle, Building2, ThumbsUp, ThumbsDown, Info, LayoutDashboard } from 'lucide-react';

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
    <div className="min-h-screen font-sans text-slate-800 pb-20">
      
      {/* Elegant Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2.5 rounded-xl">
              <Building2 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">NexusDAO</h1>
              <p className="text-xs text-slate-500 font-medium">Decentralized Governance</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-full border border-slate-200">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-sm font-semibold text-slate-700">{walletAddress}</span>
            <Wallet className="w-4 h-4 text-slate-400 ml-2" />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 mt-10">
        
        {/* Toast Notifications */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="mb-8 bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-start gap-3 shadow-sm"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold">Transaction Error</h3>
                <p className="text-sm mt-1 opacity-90">{error}</p>
              </div>
            </motion.div>
          )}
          
          {txHash && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="mb-8 bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-start gap-3 shadow-sm"
            >
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold">Success! State Confirmed</h3>
                <p className="text-xs mt-1 font-mono break-all opacity-80">Hash: {txHash}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid lg:grid-cols-3 gap-10">
          
          {/* Main Board - Proposals */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-bold flex items-center gap-2 text-slate-900">
                <LayoutDashboard className="w-6 h-6 text-primary" />
                Active Proposals
              </h2>
              <span className="text-sm bg-primary/10 text-primary font-semibold px-3 py-1 rounded-full">
                {proposals.length} Total
              </span>
            </div>
            
            {proposals.length === 0 ? (
              <div className="glass rounded-2xl p-16 text-center border border-dashed border-slate-300">
                <Info className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-600">No proposals yet</h3>
                <p className="text-sm text-slate-400 mt-1">Be the first to create a proposal for the DAO.</p>
              </div>
            ) : (
              <div className="space-y-5">
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
                      className="glass rounded-2xl p-6 hover:shadow-md transition-shadow border border-slate-200/60"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <span className="text-xs font-bold text-primary tracking-wider uppercase mb-1 block">
                            Proposal #{p.id}
                          </span>
                          <h3 className="text-xl font-bold text-slate-900 leading-tight">{p.title}</h3>
                        </div>
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${p.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                          {p.active ? 'ACTIVE' : 'CLOSED'}
                        </span>
                      </div>
                      
                      <p className="text-slate-600 text-sm leading-relaxed mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                        {p.description}
                      </p>
                      
                      {/* Voting Stats Bar */}
                      <div className="mb-6">
                        <div className="flex justify-between text-xs font-semibold mb-2">
                          <span className="text-emerald-600">{p.votesFor} For ({forPercent}%)</span>
                          <span className="text-rose-600">{p.votesAgainst} Against ({againstPercent}%)</span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
                          <motion.div 
                            initial={{ width: 0 }} animate={{ width: `${forPercent}%` }} transition={{ duration: 1 }}
                            className="h-full bg-emerald-500"
                          />
                          <motion.div 
                            initial={{ width: 0 }} animate={{ width: `${againstPercent}%` }} transition={{ duration: 1 }}
                            className="h-full bg-rose-500"
                          />
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-3 pt-4 border-t border-slate-100">
                        <button
                          onClick={() => handleVote(p.id, true)}
                          disabled={loading || !p.active}
                          className="flex-1 flex items-center justify-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-50"
                        >
                          <ThumbsUp className="w-4 h-4" /> Support
                        </button>
                        <button
                          onClick={() => handleVote(p.id, false)}
                          disabled={loading || !p.active}
                          className="flex-1 flex items-center justify-center gap-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-50"
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
            <div className="glass rounded-2xl p-6 border border-slate-200/60 sticky top-28">
              <h2 className="text-lg font-bold flex items-center gap-2 text-slate-900 mb-6">
                <PlusCircle className="w-5 h-5 text-primary" />
                Create Proposal
              </h2>
              
              <form onSubmit={handleCreate} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    disabled={loading}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-slate-400 text-slate-900 font-medium"
                    placeholder="e.g. Upgrade Security Protocol"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Description
                  </label>
                  <textarea
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    disabled={loading}
                    rows={4}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-slate-400 text-slate-900 resize-none"
                    placeholder="Explain why the DAO should support this..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !newTitle.trim() || !newDesc.trim()}
                  className="w-full bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 font-bold py-3 px-4 rounded-xl transition-all disabled:opacity-50 disabled:shadow-none flex justify-center items-center gap-2"
                >
                  {loading ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  ) : 'Submit to Blockchain'}
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
