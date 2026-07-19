import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
    <div className="min-h-screen text-[#ededed] pb-20 selection:bg-white/20 relative">
      <div className="elegant-bg"></div>

      {/* Clean Header */}
      <header className="border-b border-white/[0.08] sticky top-0 z-40 bg-black/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer">
            <div className="bg-white text-black p-1.5 rounded-lg">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-white">NexusDAO</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowDocsModal(true)}
              className="hidden sm:flex items-center gap-2 text-sm font-medium text-[#a1a1aa] hover:text-white transition-colors px-3 py-1.5 rounded-md hover:bg-white/[0.05]"
            >
              <Users className="w-4 h-4" /> Team & Docs
            </button>

            <div className="relative">
              <button 
                onClick={() => setShowWalletDropdown(!showWalletDropdown)}
                className="flex items-center gap-3 bg-white/[0.03] hover:bg-white/[0.06] transition-colors px-3 py-1.5 rounded-lg border border-white/[0.08] group"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <div className="text-left hidden sm:block">
                  <p className="text-sm font-medium text-white leading-tight">{currentAccount.name}</p>
                </div>
                <ChevronDown className="w-4 h-4 text-[#a1a1aa] ml-1 group-hover:text-white transition-colors" />
              </button>

              <AnimatePresence>
                {showWalletDropdown && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 5, scale: 0.98 }} transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-64 bg-[#111] rounded-xl shadow-2xl overflow-hidden z-50 border border-white/[0.08]"
                  >
                    <div className="px-4 py-3 border-b border-white/[0.08] bg-black/40">
                      <p className="text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider">Select Identity</p>
                    </div>
                    <div className="p-1.5 space-y-0.5">
                      {ACCOUNTS.map((acc, idx) => (
                        <button
                          key={idx}
                          onClick={() => { setCurrentAccountIndex(idx); setShowWalletDropdown(false); }}
                          className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center justify-between transition-colors ${currentAccountIndex === idx ? 'bg-white/[0.08] text-white' : 'hover:bg-white/[0.04] text-[#a1a1aa]'}`}
                        >
                          <div>
                            <p className="text-sm font-medium">{acc.name}</p>
                            <p className="text-xs opacity-60 font-mono mt-0.5">{acc.address.substring(0,6)}...{acc.address.substring(38)}</p>
                          </div>
                          {currentAccountIndex === idx && <CheckCircle2 className="w-4 h-4 text-white" />}
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

      {/* Elegant Team & Docs Modal */}
      <AnimatePresence>
        {showDocsModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.98, y: 10, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.98, y: 10, opacity: 0 }}
              className="bg-[#111] border border-white/[0.08] rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative"
            >
              <button 
                onClick={() => setShowDocsModal(false)}
                className="absolute top-5 right-5 text-[#a1a1aa] hover:text-white p-2 rounded-lg hover:bg-white/[0.05] transition-colors z-10"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="p-8 sm:p-12">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-semibold text-white mb-3">NexusDAO Ecosystem</h2>
                  <p className="text-[#a1a1aa] text-lg">A robust implementation of decentralized governance.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
                  <div className="bg-black/50 border border-white/[0.05] p-8 rounded-2xl">
                    <BookOpen className="w-8 h-8 text-white mb-5 opacity-80" />
                    <h3 className="text-lg font-semibold text-white mb-3">How it Works</h3>
                    <ul className="space-y-3 text-[#a1a1aa] text-sm">
                      <li className="flex items-start gap-2"><span className="text-white mt-0.5">•</span><span><strong>Create:</strong> Submit on-chain proposals transparently.</span></li>
                      <li className="flex items-start gap-2"><span className="text-white mt-0.5">•</span><span><strong>Vote:</strong> Support or reject proposals (1 vote per wallet identity).</span></li>
                      <li className="flex items-start gap-2"><span className="text-white mt-0.5">•</span><span><strong>Delete:</strong> Permanently erase data from EVM storage.</span></li>
                    </ul>
                  </div>
                  <div className="bg-black/50 border border-white/[0.05] p-8 rounded-2xl">
                    <Code className="w-8 h-8 text-white mb-5 opacity-80" />
                    <h3 className="text-lg font-semibold text-white mb-3">Technical Stack</h3>
                    <ul className="space-y-3 text-[#a1a1aa] text-sm">
                      <li className="flex items-start gap-2"><span className="text-white mt-0.5">•</span><span><strong>Smart Contract:</strong> Solidity & Foundry.</span></li>
                      <li className="flex items-start gap-2"><span className="text-white mt-0.5">•</span><span><strong>Frontend:</strong> React, TypeScript, Vite.</span></li>
                      <li className="flex items-start gap-2"><span className="text-white mt-0.5">•</span><span><strong>Integration:</strong> Ethers.js via Local RPC.</span></li>
                    </ul>
                  </div>
                </div>

                <div className="border-t border-white/[0.08] pt-10">
                  <h3 className="text-sm font-semibold text-white mb-6 text-center">The Engineering Team</h3>
                  <div className="flex flex-col sm:flex-row justify-center gap-6">
                    <div className="bg-black/50 border border-white/[0.05] p-4 rounded-2xl w-full sm:w-64 flex flex-col items-center">
                      <div className="w-24 h-24 rounded-full overflow-hidden mb-4 border border-white/[0.1]">
                        <img src="/Marchell.jpg" alt="Marchell" className="object-cover w-full h-full grayscale hover:grayscale-0 transition-all duration-300" />
                      </div>
                      <h4 className="text-base font-semibold text-white">Marchell Adi P.</h4>
                      <p className="text-xs text-[#a1a1aa] font-mono mt-1 mb-3">672023081</p>
                      <p className="text-xs text-center text-[#71717a]">Lead Blockchain Engineer & UI/UX Architect.</p>
                    </div>

                    <div className="bg-black/50 border border-white/[0.05] p-4 rounded-2xl w-full sm:w-64 flex flex-col items-center">
                      <div className="w-24 h-24 rounded-full overflow-hidden mb-4 border border-white/[0.1]">
                        <img src="/Nova.png" alt="Nova" className="object-cover w-full h-full grayscale hover:grayscale-0 transition-all duration-300" />
                      </div>
                      <h4 className="text-base font-semibold text-white">Nova Hendriyawan</h4>
                      <p className="text-xs text-[#a1a1aa] font-mono mt-1 mb-3">672023113</p>
                      <p className="text-xs text-center text-[#71717a]">Smart Contract QA & Research Analyst.</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 mt-10 mb-20">
        
        {/* Minimal Toast Notifications */}
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 w-full max-w-sm px-4 sm:px-0 pointer-events-none">
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#111] border border-rose-500/30 text-white p-4 rounded-xl shadow-xl flex items-start gap-3 pointer-events-auto"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{error}</p>
                </div>
                <button onClick={() => setError(null)} className="text-[#a1a1aa] hover:text-white">&times;</button>
              </motion.div>
            )}
            
            {txHash && (
              <motion.div 
                initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#111] border border-emerald-500/30 text-white p-4 rounded-xl shadow-xl flex items-start gap-3 pointer-events-auto"
              >
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Transaction Confirmed</p>
                  <p className="text-xs text-[#a1a1aa] font-mono mt-1">Tx: {txHash.substring(0,16)}...</p>
                </div>
                <button onClick={() => setTxHash(null)} className="text-[#a1a1aa] hover:text-white">&times;</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          
          {/* Main Board - Proposals */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
              <h2 className="text-xl font-semibold flex items-center gap-2 text-white">
                <LayoutDashboard className="w-5 h-5 text-[#a1a1aa]" />
                Active Proposals
              </h2>
              <span className="text-xs font-medium bg-white/[0.05] border border-white/[0.08] text-[#a1a1aa] px-3 py-1 rounded-full">
                {proposals.length} Total
              </span>
            </div>
            
            {proposals.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border border-dashed border-white/[0.1] rounded-2xl p-16 text-center">
                <div className="w-16 h-16 bg-white/[0.02] border border-white/[0.05] rounded-full flex items-center justify-center mx-auto mb-4">
                  <LayoutDashboard className="w-6 h-6 text-[#71717a]" />
                </div>
                <h3 className="text-base font-semibold text-white">No active proposals</h3>
                <p className="text-[#71717a] mt-1 text-sm">The governance board is waiting for a new initiative.</p>
              </motion.div>
            ) : (
              <div className="space-y-4">
                <AnimatePresence>
                  {proposals.map((p, index) => {
                    const total = p.votesFor + p.votesAgainst;
                    const forPercent = total === 0 ? 0 : Math.round((p.votesFor / total) * 100);
                    const againstPercent = total === 0 ? 0 : 100 - forPercent;
                    
                    return (
                      <motion.div
                        key={p.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-[#111] border border-white/[0.08] rounded-2xl p-6 transition-colors hover:bg-[#141414]"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-[10px] font-medium text-[#a1a1aa] bg-white/[0.05] px-2 py-0.5 rounded-md">
                                PROP-{p.id}
                              </span>
                              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md ${p.active ? 'bg-emerald-500/10 text-emerald-500' : 'bg-white/[0.05] text-[#71717a]'}`}>
                                {p.active ? 'Active' : 'Closed'}
                              </span>
                            </div>
                            <h3 className="text-xl font-semibold text-white">{p.title}</h3>
                          </div>
                          
                          {/* Delete Button */}
                          <button 
                            onClick={() => handleDelete(p.id)}
                            disabled={loading}
                            className="text-[#71717a] hover:text-rose-500 p-2 rounded-lg hover:bg-rose-500/10 transition-colors"
                            title="Delete Proposal"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <div className="mb-6">
                          <p className="text-[#a1a1aa] text-sm leading-relaxed">
                            {p.description}
                          </p>
                        </div>
                        
                        {/* Voting Stats Minimal */}
                        <div className="mb-6">
                          <div className="flex justify-between text-xs font-medium mb-2 text-[#a1a1aa]">
                            <span>{p.votesFor} For ({forPercent}%)</span>
                            <span>{p.votesAgainst} Against ({againstPercent}%)</span>
                          </div>
                          <div className="w-full h-1.5 bg-black rounded-full overflow-hidden flex">
                            <motion.div 
                              initial={{ width: 0 }} animate={{ width: `${forPercent}%` }} transition={{ duration: 1 }}
                              className="h-full bg-white"
                            ></motion.div>
                            <motion.div 
                              initial={{ width: 0 }} animate={{ width: `${againstPercent}%` }} transition={{ duration: 1 }}
                              className="h-full bg-[#333]"
                            ></motion.div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleVote(p.id, true)}
                            disabled={loading || !p.active}
                            className="flex-1 flex items-center justify-center gap-2 bg-white text-black hover:bg-gray-200 font-medium py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50 disabled:bg-white/[0.1] disabled:text-[#a1a1aa]"
                          >
                            <ThumbsUp className="w-4 h-4" /> Support
                          </button>
                          <button
                            onClick={() => handleVote(p.id, false)}
                            disabled={loading || !p.active}
                            className="flex-1 flex items-center justify-center gap-2 bg-black border border-white/[0.1] text-white hover:bg-white/[0.05] font-medium py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50"
                          >
                            <ThumbsDown className="w-4 h-4" /> Reject
                          </button>
                        </div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Admin / Creation Panel Minimal */}
          <div className="lg:col-span-4">
            <div className="sticky top-24">
              <div className="bg-[#111] border border-white/[0.08] rounded-2xl p-6">
                <h2 className="text-lg font-semibold flex items-center gap-2 text-white mb-6">
                  <PlusCircle className="w-5 h-5 text-[#a1a1aa]" />
                  Draft Proposal
                </h2>
                
                <form onSubmit={handleCreate} className="space-y-5">
                  <div>
                    <label className="block text-xs font-medium text-[#a1a1aa] mb-2">
                      Proposal Title
                    </label>
                    <input
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      disabled={loading}
                      className="w-full bg-black border border-white/[0.1] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-white transition-colors text-white placeholder:text-[#52525b]"
                      placeholder="e.g. Upgrade Security Protocol"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#a1a1aa] mb-2">
                      Justification
                    </label>
                    <textarea
                      value={newDesc}
                      onChange={(e) => setNewDesc(e.target.value)}
                      disabled={loading}
                      rows={4}
                      className="w-full bg-black border border-white/[0.1] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-white transition-colors text-white placeholder:text-[#52525b] resize-none"
                      placeholder="Explain why the DAO should support this..."
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={loading || !newTitle.trim() || !newDesc.trim()}
                    className="w-full bg-white text-black hover:bg-gray-200 font-medium py-3 rounded-xl text-sm transition-colors disabled:opacity-50 disabled:bg-white/[0.1] disabled:text-[#a1a1aa]"
                  >
                    {loading ? (
                      <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin mx-auto block"></span>
                    ) : (
                      <>Submit to Network</>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

export default App;
