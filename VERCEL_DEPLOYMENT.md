# Vercel Deployment Guide for shelfix

## Prerequisites
1. Node.js 18+ installed
2. A Vercel account (https://vercel.com)
3. MongoDB Atlas cluster (for database)
4. Environment variables configured

## Environment Variables

Set these in Vercel project settings:

```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/shelfix?retryWrites=true&w=majority
JWT_SECRET=your-secure-random-string-here
FRONTEND_URL=https://your-domain.vercel.app
NODE_ENV=production
```

## Deployment Steps

### Option 1: Using Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to your Vercel account
vercel login

# Deploy from project root
vercel

# Set environment variables when prompted
# Choose your git provider and connect repository
```

### Option 2: Using GitHub

1. Push your code to GitHub
2. Connect repository to Vercel at https://vercel.com/new
3. Select "Import Git Repository"
4. Set environment variables in project settings
5. Deploy

## Project Structure

```
shelfix/
├── api/                    # Serverless API functions
│   └── index.js           # Express app handler
├── client/                 # React frontend (Vite)
│   └── src/
├── server/                 # Express server files
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   └── middleware/
├── vercel.json            # Vercel configuration
└── package.json           # Root package.json
```

## How It Works

- **Frontend**: Builds to `/client/dist` and is served as static files
- **Backend**: Runs as serverless functions in `/api` directory
- **API Routes**: Proxied from `/api/*` to serverless functions

## Local Testing

```bash
# Install dependencies
npm install
npm install --prefix client
npm install --prefix server

# Development
npm run dev

# Build for production
npm run build
```

## Troubleshooting

### Connection Timeout
- Ensure MongoDB Atlas allows connections from Vercel's IP ranges
- Check connection string includes `?retryWrites=true&w=majority`

### 404 on API calls
- Verify environment variables are set correctly
- Check that `/api` routes are properly configured

### Frontend shows 404
- Ensure `client/dist` is built correctly
- Verify `outputDirectory` in vercel.json points to `client/dist`

## Database Setup

### MongoDB Atlas Setup
1. Create cluster at https://www.mongodb.com/cloud/atlas
2. Create database user with credentials
3. Add Vercel deployment IPs to network access
4. Copy connection string to MONGO_URI environment variable

## Performance Tips

1. Use MongoDB indexes for frequently queried fields
2. Implement caching for static data
3. Optimize API response payloads
4. Use CDN for static assets (included with Vercel)

## Next Steps

After deployment:
1. Test all API endpoints
2. Verify database connectivity
3. Monitor logs in Vercel dashboard
4. Set up custom domain (optional)
