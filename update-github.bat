@echo off
echo ========================================
echo   QuickTask: Uploading to GitHub...
echo ========================================

:: Step 1: Add changes
git add .
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to add changes.
    pause
    exit /b %ERRORLEVEL%
)

:: Step 2: Commit
set message="Update: %date% %time%"
git commit -m %message%
if %ERRORLEVEL% NEQ 0 (
    echo [NOTE] Nothing new to commit or commit failed.
)

:: Step 3: Push
echo.
echo Attempting to push to GitHub...
git push origin main
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Push failed! 
    echo.
    echo If you see "Permission to ... denied (403)", please:
    echo 1. Open START MENU and type "Credential Manager"
    echo 2. Go to "Windows Credentials"
    echo 3. REMOVE the entry for "git:https://github.com"
    echo 4. Run this script again!
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo ========================================
echo   SUCCESS! Your project is updated.
echo ========================================
pause
