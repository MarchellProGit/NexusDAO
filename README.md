# Tugas Rancang - Blockchain Ethereum (NexusDAO)

## Identitas Tim
- **Anggota 1**: Marchell Adi Pratama (672023081)

## Panduan Setup (Lokal)
Aplikasi NexusDAO (Decentralized Governance) ini berjalan di atas node lokal Anvil dengan RPC `http://127.0.0.1:8545`.

1. **Jalankan Node Anvil**
   Buka terminal WSL dan ketik:
   ```bash
   anvil
   ```
2. **Deploy Smart Contract**
   Di terminal WSL yang berbeda, jalankan:
   ```bash
   forge create src/NexusDAO.sol:NexusDAO --rpc-url http://127.0.0.1:8545 --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 --broadcast
   ```
3. **Menjalankan Frontend Web**
   Masuk ke folder `app` lalu jalankan web:
   ```bash
   cd app
   npm install
   npm run dev
   ```
   Buka browser di `http://localhost:5173`. Frontend sudah terkonfigurasi untuk otomatis menggunakan akun Dev Anvil sehingga tidak memerlukan konfigurasi MetaMask.

## Alamat & Hash Transaksi
Lihat pada file `bukti_deploy.txt`.
 
