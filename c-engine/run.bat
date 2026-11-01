
@echo off
cd /d "%~dp0"

echo Compiling C scheduler...

gcc main.c linkedlist.c scheduler.c -o scheduler.exe

if errorlevel 1 (
    echo Compilation failed.
    pause
    exit /b 1
)

echo Running scheduler...
scheduler.exe

if errorlevel 1 (
    pause
    exit /b 1
)

copy /Y output.json ..\frontend\output.json

echo.
echo Results copied to frontend.
pause
