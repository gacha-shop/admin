# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Gacha Store Admin - A React-based admin interface for managing a gacha store system. This project uses React 19 with the React Compiler enabled and Vite as the build tool.

## Tech Stack

- **React 19.1.1** with React Compiler (babel-plugin-react-compiler)
- **TypeScript 5.9** with strict mode enabled
- **Vite 7.1** as build tool and dev server
- **ESLint** with TypeScript, React Hooks, and React Refresh plugins

## Development Commands

```bash
# Start development server with HMR
npm run dev

# Type check and build for production
npm run build

# Lint all files
npm run lint

# Preview production build locally
npm run preview
```

## Important Configuration Notes

### React Compiler

This project has the React Compiler enabled via `babel-plugin-react-compiler` in [vite.config.ts](vite.config.ts). This provides automatic memoization but impacts dev and build performance. The compiler optimizes React components automatically, so manual `useMemo` and `useCallback` may be less necessary.

### TypeScript Configuration

The project uses a composite TypeScript setup with project references:

- [tsconfig.json](tsconfig.json) - Root config with project references
- [tsconfig.app.json](tsconfig.app.json) - App-specific config with strict linting options
- [tsconfig.node.json](tsconfig.node.json) - Node/build tooling config

Key compiler options:

- Strict mode enabled
- `noUnusedLocals` and `noUnusedParameters` enforce clean code
- `verbatimModuleSyntax` requires explicit type imports
- `moduleResolution: "bundler"` for Vite compatibility

### ESLint

Uses flat config format ([eslint.config.js](eslint.config.js)) with:

- TypeScript ESLint recommended rules
- React Hooks recommended-latest rules
- React Refresh Vite integration

## Project Structure

```
src/
  ├── App.tsx                     # Main application component
  ├── main.tsx                    # Application entry point
  ├── components/                 # Reusable components
  │   ├── layout/                 # Layout components (GNB, Sidebar, MainLayout)
  │   ├── ui/                     # UI components (shadcn/ui)
  │   └── store/                  # Store-related components
  ├── pages/                      # Page components
  │   ├── Dashboard.tsx
  │   ├── Products.tsx
  │   ├── Users.tsx
  │   └── Settings.tsx
  ├── lib/                        # Utility functions
  ├── assets/                     # Static assets (images, etc.)
  └── *.css                       # Component and global styles
```

## Future Architecture Recommendations

As the project grows, consider implementing:

- **Feature-based structure**: Group related code by feature (see [docs/guides/migration-guide.md](docs/guides/migration-guide.md))
- **API service layer**: Centralized API calls with proper error handling
- **State management**: Global state solution (Zustand, Jotai, or Context)
- **Type definitions**: Centralized TypeScript types
- **Custom hooks**: Shared hooks directory for reusable logic
- **Constants**: Configuration and constant values management

## Documentation

All project documentation is organized in the [docs/](docs/) directory:

### Guides
- [Code Guidelines](docs/guides/code-guidelines.md) - Coding standards and conventions
- [Migration Guide](docs/guides/migration-guide.md) - Directory structure migration plan
- [Documentation Structure](docs/guides/documentation-structure.md) - How to write and organize docs

### Specifications
- [Product Spec](docs/specs/PRODUCT_SPEC.md) - Product specifications

### Database
- [Shops Table Schema](docs/database/tables/shops.md) - Shop table schema

### Setup
- [MCP Setup](docs/setup/MCP_SETUP.md) - Model Context Protocol configuration

For a complete documentation index, see [docs/README.md](docs/README.md).
