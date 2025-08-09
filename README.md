# Dynamic Flow Platform

A flexible form builder platform similar to Typeform, designed for multi-tenant usage with embedded and white-label capabilities.

## 🏗️ Architecture Overview

### Tech Stack
- **Frontend Framework**: React 18 + TypeScript
- **Build Tool**: Vite (faster dev experience)
- **Styling**: Tailwind CSS + Headless UI
- **State Management**: Zustand (lightweight alternative to Redux)
- **Form Handling**: React Hook Form + Zod validation
- **UI Components**: Custom component library
- **Icons**: Lucide React

### Multi-Tenant Support
- **Theme System**: CSS custom properties + Tailwind
- **Configuration**: Environment-based settings
- **Branding**: Dynamic logo, colors, fonts
- **Domain**: Custom subdomain support

### Deployment Options
1. **Embedded Widget**: Lightweight iframe-based solution
2. **White-label**: Full branded application
3. **Self-hosted**: Docker containers for enterprise

## 🚀 Features

- Drag & drop flow builder
- Real-time form preview
- Multi-step forms with conditional logic
- Custom themes and branding
- Responsive design
- Analytics dashboard
- API integrations
- Webhook support

## 📦 Project Structure

```
apps/
├── admin/              # Admin dashboard
├── builder/            # Form builder interface
├── viewer/             # Form viewer/renderer
└── embed/              # Embeddable widget

packages/
├── ui/                 # Shared UI components
├── core/               # Core business logic
├── themes/             # Theme system
└── types/              # TypeScript definitions

config/
├── ci/                 # CI/CD configurations
├── docker/             # Container configurations
└── deploy/             # Deployment scripts
```

## 🔧 Development

```bash
npm install
npm run dev
```

## 🏢 Enterprise Features

- Single Sign-On (SSO)
- Custom CI/CD pipelines
- On-premise deployment
- Advanced analytics
- Priority support
