# Local Docker (Option B): IPFS + Nginx

## Prerequisites
- Docker and Docker Compose installed
- Project built (produces `out/`)

## Steps

1) Build the app (once per change):
```bash
npm ci
npm run build
```

2) Start IPFS (Kubo) and Nginx:
```bash
docker compose up -d
```

- IPFS API: http://127.0.0.1:5001
- IPFS Gateway: http://127.0.0.1:8081
- App (served by Nginx from ./out): http://127.0.0.1:8080

3) (Optional) Deploy build to local IPFS:
```bash
IPFS_API_URL=http://127.0.0.1:5001 npm run deploy:ipfs
```
- The script prints a CID; test via the local gateway:
```bash
open http://127.0.0.1:8081/ipfs/<CID>
```

4) Stop services:
```bash
docker compose down
```

## Notes
- Re-run `npm run build` whenever you change the app; `web` will serve updated `out/` volume automatically.
- You can pin CIDs persistently on your local IPFS node; data volume lives in `docker/ipfs/`.
