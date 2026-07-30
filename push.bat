@echo off
title newrwn GitHub Push Helper
echo ====================================================
echo  newrwn - Git Sync Utility
echo ====================================================
echo.

:: Stage all current changes
echo [1/3] Staging changes...
git add .
echo Changes staged successfully.
echo.

:: Prompt user for commit description message
set /p msg="[2/3] Enter commit message (or press ENTER for default): "
if "%msg%"=="" (
    set msg="Regular update to newrwn study engine"
)
echo.

:: Commit staged changes
echo Committing changes...
git commit -m %msg%
echo.

:: Push to remote main branch
echo [3/3] Pushing commits to GitHub...
git push origin main
echo.

echo ====================================================
echo  Operation completed successfully!
echo ====================================================
echo.
pause
