# ZoloSMM

ZoloSMM is a fast, reliable social media marketing (SMM) panel for resellers and creators, with wallet-based ordering and an automated provider network.

## Features

- User dashboard with wallet, deposits and full order history
- Service catalogue with categories, pricing and per-service limits
- Single, mass and scheduled (drip-feed) ordering
- Automatic order status sync and refill handling
- Admin panel for services, users, payments, settings and support
- Crypto and UPI payment gateway integration with server-side verification
- Reseller-friendly REST API (v2 compatible)
- Responsive, mobile-first interface

## Tech stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS
- **Backend:** PostgreSQL, PostgREST, GoTrue auth, Deno edge functions (Docker Compose)
- **Hosting:** Nginx reverse proxy behind Cloudflare

## Project structure

```text
frontend/   React web application (panel + admin)
backend/    Docker Compose services, database schema and edge functions
README.md
```

## Getting started

```bash
# install dependencies
npm ci

# start local development server
npm run dev

# production build
npm run build
```

Create a local `.env` file with your own configuration values before running.
Environment files, keys and customer data are never committed to this repository.

## Security

- All secrets are supplied through environment variables only
- Payments are credited only after verification with the payment provider
- Database access is protected by row-level security policies

## License

Proprietary. All rights reserved. This source is published for reference and
may not be copied, redistributed or resold without written permission from the owner.
