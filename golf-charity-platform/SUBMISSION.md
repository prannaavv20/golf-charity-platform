# GolfGives — Full Stack Submission
## Digital Heroes Trainee Selection

---

## Live URLs
- **Homepage:** https://golf-charity-platform-kxc7.vercel.app
- **User Dashboard:** https://golf-charity-platform-kxc7.vercel.app/dashboard
- **Admin Panel:** https://golf-charity-platform-kxc7.vercel.app/admin
- **Charities:** https://golf-charity-platform-kxc7.vercel.app/charities

## Source Code
- **GitHub:** https://github.com/prannaavv20/golf-charity-platform

## Test Credentials

### Regular User
- Email: testuser@golfgives.com
- Password: Test1234

### Admin
- Email: pranav99777@gmail.com
- Password: [your password]

## Tech Stack
- Frontend: React + Vite + Tailwind CSS
- Backend/Database: Supabase (PostgreSQL)
- Auth: Supabase Auth
- Deployment: Vercel

## Technical Decisions
Built with React + Vite for fast performance. Supabase handles authentication,
database, and real-time updates in one platform. Rolling score logic maintains
exactly 5 scores per user — new scores replace the oldest automatically.
Draw engine uses random number generation with jackpot rollover if no 5-match
winner. Role-based access control separates admin and user features.
Admin panel covers full user management, charity management, draw simulation,
winner verification and payout tracking.