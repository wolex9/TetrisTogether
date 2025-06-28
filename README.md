# TetrisTogether

```sh
docker compose up -d
cat schema.sql | docker exec -i tetristogether-db-1 psql -U postgres
pnpm install
pnpm run dev
```
