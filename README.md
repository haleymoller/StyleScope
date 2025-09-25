# StyleScope

An interactive lab where people upload or pick texts, then see and probe “style geometry”: per-layer trajectories, low-dimensional style subspaces, probe accuracy, shuffling tests, and cross-lingual alignments—live, not as a static paper figure.

## Development

Local dev:

```bash
npm run dev
```

Backend:

```bash
cd backend
uvicorn app:app --host 0.0.0.0 --port 8000
```
