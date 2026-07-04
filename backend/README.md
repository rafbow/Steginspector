# StegInspector Backend

FastAPI backend untuk autentikasi, upload gambar, analisis steganografi, histori, dashboard stats, dan PDF report.

## Setup

```bash
python -m pip install -r requirements.txt
copy .env.example .env
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

## Endpoint Utama

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/images/upload`
- `POST /api/analysis/run/{image_id}`
- `GET /api/analysis/{image_id}/status`
- `GET /api/analysis/{image_id}/results`
- `GET /api/reports/{image_id}`
- `GET /api/history`
- `GET /api/dashboard/stats`

## Analisis

Pipeline saat ini mencakup hash, metadata EXIF, histogram RGB, channel preview, alpha inspection, bit-plane preview, LSB statistics, string extraction, entropy, signature verification, dan risk scoring.
