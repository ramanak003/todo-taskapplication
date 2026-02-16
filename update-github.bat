@echo off
setlocal

echo ========================================
echo   QuickTask: Uploading to GitHub...
echo ========================================

:: Step 1: Add changes
echo Adding changes...
git add .
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to add changes.
    pause
    exit /b %ERRORLEVEL%
)

:: Step 2: Commit
echo Committing changes...
:: Get current date and time for the message
for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (set mydate=%%c-%%a-%%b)
for /f "tokens=1-2 delims=: " %%a in ('time /t') do (set mytime=%%a:%%b)

git commit -m "Update: %mydate% %mytime%"
if %ERRORLEVEL% NEQ 0 (
    echo [NOTE] Nothing new to commit.
)

:: Step 3: Push
echo.
echo Attempting to push to GitHub (branch: main)...
git push origin main

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Push failed! 
    echo.
    echo --------------------------------------------------
    echo POSSIBLE CAUSE: Credential Conflict or Permissions
    echo --------------------------------------------------
    echo if you see "403" or "Permission Denied", please try these CLI commands:
    echo 1. Run: git config --local credential.helper ""
    echo 2. Run this script again.
    echo.
    echo [MANUAL FIX]:
    echo 1. Open START MENU and type "Credential Manager"
    echo 2. Click "Windows Credentials"
    echo 3. Remove any entry for "git:https://github.com"
    echo.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo ========================================
echo   SUCCESS! Your project is updated.
echo ========================================
timeout /t 5
exit /b 0
