# Dayung Web

The frontend application for the **Dayung** (Association Governance Management System).

## Overview
Built with **Next.js** (App Router), **Tailwind CSS v4**, and **TypeScript**. This application serves as the user interface for Homeowners, Staff, and Administrators to manage units, finances, and assets.

## Tech Stack
- **Framework**: [Next.js](https://nextjs.org) (App Router)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com) + CSS Variables
- **API State**: [TanStack Query](https://tanstack.com/query/latest)
- **Local State**: [Zustand](https://zustand-demo.pmnd.rs/)

## Getting Started

1.  **Clone the repository**:
    ```bash
    git clone git@github.com:MichaelPagaran/dayung.git
    cd dayung
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Run Development Server**:
    ```bash
    npm run dev
    ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure
- `src/app`: Routes and Pages (Next.js App Router)
- `src/features`: Functional domains (Registry, Ledger, Auth)
- `src/components/ui`: Reusable UI atoms (Buttons, Inputs)
- `src/lib`: Utilities and API configuration

## Design System
The design is controlled via CSS variables in `@theme` config. See `src/styles/globals.css`.
