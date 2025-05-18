@echo off
echo ====================================================
echo Habit Tracker - Installation and Setup
echo ====================================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Node.js is not installed on your system.
    echo.
    echo Please install Node.js from: https://nodejs.org/en/download/
    echo.
    echo After installing Node.js, run this setup script again.
    echo.
    pause
    exit /b 1
)

REM Show Node.js version
echo Node.js is installed: 
node --version
echo.

REM Show npm version
echo npm is installed:
npm --version
echo.

echo Installing dependencies...
cd %~dp0
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Error installing dependencies. Please try again.
    pause
    exit /b 1
)
echo.
echo Dependencies installed successfully.
echo.

echo ====================================================
echo Setup complete! To start the application, run:
echo npm start
echo.
echo Or just type 'y' now to start the application
echo ====================================================
echo.

set /p START=Would you like to start the application now? (y/n): 
if /i "%START%"=="y" (
    echo Starting Habit Tracker...
    call npm start
)

exit /b 0 