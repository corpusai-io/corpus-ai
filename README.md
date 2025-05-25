# Corpus AI Web Platform

A modern, monorepo-based web platform for Corpus AI app building and deployment.

[![Node.js CI](https://img.shields.io/badge/node-v20-green)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-v9.1.4-blue)](https://pnpm.io/)
[![Turborepo](https://img.shields.io/badge/Turborepo-latest-orange)](https://turbo.build/)

## 📋 Overview

Denser Web is a comprehensive web platform consisting of multiple applications:

- **website** - Main user portal
- **backend** - Backend API services
- **dashboard** - Main web application
- **chat-service** - Various serverless functions
- **Docs** - Project documentation

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v20 (recommended)
- [pnpm](https://pnpm.io/) package manager
- [nvm](https://github.com/nvm-sh/nvm) for Node.js version management
- [Docker](https://www.docker.com/) and Docker Compose

### Installation

```bash
# Clone the repository
git clone https://github.com/corpusai-io/corpus-ai.git
cd corpus-ai

# Use the correct Node.js version
nvm use

# Install dependencies
pnpm install
```

## 💻 Development

### Launch All Services

```bash
# Start all applications
pnpm dev
```

### Launch Individual Services

```bash
# Launch Next Portal
pnpm dev --filter=website

# Launch App Server
pnpm dev --filter=backend

# Launch Web App
pnpm dev --filter=dashboard

# Launch Documentation
pnpm dev --filter=docs
```