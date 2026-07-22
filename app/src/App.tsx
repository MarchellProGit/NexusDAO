import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getSigner, getContract, ACCOUNTS } from './lib/ethereum';
import { PlusCircle, CheckCircle2, AlertCircle, Building2, ThumbsUp, ThumbsDown, Trash2, LayoutDashboard, ChevronDown, Users, X, Fingerprint } from 'lucide-react';

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
  const [gasUsed, setGasUsed] = useState<string | null>(null);
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
    setGasUsed(null);
    try {
      const signer = getSigner(currentAccount.key);
      const contract = getContract(signer);
      const tx = await contract.createProposal(newTitle, newDesc);
      setTxHash(tx.hash);
      const receipt = await tx.wait();
      if(receipt && receipt.gasUsed) { setGasUsed(receipt.gasUsed.toString()); }
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
    setGasUsed(null);
    try {
      const signer = getSigner(currentAccount.key);
      const contract = getContract(signer);
      const tx = await contract.castVote(id, support);
      setTxHash(tx.hash);
      const receipt = await tx.wait();
      if(receipt && receipt.gasUsed) { setGasUsed(receipt.gasUsed.toString()); }
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
    setGasUsed(null);
    try {
      const signer = getSigner(currentAccount.key);
      const contract = getContract(signer);
      const tx = await contract.deleteProposal(id);
      setTxHash(tx.hash);
      const receipt = await tx.wait();
      if(receipt && receipt.gasUsed) { setGasUsed(receipt.gasUsed.toString()); }
      loadData();
    } catch (err: any) {
      setError(err.reason || "Deletion failed.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen text-slate-100 pb-20 relative">
      {/* Aurora Animated Background */}
      <div className="aurora-bg">
        <div className="aurora-1"></div>
        <div className="aurora-2"></div>
        <div className="aurora-3"></div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-3xl bg-slate-900/30 border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group">
            <div className="bg-gradient-to-br from-indigo-500 to-teal-400 p-2.5 rounded-2xl shadow-[0_0_20px_rgba(99,102,241,0.4)] group-hover:scale-105 transition-transform">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">NexusDAO</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowDocsModal(true)}
              className="hidden sm:flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors px-4 py-2 rounded-xl hover:bg-white/10"
            >
              <Users className="w-4 h-4" /> Team & Docs
            </button>

            <div className="relative">
              <button 
                onClick={() => setShowWalletDropdown(!showWalletDropdown)}
                className="flex items-center gap-3 bg-white/5 hover:bg-white/10 transition-colors px-5 py-2.5 rounded-2xl border border-white/10 shadow-sm group"
              >
                <Fingerprint className="w-4 h-4 text-teal-400" />
                <div className="text-left hidden sm:block">
                  <p className="text-sm font-bold text-white leading-tight">{currentAccount.name}</p>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400 ml-1 group-hover:text-white transition-colors" />
              </button>

              <AnimatePresence>
                {showWalletDropdown && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-3 w-64 glass overflow-hidden z-50 border-white/10"
                  >
                    <div className="px-5 py-3 border-b border-white/5 bg-slate-900/50">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Select Identity</p>
                    </div>
                    <div className="p-2 space-y-1">
                      {ACCOUNTS.map((acc, idx) => (
                        <button
                          key={idx}
                          onClick={() => { setCurrentAccountIndex(idx); setShowWalletDropdown(false); }}
                          className={`w-full text-left px-4 py-3 rounded-xl flex items-center justify-between transition-all ${currentAccountIndex === idx ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'hover:bg-white/5 text-slate-300 border border-transparent'}`}
                        >
                          <div>
                            <p className="text-sm font-bold">{acc.name}</p>
                            <p className="text-xs opacity-60 font-mono mt-0.5">{acc.address.substring(0,6)}...{acc.address.substring(38)}</p>
                          </div>
                          {currentAccountIndex === idx && <CheckCircle2 className="w-5 h-5 text-indigo-400" />}
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

      {/* Docs Modal */}
      <AnimatePresence>
        {showDocsModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xl"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.95, y: 20, opacity: 0 }}
              className="glass max-w-4xl w-full max-h-[90vh] overflow-y-auto relative"
            >
              <button 
                onClick={() => setShowDocsModal(false)}
                className="absolute top-6 right-6 text-slate-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors z-10"
              >
                <X className="w-6 h-6" />
              </button>
              
              <div className="p-8 sm:p-12">
                <div className="text-center mb-10">
                  <h2 className="text-4xl font-bold text-white mb-4 text-gradient">System Documentation</h2>
                  <p className="text-slate-400 text-lg">Technical Specification & Environmental Information</p>
                </div>

                <div className="space-y-6 mb-10">
                  {/* Kriteria 1 */}
                  <div className="glass-input p-6 border-l-4 border-l-indigo-500">
                    <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-indigo-400" />
                      1. Smart Contract Capabilities
                    </h3>
                    <p className="text-slate-300 text-sm leading-relaxed mb-3">
                      Sistem menggunakan satu Smart Contract utama (<code className="bg-white/10 px-1.5 py-0.5 rounded text-indigo-300">NexusDAO.sol</code>) yang mencakup:
                    </p>
                    <ul className="list-disc list-inside text-slate-400 text-sm space-y-1 ml-2">
                      <li><strong>4 Write Functions:</strong> <code className="text-slate-300">createProposal</code>, <code className="text-slate-300">castVote</code>, <code className="text-slate-300">closeProposal</code>, <code className="text-slate-300">deleteProposal</code>.</li>
                      <li><strong>3 Read Functions:</strong> <code className="text-slate-300">getProposal</code>, <code className="text-slate-300">proposalCount</code>, <code className="text-slate-300">hasVoted</code>.</li>
                      <li><strong>4 Event Loggers:</strong> <code className="text-slate-300">ProposalCreated</code>, <code className="text-slate-300">Voted</code>, <code className="text-slate-300">ProposalClosed</code>, <code className="text-slate-300">ProposalDeleted</code>.</li>
                    </ul>
                  </div>

                  {/* Kriteria 2 */}
                  <div className="glass-input p-6 border-l-4 border-l-teal-500">
                    <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-teal-400" />
                      2. Local Node Environment (Anvil)
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                      <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5">
                        <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-1">Contract Address</p>
                        <p className="text-sm font-mono text-teal-300 break-all">0x5FbDB2315678afecb367f032d93F642f64180aa3</p>
                      </div>
                      <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5">
                        <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-1">Deployment Tx Hash</p>
                        <p className="text-sm font-mono text-teal-300 break-all">0x78cb98eb9b01f470c631481e13093f88a7fedd0c8f61b0567abe9a53d567e155</p>
                      </div>
                    </div>
                  </div>

                  {/* Kriteria 3 & 4 */}
                  <div className="glass-input p-6 border-l-4 border-l-emerald-500">
                    <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      3. Web3 Interface & Real-time Transactions
                    </h3>
                    <p className="text-slate-300 text-sm leading-relaxed mb-4">
                      Antarmuka aplikasi berbasis React & Ethers.js mengeksekusi fungsi baca-tulis dan merekam jejak data secara permanen di Blockchain.
                    </p>
                    <div className="space-y-3">
                      <div className="flex gap-3 items-start bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20">
                        <div className="bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded font-bold text-xs mt-0.5">W1</div>
                        <div>
                          <p className="text-sm font-bold text-white">Create Proposal (Write Transaction)</p>
                          <p className="text-xs text-slate-400 mt-1">Mengonsumsi <span className="text-emerald-300">~140,000 Gas</span>. Menghasilkan event ProposalCreated.</p>
                        </div>
                      </div>
                      <div className="flex gap-3 items-start bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20">
                        <div className="bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded font-bold text-xs mt-0.5">W2</div>
                        <div>
                          <p className="text-sm font-bold text-white">Cast Vote (Write Transaction)</p>
                          <p className="text-xs text-slate-400 mt-1">Mengonsumsi <span className="text-emerald-300">~230,000 Gas</span>. Menghasilkan event Voted.</p>
                        </div>
                      </div>
                      <div className="flex gap-3 items-start bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20">
                        <div className="bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded font-bold text-xs mt-0.5">R1</div>
                        <div>
                          <p className="text-sm font-bold text-white">Get Proposal Data (Read Query)</p>
                          <p className="text-xs text-slate-400 mt-1">View function (0 Gas Fee). Dipanggil otomatis saat state dirender ulang.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Kriteria 5 */}
                  <div className="glass-input p-6 border-l-4 border-l-purple-500">
                    <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-purple-400" />
                      4. State Dynamics & Identitas Pengguna
                    </h3>
                    <ul className="space-y-4 text-slate-300 text-sm mt-4">
                      <li>
                        <strong className="text-white block mb-1">On-chain State Changes:</strong>
                        Setiap kali <code>createProposal</code> dipanggil, slot storage EVM baru terbentuk untuk menyimpan Struct Proposal. Ketika <code>deleteProposal</code> dijalankan, data dalam mapping akan direset (dihapus permanen dari EVM state).
                      </li>
                      <li>
                        <strong className="text-white block mb-1">Alamat Dompet (Accounts):</strong>
                        <div className="font-mono text-xs text-purple-300 bg-slate-900/50 p-2 rounded mt-1 border border-white/5">
                          Admin (0xf39Fd6e5...): Pak TIB<br/>
                          User 1 (0x70997970...): Marchell<br/>
                          User 2 (0x3C44CdDd...): Nova
                        </div>
                      </li>
                      <li>
                        <strong className="text-white block mb-1">Transaction Hash Live:</strong>
                        Saat fungsi Write dieksekusi, Tx Hash otentik (66-karakter hex string) akan langsung diproses dan ditampilkan melalui Toast Notifications di sudut layar.
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/10">
                  <h3 className="text-sm font-bold text-slate-500 mb-8 text-center uppercase tracking-widest">The Engineering Team</h3>
                  <div className="flex flex-col sm:flex-row justify-center gap-8">
                    <div className="glass-input p-6 w-full sm:w-64 flex flex-col items-center group">
                      <div className="w-28 h-28 rounded-full overflow-hidden mb-5 border-4 border-white/5 group-hover:border-indigo-400/50 transition-colors">
                        <img src="/Marchell.jpg" alt="Marchell" className="object-cover w-full h-full opacity-80 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <h4 className="text-lg font-bold text-white">Marchell Adi P.</h4>
                      <p className="text-xs text-indigo-300 font-bold mt-1 mb-3 bg-indigo-500/20 px-3 py-1 rounded-full border border-indigo-500/30">672023081</p>
                      <p className="text-sm text-center text-slate-400">Lead Blockchain Engineer & UI/UX Architect.</p>
                    </div>

                    <div className="glass-input p-6 w-full sm:w-64 flex flex-col items-center group">
                      <div className="w-28 h-28 rounded-full overflow-hidden mb-5 border-4 border-white/5 group-hover:border-teal-400/50 transition-colors">
                        <img src="/Nova.png" alt="Nova" className="object-cover w-full h-full opacity-80 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <h4 className="text-lg font-bold text-white">Nova Hendriyawan</h4>
                      <p className="text-xs text-teal-300 font-bold mt-1 mb-3 bg-teal-500/20 px-3 py-1 rounded-full border border-teal-500/30">672023113</p>
                      <p className="text-sm text-center text-slate-400">Smart Contract QA & Research Analyst.</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 mt-12 mb-20 relative z-10">
        
        {/* Toast Notifications */}
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 w-full max-w-sm px-4 sm:px-0 pointer-events-none">
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                className="glass border-l-4 border-rose-500 text-white p-5 flex items-start gap-4 pointer-events-auto shadow-[0_10px_30px_rgba(244,63,94,0.2)]"
              >
                <AlertCircle className="w-6 h-6 flex-shrink-0 text-rose-500" />
                <div className="flex-1">
                  <p className="text-sm font-bold">Transaction Failed</p>
                  <p className="text-xs mt-1 text-slate-300">{error}</p>
                </div>
                <button onClick={() => setError(null)} className="text-slate-400 hover:text-white">&times;</button>
              </motion.div>
            )}
            
            {txHash && (
              <motion.div 
                initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                className="glass border-l-4 border-teal-500 text-white p-5 flex items-start gap-4 pointer-events-auto shadow-[0_10px_30px_rgba(20,184,166,0.2)]"
              >
                <CheckCircle2 className="w-6 h-6 flex-shrink-0 text-teal-400" />
                <div className="flex-1">
                  <p className="text-sm font-bold">Transaction Confirmed</p>
                  <p className="text-xs text-slate-400 font-mono mt-1">Tx: {txHash.substring(0,16)}...</p>
                  {gasUsed && (
                    <p className="text-xs text-emerald-400 font-mono mt-1">
                      Gas Used: {Number(gasUsed).toLocaleString()}
                    </p>
                  )}
                </div>
                <button onClick={() => setTxHash(null)} className="text-slate-400 hover:text-white">&times;</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          
          {/* Main Board - Proposals */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between pb-4">
              <h2 className="text-3xl font-bold flex items-center gap-3 text-white">
                <LayoutDashboard className="w-8 h-8 text-indigo-400 drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
                Active Proposals
              </h2>
              <span className="text-sm font-bold bg-white/10 border border-white/10 text-white px-4 py-2 rounded-full backdrop-blur-md">
                {proposals.length} Total
              </span>
            </div>
            
            {proposals.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass border-dashed p-16 text-center">
                <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <LayoutDashboard className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-2xl font-bold text-white">No active proposals</h3>
                <p className="text-slate-400 mt-2 font-medium">The governance board is waiting for a new initiative.</p>
              </motion.div>
            ) : (
              <div className="space-y-6">
                <AnimatePresence>
                  {proposals.map((p, index) => {
                    const total = p.votesFor + p.votesAgainst;
                    const forPercent = total === 0 ? 0 : Math.round((p.votesFor / total) * 100);
                    const againstPercent = total === 0 ? 0 : 100 - forPercent;
                    
                    return (
                      <motion.div
                        key={p.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: index * 0.05 }}
                        className="glass p-8 sm:p-10 group"
                      >
                        <div className="flex justify-between items-start mb-6">
                          <div>
                            <div className="flex items-center gap-3 mb-4">
                              <span className="text-[11px] font-bold text-indigo-200 bg-indigo-500/20 px-3 py-1.5 rounded-lg border border-indigo-500/30">
                                PROP-{p.id}
                              </span>
                              <span className={`text-[11px] font-bold px-3 py-1.5 rounded-lg border ${p.active ? 'bg-teal-500/20 text-teal-300 border-teal-500/30' : 'bg-white/5 text-slate-400 border-white/10'}`}>
                                {p.active ? 'Active' : 'Closed'}
                              </span>
                            </div>
                            <h3 className="text-3xl font-bold text-white">{p.title}</h3>
                          </div>
                          
                          {/* Delete Button */}
                          <button 
                            onClick={() => handleDelete(p.id)}
                            disabled={loading}
                            className="text-slate-400 hover:text-rose-400 p-3 rounded-xl hover:bg-rose-500/10 transition-colors border border-transparent hover:border-rose-500/20"
                            title="Delete Proposal"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                        
                        <div className="mb-8">
                          <p className="text-slate-300 text-base leading-relaxed font-medium glass-input p-6 border-none">
                            {p.description}
                          </p>
                        </div>
                        
                        {/* Voting Stats */}
                        <div className="mb-8">
                          <div className="flex justify-between text-sm font-bold mb-3">
                            <span className="text-teal-400">{p.votesFor} For ({forPercent}%)</span>
                            <span className="text-purple-400">{p.votesAgainst} Against ({againstPercent}%)</span>
                          </div>
                          <div className="w-full h-3 glass-input border-none rounded-full overflow-hidden flex p-0.5">
                            <motion.div 
                              initial={{ width: 0 }} animate={{ width: `${forPercent}%` }} transition={{ duration: 1, ease: "easeOut" }}
                              className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full"
                            ></motion.div>
                            <motion.div 
                              initial={{ width: 0 }} animate={{ width: `${againstPercent}%` }} transition={{ duration: 1, ease: "easeOut" }}
                              className="h-full bg-gradient-to-r from-purple-500 to-rose-400 rounded-full ml-1"
                            ></motion.div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-4">
                          <button
                            onClick={() => handleVote(p.id, true)}
                            disabled={loading || !p.active}
                            className="flex-1 flex items-center justify-center gap-2 bg-teal-500/10 border border-teal-500/30 text-teal-300 hover:bg-teal-500/20 hover:border-teal-400/50 font-bold py-4 rounded-xl transition-all disabled:opacity-30"
                          >
                            <ThumbsUp className="w-5 h-5" /> Support
                          </button>
                          <button
                            onClick={() => handleVote(p.id, false)}
                            disabled={loading || !p.active}
                            className="flex-1 flex items-center justify-center gap-2 bg-purple-500/10 border border-purple-500/30 text-purple-300 hover:bg-purple-500/20 hover:border-purple-400/50 font-bold py-4 rounded-xl transition-all disabled:opacity-30"
                          >
                            <ThumbsDown className="w-5 h-5" /> Reject
                          </button>
                        </div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Admin / Creation Panel */}
          <div className="lg:col-span-4">
            <div className="sticky top-28">
              <div className="glass p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl"></div>
                
                <h2 className="text-2xl font-bold flex items-center gap-3 text-white mb-8 relative z-10">
                  <div className="bg-indigo-500/20 p-2.5 rounded-xl text-indigo-400 border border-indigo-500/30">
                    <PlusCircle className="w-6 h-6" />
                  </div>
                  Draft Proposal
                </h2>
                
                <form onSubmit={handleCreate} className="space-y-6 relative z-10">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">
                      Proposal Title
                    </label>
                    <input
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      disabled={loading}
                      className="glass-input w-full px-5 py-4 text-white placeholder:text-slate-500 font-medium"
                      placeholder="e.g. Upgrade Security Protocol"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">
                      Justification
                    </label>
                    <textarea
                      value={newDesc}
                      onChange={(e) => setNewDesc(e.target.value)}
                      disabled={loading}
                      rows={5}
                      className="glass-input w-full px-5 py-4 text-white placeholder:text-slate-500 font-medium resize-none"
                      placeholder="Explain why the DAO should support this..."
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={loading || !newTitle.trim() || !newDesc.trim()}
                    className="w-full bg-gradient-to-r from-indigo-500 to-teal-400 text-white hover:opacity-90 font-bold py-4 rounded-xl transition-all disabled:opacity-50 disabled:grayscale shadow-[0_0_20px_rgba(99,102,241,0.3)] flex justify-center items-center h-14"
                  >
                    {loading ? (
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
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
