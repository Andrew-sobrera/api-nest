## Requisitos

- Node.js 20+
- pnpm 9+
- Docker Desktop (para PostgreSQL via Docker Compose)
- PostgreSQL 16 (alternativa local sem Docker)

---

## Variáveis de Ambiente

Copie o arquivo de exemplo:

```bash
cp .env.example .env
```

## Como Executar

```bash
docker compose up --build
```

Serviços:
- **API**: `http://localhost:3000`
- **PostgreSQL**: `localhost:5432`
- **Swagger**: `http://localhost:3000/docs`

---

## Documentação Swagger

Acesse a documentação interativa em:

```
http://localhost:3000/docs
```