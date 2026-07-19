# NexusDAO (Enterprise Web3 Governance)

**NexusDAO** adalah platform tata kelola terdesentralisasi (*Decentralized Autonomous Organization*) berbasis Ethereum. Proyek ini dibangun untuk Tugas Rancang dengan mengusung standar *production-grade*, 100% Full CRUD Smart Contract, dan antarmuka *God-Tier 3D Glassmorphism*.

<div align="center">
  <img src="https://img.shields.io/badge/Solidity-%23363636.svg?style=for-the-badge&logo=solidity&logoColor=white" alt="Solidity" />
  <img src="https://img.shields.io/badge/React-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Foundry-%23FF5E00.svg?style=for-the-badge" alt="Foundry" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Framer_Motion-%230055FF.svg?style=for-the-badge&logo=framer&logoColor=white" alt="Framer Motion" />
</div>

---

## 🔥 Fitur Utama (God-Tier Edition)

1. **100% Full CRUD Smart Contract**
   *   **Create**: `createProposal` (Mendaftarkan proposal baru ke blockchain).
   *   **Read**: `getProposal` (Membaca data live dari jaringan).
   *   **Update**: `castVote`, `closeProposal` (Mengubah status dan jumlah suara).
   *   **Delete**: `deleteProposal` (Menghapus total data dari EVM *Storage*).

2. **Web3 Wallet Switcher**
   *   Simulasi *multi-user* bawaan! Mendemonstrasikan bahwa *smart contract* memiliki keamanan berbasis identitas (`msg.sender`). Satu dompet hanya bisa *vote* satu kali.

3. **3D Glassmorphism UI & Framer Motion**
   *   *Card Tilt Effect*: Kartu proposal bereaksi secara 3D terhadap pergerakan kursor (*hover*).
   *   *Animated Glowing Orbs*: Latar belakang dinamis menggunakan CSS Murni.
   *   *Real-time Sync*: Menggunakan `Ethers.js` *Event Listeners* untuk sinkronisasi otomatis tanpa perlu memuat ulang halaman (*No Refresh*).

## 👨‍💻 Engineering Team

- **Marchell Adi Pratama** (672023081) - Lead Blockchain Engineer & UI/UX Architect.
- **Nova Hendriyawan Putra** (672023113) - Smart Contract QA & Research Analyst.

*(Buka aplikasi dan klik tombol "Team & Docs" di header untuk melihat profil hologram 3D kami!)*

---

## 🛠 Panduan Instalasi (Lokal)

### 1. Jalankan Blockchain Lokal (WSL / Terminal 1)
```bash
cd ~/my-dapp
anvil
```

### 2. Deploy Smart Contract (WSL / Terminal 2)
```bash
cd ~/my-dapp
forge create src/NexusDAO.sol:NexusDAO --rpc-url http://127.0.0.1:8545 --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 --broadcast
```
*Salin alamat kontrak (Deployed to: 0x...) yang muncul.*

### 3. Konfigurasi Frontend (Windows / Terminal 3)
*   Buka file `app/src/lib/ethereum.ts`.
*   Ubah nilai `CONTRACT_ADDRESS` dengan alamat kontrak yang baru saja di-*deploy*.
*   Jalankan server pengembangan:
```powershell
cd C:\Users\HP VICTUS 15\Desktop\Study\SEMESTER 9\BLOCKCHAIN\TR\app
npm run dev
```

### 4. Buka Aplikasi
Akses `http://localhost:5174/` di browser kamu. Klik tombol **"Team & Docs"** untuk mulai mencoba!
