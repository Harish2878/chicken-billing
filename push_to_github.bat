@echo off
echo ========================================================
echo  Sri Kanaka Durga Chicken Billing - Push to GitHub
echo ========================================================
echo.
set /p REPO_URL="Paste your GitHub Repository URL (e.g. https://github.com/Harish2878/chicken-billing.git): "
echo.
echo Connecting to GitHub...
git remote remove origin 2>nul
git remote add origin %REPO_URL%
git branch -M main
echo.
echo Uploading files to GitHub...
git push -u origin main
echo.
echo ========================================================
echo  SUCCESS! Your project has been uploaded to GitHub!
echo ========================================================
pause
