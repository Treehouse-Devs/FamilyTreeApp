# Family Tree Maker App Monorepo

This repository is a **monorepo** managed with [Turborepo](https://turbo.build/repo), containing the frontend and backend projects for the Family Tree Maker App.

---

## Project Structure

- `apps/frontend` — React Native app built with [Expo](https://expo.dev/)
- `apps/backend` — Backend API built with [NestJS](https://nestjs.com/)
- `packages/dto` — Shared Data Transfer Objects (DTOs) used by both frontend and backend

---

## Getting Started

### Prerequisites (installed globally)

- [Node.js](https://nodejs.org/) (Recommended version: 22+)
- [Yarn](https://yarnpkg.com/) (v1 or v3+)
- [Expo CLI](https://docs.expo.dev/workflow/expo-cli/) (optional but recommended for React Native development)

### Installation

Clone the repository and install dependencies:

```bash
git clone <repo-url>
cd <repo-folder>
yarn install