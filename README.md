# Church Admin Portal

[![Build and Deploy](https://github.com/Abdalkaderdev/Soap-Box-Church-Admin/actions/workflows/deploy.yml/badge.svg)](https://github.com/Abdalkaderdev/Soap-Box-Church-Admin/actions/workflows/deploy.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF.svg)](https://vitejs.dev/)

Church administration dashboard for managing congregations, members, and church operations. Part of the SoapBox ecosystem with SSO integration.

## Overview

The Church Admin Portal is a comprehensive web application designed for church administrators to manage all aspects of their congregation. It integrates with the SoapBox Super App via SSO for seamless authentication.

## Features

### Core Features (Available Now)

#### Dashboard
- Quick stats overview (members, attendance, donations, events)
- Recent activity feed
- Upcoming events preview
- Key metrics and trends

#### Member Management
- Full member directory with search and filtering
- Member profiles with contact information
- Add/edit member details
- Member status tracking (active, inactive, visitor)
- Family linking and household management

#### Donations & Giving
- Donation dashboard with totals and trends
- Record donations (cash, check, online)
- Donor profiles and giving history
- Giving statements generation
- Pledge tracking (upcoming)
- Donation categories and fund management

#### Event Management
- Event calendar and list views
- Create and manage events
- Event RSVPs and attendance tracking
- Recurring event support
- Event categories

#### Attendance Tracking
- Service attendance recording
- Attendance trends and analytics
- Historical attendance data
- Check-in system integration

#### Check-In System
- Member check-in for services
- QR code support
- Child check-in (upcoming)
- Check-in history

#### First-Time Visitors
- Visitor registration and tracking
- Follow-up workflow
- Visitor to member conversion

#### Communications
- Email and SMS campaigns
- Announcement management
- Contact lists and groups
- Communication history

#### Volunteers
- Volunteer roster management
- Role assignments
- Scheduling (upcoming)
- Background checks integration (upcoming)

#### Discipleship
- Discipleship pathway tracking
- Small group assignments
- Growth metrics

#### Small Groups
- Group management
- Group leader assignments
- Meeting schedules
- Group rosters

#### Sermon Preparation
- Sermon notes and outlines
- Scripture references
- AI-assisted content (via SoapBox)

#### Prayer Requests
- Prayer request management
- Prayer chain coordination
- Request status tracking

#### Reports
- Member reports
- Donation reports
- Attendance reports
- Custom report builder

#### Financial Dashboard
- Financial overview
- Budget vs actual
- Fund balances
- Giving trends

### Upcoming Features (Coming Soon)

- **Child Check-In**: Secure child registration and pickup
- **Facility Booking**: Room and resource scheduling
- **Volunteer Scheduling**: Automated volunteer coordination
- **Online Classes**: Virtual learning management
- **Pastoral Care**: Care tracking and follow-up
- **Background Checks**: Integration with screening services
- **Multi-Campus**: Multi-site management
- **Member Directory**: Searchable member directory
- **Pledge Tracking**: Campaign and pledge management
- **Announcements**: In-app announcement system

## Tech Stack

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS with tailwindcss-animate
- **UI Components**: Radix UI (via shadcn/ui patterns)
- **State Management**: TanStack Query v5
- **Routing**: Wouter
- **Charts**: Recharts
- **Animation**: Framer Motion
- **Date Handling**: date-fns

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd church-admin

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

### Environment Variables

Create a `.env` file in the root directory:

```bash
# SoapBox SSO Configuration
VITE_SOAPBOX_SSO_URL=https://app.soapboxsuperapp.com
VITE_SOAPBOX_API_URL=https://api.soapboxsuperapp.com

# Application Settings
VITE_APP_NAME=Church Admin Portal
VITE_APP_URL=https://your-domain.com
```

## Authentication

The Church Admin Portal uses SoapBox SSO for authentication:

1. Users click "Login" and are redirected to SoapBox SSO
2. After successful authentication, users are redirected back with credentials
3. Session is stored locally and validated against SoapBox API
4. Role-based access control is enforced based on user's church role

### User Roles

- **church_admin**: Full access to all features
- **staff**: Access to most features except financial management
- **volunteer_lead**: Access to volunteer and event management
- **member**: Limited access (read-only for most features)

## Project Structure

```
church-admin/
├── src/
│   ├── components/
│   │   ├── layout/          # Main layout components
│   │   └── ui/              # UI components (buttons, cards, etc.)
│   ├── hooks/               # Custom React hooks
│   ├── layouts/             # Page layouts
│   ├── lib/                 # Utilities
│   ├── pages/
│   │   ├── admin/           # Admin pages (jobs management)
│   │   ├── attendance/      # Attendance tracking
│   │   ├── auth/            # Login and authentication
│   │   ├── checkin/         # Check-in system
│   │   ├── communications/  # Email/SMS campaigns
│   │   ├── discipleship/    # Discipleship tracking
│   │   ├── donations/       # Donation management
│   │   ├── events/          # Event management
│   │   ├── groups/          # Small groups
│   │   ├── members/         # Member management
│   │   ├── prayer/          # Prayer requests
│   │   ├── reports/         # Reporting
│   │   ├── sermons/         # Sermon preparation
│   │   ├── settings/        # Application settings
│   │   ├── statements/      # Giving statements
│   │   ├── upcoming/        # Coming soon features
│   │   ├── visitors/        # First-time visitors
│   │   └── volunteers/      # Volunteer management
│   ├── types/               # TypeScript types
│   ├── App.tsx              # Main app component
│   ├── routes.tsx           # Route definitions
│   └── main.tsx             # Entry point
├── public/                  # Static assets
└── package.json
```

## API Integration

The Church Admin Portal integrates with the SoapBox Super App API:

### Authentication
```
GET /api/user              # Get current user
POST /api/auth/logout      # Logout
```

### Members
```
GET /api/churches/:id/members     # List members
POST /api/churches/:id/members    # Add member
PATCH /api/members/:id            # Update member
DELETE /api/members/:id           # Remove member
```

### Donations
```
GET /api/churches/:id/donations   # List donations
POST /api/donations               # Record donation
GET /api/donors/:id               # Get donor details
GET /api/statements/:userId       # Generate statement
```

### Events
```
GET /api/churches/:id/events      # List events
POST /api/events                  # Create event
PATCH /api/events/:id             # Update event
GET /api/events/:id/rsvps         # Get RSVPs
```

## Development

### Code Style

The project uses ESLint with TypeScript support:

```bash
# Run linter
npm run lint

# Fix auto-fixable issues
npm run lint -- --fix
```

### Type Checking

```bash
# Run type check
npm run build
```

### Adding New Pages

1. Create page component in `src/pages/`
2. Add route in `src/routes.tsx`
3. Update navigation in layout if needed

## Known Issues

1. **SSO Redirect Loop**: Clear localStorage if stuck in redirect loop
2. **Chart Rendering**: Charts may flash on initial load - this is a Recharts hydration issue
3. **Mobile Navigation**: Some complex tables require horizontal scroll on mobile

## Contributing

1. Fork the repository
2. Create a feature branch
3. Follow existing code patterns and TypeScript conventions
4. Test thoroughly on desktop and mobile
5. Submit a Pull Request

### Coding Guidelines

- Use TypeScript strict mode
- Follow React 19 best practices
- Use Tailwind CSS for styling
- Prefer Radix UI primitives for accessibility
- Write meaningful component and function names

## Deployment

### Build for Production

```bash
npm run build
```

The build output will be in the `dist/` directory.

### Hosting

The application can be deployed to:
- Vercel
- Netlify
- Cloudflare Pages
- Any static hosting service

### Docker

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## Support

- **SoapBox Team**: support@soapboxsuperapp.com
- **Documentation**: https://docs.soapboxsuperapp.com/church-admin

## License

Proprietary - Part of the SoapBox ecosystem. All rights reserved.
