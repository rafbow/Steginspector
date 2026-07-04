# StegInspector

StegInspector adalah aplikasi full-stack untuk analisis steganografi gambar. Backend memakai FastAPI, SQLite, SQLAlchemy async, dan pipeline analisis berbasis Pillow/Numpy/Scipy. Frontend memakai React, Vite, TailwindCSS, dan komponen UI lokal bergaya shadcn.

## Struktur

```text
Stegano/
  backend/   FastAPI API, database, upload, analysis engine, PDF report
  frontend/  React dashboard untuk investigator
```

## Menjalankan Backend

```bash
cd backend
python -m pip install -r requirements.txt
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

Swagger tersedia di:

```text
http://127.0.0.1:8000/docs
```

## Menjalankan Frontend

```bash
cd frontend
npm install
npm run dev -- --host 127.0.0.1 --port 5173
```

Frontend tersedia di:

```text
http://127.0.0.1:5173
```

Jika backend memakai URL lain, set:

```bash
VITE_API_URL=http://127.0.0.1:8000 npm run dev
```

## Verifikasi

```bash
cd backend
python -m compileall .
python -c "import main; print(main.app.title)"

cd ../frontend
npm run build
npm audit --audit-level=moderate
```

## Catatan Runtime

File runtime berikut sengaja diabaikan:

- `backend/steginspector.db`
- `backend/uploads/*`
- `backend/reports/*`
- `*.log`

Direktori `uploads` dan `reports` tetap tersedia lewat `.gitkeep`.
