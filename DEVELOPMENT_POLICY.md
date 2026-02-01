# Dayung Web App - Development Policy

This document serves as the source of truth for development standards and architectural decisions for the `dayung` frontend application.

## 1. Type Synchronization

**Policy:** The Frontend must strictly mirror Backend Data Transfer Objects (DTOs).
- **Source**: Backend Pydantic models (typically in `agms/apps/<app>/schemas.py`).
- **Destination**: Frontend TypeScript interfaces in `src/types/backend.d.ts` (or feature-specific `types.ts`).
- **Rule**: Do not invent new shapes for API responses. If the backend changes, update the frontend type immediately.

## 2. Testing

**Policy:** All new features must include automated tests.
- **Framework**: Vitest + React Testing Library.
- **Scope**:
    - **Unit Tests**: Utilities and Hooks (required).
    - **Component Tests**: Complex interaction components (required).
    - **E2E**: Critical flows (optional for now).
- **Command**: Run `npm test` to execute the suite.

## 3. Architecture

**Policy:** Feature-Sliced Design (Hybrid).
- **Location**: All domain-specific code belongs in `src/features/<feature-name>`.
- **Structure**:
    - `api/`: API hooks (useQuery wrappers).
    - `components/`: UI components specific to this feature.
    - `types.ts`: Local types (if not shared).
- **Shared UI**: Only truly generic UI components (buttons, inputs) belong in `src/components/ui`.

## 4. API & Error Handling

**Policy:** Centralized API Client.
- **Client**: Use the axios instance exported from `src/lib/api.ts`.
- **Auth**: Rely on `httpOnly` cookies. Do not manually manage tokens in localStorage.
- **Errors**: Handle 401 Unauthorized globally (redirect/refresh).
