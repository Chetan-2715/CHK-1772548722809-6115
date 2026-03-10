# Scan4Elders - Deployment & Setup Guide

## Quick Start Guide

### Prerequisites
- Node.js 18+
- Python 3.10+
- PostgreSQL Database (Neon Cloud recommended)
- Google Gemini API Key

---

## Frontend Setup

### Installation
```bash
cd frontend
npm install --legacy-peer-deps
```

### Running Development Server
```bash
npm run dev
```
Server runs on: `http://localhost:5173/`

### Building for Production
```bash
npm run build
npm run preview
```

### Environment Variables (if needed)
```
VITE_API_URL=http://localhost:8000
VITE_APP_NAME=Scan4Elders
```

---

## Backend Setup

### 1. Virtual Environment Setup
```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Environment Configuration
Create `.env` file:
```
DATABASE_URL=postgresql://user:password@host:port/dbname?sslmode=require
GEMINI_API_KEY=your_gemini_api_key
SECRET_KEY=your_secret_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### 4. Database Initialization
```bash
python database.py
```

### 5. Run Application
```bash
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
API available at: `http://localhost:8000`
Docs available at: `http://localhost:8000/docs`

---

## API Endpoints

### Health Check
```
GET /health
Response: {"status": "healthy", "service": "scan4elders-api"}
```

### Authentication
```
POST /auth/register
POST /auth/login
POST /auth/logout
```

### Prescriptions
```
GET /prescriptions
POST /prescriptions/upload
GET /prescriptions/{id}
DELETE /prescriptions/{id}
```

### Medicine
```
POST /medicine/search
POST /medicine/scan-barcode
POST /medicine/verify-tablet
GET /medicine/{id}
```

### Reminders
```
GET /reminders
POST /reminders
PUT /reminders/{id}
DELETE /reminders/{id}
```

---

## Database Schema

### Tables Structure
- **users**: User accounts and profiles
- **prescriptions**: Uploaded prescriptions
- **medicines**: Medicine database
- **reminders**: User medication reminders

See `schema.sql` for detailed schema.

---

## Features Checklist

### ✅ Completed
- [x] Responsive UI design
- [x] Accessibility features (text size, themes, voice)
- [x] Medicine search functionality
- [x] Medicine database integration
- [x] Prescription upload preparation
- [x] Reminder system framework
- [x] Chatbot interface
- [x] User profile management

### 🔄 In Progress
- [ ] Gemini AI integration for OCR
- [ ] Barcode scanning with camera
- [ ] Image recognition for pills
- [ ] SMS/Email reminders

### ⏳ Future
- [ ] Caretaker notifications
- [ ] Medical history dashboard
- [ ] Doctor consultation booking
- [ ] Pharmacy integration
- [ ] Wearable device sync

---

## Deployment Preparation

### Pre-Deployment Checklist
- [ ] Environment variables configured
- [ ] Database migrated and tested
- [ ] API endpoints verified
- [ ] Frontend build optimized
- [ ] HTTPS/SSL configured
- [ ] CORS settings correct
- [ ] Rate limiting configured
- [ ] Error logging enabled
- [ ] Performance optimized
- [ ] Security audit completed

### Production Settings
```
Frontend:
- Enable caching headers
- Compress assets (Gzip)
- Minify CSS/JS
- Optimize images
- Use CDN for static assets

Backend:
- Set debug=False
- Use production database
- Configure proper logging
- Enable HTTPS only
- Set secure CORS headers
- Rate limiting enabled
- Input validation strict
- Error messages generic
```

---

## Testing

### Run Tests
```bash
# Frontend tests
cd frontend
npm run test

# Backend tests
cd backend
pytest
```

### Manual Testing Scenarios

#### 1. Home Page
- [ ] Page loads without errors
- [ ] All animations smooth
- [ ] Responsive on mobile
- [ ] Accessibility features work
- [ ] Navigation links functional

#### 2. Medicine Search
- [ ] Can search by name
- [ ] Results display correctly
- [ ] Voice reading works
- [ ] Mobile responsive

#### 3. Prescription Upload
- [ ] Can select image
- [ ] Preview shows correctly
- [ ] Upload completes
- [ ] Results display

#### 4. Accessibility
- [ ] Text size changes work
- [ ] Themes toggle properly
- [ ] Voice assistance functions
- [ ] High contrast readable
- [ ] Keyboard navigation works

---

## Troubleshooting

### Frontend Issues

**NPM Peer Dependency Errors**
```bash
npm install --legacy-peer-deps
```

**Module Not Found**
```bash
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

**Port 5173 Already in Use**
```bash
# Windows
netstat -ano | findstr :5173
# Kill the process or use different port

# Mac/Linux
lsof -i :5173
kill -9 <PID>
```

### Backend Issues

**Database Connection Error**
- Verify DATABASE_URL in .env
- Check database is running
- Verify SSL mode settings

**Gemini API Key Invalid**
- Verify API key in .env
- Check quota limits
- Regenerate key if needed

**Port 8000 Already in Use**
```bash
# Windows
netstat -ano | findstr :8000

# Mac/Linux
lsof -i :8000
```

---

## Performance Optimization

### Frontend
```bash
# Analyze bundle size
npm run build
# Check dist/ folder sizes

# Lighthouse audit
npm run build
npm run preview
# Open in Chrome DevTools > Lighthouse
```

### Backend
```python
# Enable query caching
# Implement database indexing
# Use connection pooling
# Enable response compression
```

---

## Security Checklist

- [ ] HTTPS enforced in production
- [ ] CORS properly configured
- [ ] Authentication tokens valid
- [ ] Input validation strict
- [ ] SQL injection prevention
- [ ] XSS protection enabled
- [ ] CSRF tokens present
- [ ] Sensitive data encrypted
- [ ] API rate limiting active
- [ ] Error messages generic

---

## Monitoring & Logging

### Frontend Monitoring
- Error tracking with Sentry
- Performance monitoring with web-vitals
- User analytics tracking
- User session tracking

### Backend Logging
```python
# Enable comprehensive logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
```

---

## Maintenance

### Regular Tasks
- [ ] Update dependencies monthly
- [ ] Review error logs weekly
- [ ] Backup database daily
- [ ] Monitor performance metrics
- [ ] Update security patches
- [ ] Review API usage patterns
- [ ] Optimize slow queries
- [ ] Test disaster recovery

### Database Maintenance
```bash
# Backup
pg_dump database_url > backup.sql

# Restore
psql database_url < backup.sql

# Optimize
VACUUM ANALYZE;
```

---

## Support & Documentation

### Important Files
- `README.md` - Project overview
- `TESTING_CHECKLIST.md` - Testing procedures
- `UI_IMPROVEMENTS_SUMMARY.md` - UI enhancements
- `backend/schema.sql` - Database schema
- `backend/requirements.txt` - Python dependencies
- `frontend/package.json` - Node dependencies

### Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)
- [Gemini API Docs](https://ai.google.dev)

---

## Contact & Support

For issues or questions:
- Check the documentation files in the project
- Review error logs for specific issues
- Test in development environment first
- Document any custom changes

---

## Version History

### v1.0.0 (March 10, 2026)
- Initial release
- Core features implemented
- Accessibility support
- Responsive design
- UI/UX enhancements

---

## License & Credits

Scan4Elders - AI Medication Assistant for Seniors
Built for: SVERI Hackathon
Technology Stack: React + FastAPI + PostgreSQL

---

**Last Updated**: March 10, 2026
**Status**: Ready for Testing
**Next Review**: April 10, 2026
