<div align="center">
  <img src="https://img.shields.io/badge/Ethereum-3C3C3D?style=for-the-badge&logo=Ethereum&logoColor=white" alt="Ethereum" />
  <img src="https://img.shields.io/badge/Solidity-%23363636.svg?style=for-the-badge&logo=solidity&logoColor=white" alt="Solidity" />
  <img src="https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB" alt="React" />
  <img src="https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="TailwindCSS" />
  
  <br />
  
  <h1>🌌 NexusDAO</h1>
  <p><strong>A Premium Decentralized Governance Platform (E-Voting) built on Ethereum.</strong></p>
</div>

---

## 📌 Deskripsi Proyek
**NexusDAO** adalah aplikasi *Decentralized Autonomous Organization* (DAO) berbasis Ethereum yang memungkinkan komunitas untuk membuat proposal dan melakukan *voting* (Upvote/Downvote) secara transparan, *immutable*, dan terdesentralisasi. Dibangun dengan antarmuka **Premium Dark Mode Glassmorphism**, proyek ini merupakan *upgrade* komprehensif dari sistem E-Voting tradisional, menjadikannya siap untuk standar industri *Web3*.

Proyek ini disusun khusus untuk memenuhi (dan melampaui) standar Tugas Rancang mata kuliah **Teknologi Blockchain**.

### ✨ Fitur Utama
- **CRUD Smart Contract**: Fitur Create Proposal, Cast Vote, Close Proposal, dan Read State.
- **Real-Time Blockchain Sync**: Menggunakan `Ethers.js` Event Listeners (`ProposalCreated`, `Voted`) untuk update UI tanpa *refresh* halaman.
- **Premium UI/UX**: Desain *Dark Mode*, animasi *Framer Motion*, dan notifikasi *Toast* yang terintegrasi.
- **100% On-Chain**: Seluruh data tersimpan mutlak di jaringan Ethereum lokal (Anvil).

---

## 👨‍💻 Identitas Tim
- **Nama**: Marchell Adi Pratama
- **NIM**: 672023081

---

## 🚀 Panduan Setup & Instalasi (Local Development)

Aplikasi NexusDAO berjalan di atas node lokal Anvil dengan RPC `http://127.0.0.1:8545`.

### 1. Jalankan Blockchain Node (Anvil)
Buka terminal WSL (Ubuntu) dan jalankan:
```bash
anvil
```

### 2. Deploy Smart Contract
Buka terminal WSL baru, arahkan ke root direktori proyek, lalu eksekusi *deployment* kontrak `NexusDAO`:
```bash
forge create src/NexusDAO.sol:NexusDAO --rpc-url http://127.0.0.1:8545 --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 --broadcast
```

### 3. Menjalankan Frontend Web (React)
Jika Anda menggunakan Windows, sangat disarankan menjalankan ini via **PowerShell / CMD Windows** (bukan WSL) untuk menghindari *error mapping network*:
```bash
cd app
npm install
npm run dev
```
Akses `http://localhost:5173/` (atau port yang tertera) melalui browser. Aplikasi sudah terintegrasi langsung dengan RPC lokal dan akun Anvil pertama (`0xac09...`), sehingga **TIDAK** membutuhkan MetaMask.

---

## 📄 Alamat Kontrak & Hash Transaksi
Silakan merujuk ke file `bukti_deploy.txt` untuk verifikasi *Transaction Hash*, alamat *deployer*, gas terpakai, dan interaksi *state* untuk laporan Tugas Rancang.
 
