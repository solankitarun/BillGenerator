@echo off
title Bill Generator Server
cd /d "%~dp0"
echo ===================================================
echo     STARTING LAUNDRY BILL GENERATOR SERVER
echo ===================================================
echo.
echo Mode: PRODUCTION
echo Port: 5000
echo.
echo Initializing...
npm start
echo.
echo Server stopped.
pause
