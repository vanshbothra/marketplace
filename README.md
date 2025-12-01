# Ashoka Marketplace

A marketplace platform for Ashoka University students and staff to buy, sell, and trade goods and services.

## Features

- **Authentication**: Google OAuth with domain restriction (@ashoka.edu.in)
- **Business Accounts**: Users can create up to 5 businesses (requires admin approval)
- **Listings**: Products, Services, and Food items
- **Reviews & Ratings**: Rate and review listings
- **Admin Panel**: Approve/reject business applications
- **Peer-to-Peer**: Focus on connecting buyers and sellers directly

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS + Shadcn UI
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with Google Provider
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js 20.10+ (for Next.js and dependencies)
- PostgreSQL database
- Google OAuth credentials

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   Create a `.env` file in the root directory with the following:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/ashoka_marketplace?schema=public"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="generate-this-with-openssl-rand-base64-32"
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   ```

3. **Set up Google OAuth**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create OAuth 2.0 credentials
   - Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`

4. **Set up the database**:
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```

5. **Run the development server**:
   ```bash
   npm run dev
   ```

6. **Open the app**: Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

### For Users
1. Sign in with your Ashoka University email
2. Create a business from the dashboard (up to 5 businesses)
3. Wait for admin approval
4. Add listings once approved
5. Browse the marketplace

### For Admins
1. Navigate to `/admin` to access the admin panel
2. Review and approve/reject pending businesses

To make a user an admin:
```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'admin@ashoka.edu.in';
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── admin/             # Admin panel
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # User dashboard & business management
│   ├── marketplace/       # Marketplace feed & listing details
│   └── api/               # API routes
├── components/            # React components
├── lib/                   # Utility functions
└── types/                 # TypeScript type definitions

prisma/
└── schema.prisma          # Database schema
```

## License

This project is for educational purposes as part of Ashoka University coursework.
