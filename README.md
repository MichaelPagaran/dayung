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

1. **Clone the repository**:

    ```bash
    git clone git@github.com:MichaelPagaran/dayung.git
    cd dayung
    ```

2. **Install Dependencies**:

    ```bash
    npm install
    ```

3. **Run Development Server**:

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

---

## Frontend Development Policies

### 1. Theming & Configuration

All styling must be **configurable via CSS variables** for future brand switching:

| Type | Requirement |
|------|-------------|
| Colors | Define in `:root` CSS variables only |
| Fonts | Reference via `--font-heading`, `--font-body` |
| Spacing | Use Tailwind's default scale (rem-based) |

> **Rule**: No hardcoded color values in components. Always use CSS variables or Tailwind semantic colors.

### 2. Typography Hierarchy

| Level | Font | Weight | Usage |
|-------|------|--------|-------|
| **H1** | Geist Sans | 800 | Primary headers |
| **H2-H3** | Geist Sans | 600 | Sub-headers |
| **Navigation** | Geist Sans | 500 | Sidebar, menu items |
| **Data/Ledgers** | Inter Variable | 400 | Tables, numbers (`tabular-nums`) |
| **Labels** | Inter Variable | 600 | Small text (11-12px) |

### 3. Flexbox-First Layout

- **Default to flexbox** for all container elements
- **Mobile-first breakpoints**: base → `sm:` → `md:` → `lg:` → `xl:`
- **Fluid widths preferred**: use `flex-1`, `w-full` over fixed pixel values
- **Consistent gaps**: use `gap-*` utilities instead of margins between flex children

### 4. Reusable Components

- **shadcn/ui first**: prefer shadcn/ui components over custom implementations
- UI primitives go in `src/components/ui/`
- Feature-specific components go in `src/components/{feature}/`
- All components must be **responsive by default**
- Only build custom when shadcn/ui doesn't cover the use case

### 5. Responsive Design

**Breakpoints (Tailwind defaults):**

| Prefix | Min Width | Target |
|--------|-----------|--------|
| (none) | 0px | Mobile phones |
| `sm:` | 640px | Large phones |
| `md:` | 768px | Tablets |
| `lg:` | 1024px | Laptops |
| `xl:` | 1280px | Desktops |
| `2xl:` | 1536px | 4K displays |

**Testing Requirements:**

- All pages must be tested at 375px, 768px, and 1280px minimum
- Tables must have horizontal scroll on mobile
- Forms must stack vertically on mobile
