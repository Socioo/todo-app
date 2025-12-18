@echo off
echo ========================================
echo To-Do App Setup Script for Windows
echo ========================================

echo.
echo Step 1: Installing backend dependencies...
cd backend
npm install
if errorlevel 1 goto error

echo.
echo Step 2: Setting up database...
npx prisma generate
npx prisma migrate dev --name init
if errorlevel 1 goto error

echo.
echo Step 3: Installing frontend dependencies...
cd ..\frontend
npm install
if errorlevel 1 goto error

echo.
echo ========================================
echo SETUP COMPLETE!
echo ========================================
echo.
echo Next steps:
echo 1. Update your Google OAuth credentials in backend/.env
echo 2. Make sure PostgreSQL is running
echo 3. Start backend: cd backend && npm run dev
echo 4. Start frontend: cd frontend && npm run dev
echo 5. Open http://localhost:5173 in your browser
echo.
pause
goto end

:error
echo.
echo ERROR: Setup failed. Check the error above.
pause
exit /b 1

:end