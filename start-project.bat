@echo off
echo Starting EDU-HUB Project...

:: Start Server
echo Starting Server...
start "EDU-HUB Server" cmd /k "cd server && npm install && npm run dev"

:: Start Client
echo Starting Client...
start "EDU-HUB Client" cmd /k "cd client && npm install && npm run dev"

echo.
echo ===================================================
echo Project is running!
echo Server: http://localhost:5000
echo Client: http://localhost:5173 (usually)
echo ===================================================
echo.
pause
