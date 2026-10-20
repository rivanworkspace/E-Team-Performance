# E-Team-Performance

Kode alat Team E. File pembuka (`Team_E_Performance_Review.html`) mengambil isi folder `e/` setiap kali dibuka.

- `e/app.html` – kode dashboard (tanpa data)
- `e/boot.js` – pemuat: ambil versi terbaru, simpan salinan untuk offline
- `e/publish.js` – tombol Publish di mode TL
- `e/data.json` – data dashboard, **terenkripsi** (AES-256, password TL & password grup). Diisi lewat tombol Publish di dashboard.
