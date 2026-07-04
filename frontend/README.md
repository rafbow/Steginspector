# StegInspector Frontend

React + Vite + Tailwind dashboard for the StegInspector FastAPI backend.

## Development

```bash
npm install
npm run dev
```

The app uses `http://127.0.0.1:8000` as the default backend. Override it with:

```bash
VITE_API_URL=http://127.0.0.1:8000 npm run dev
```

## Verification

```bash
npm run build
npm audit --audit-level=moderate
```
