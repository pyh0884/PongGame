@echo off
REM Simple wrapper for PowerShell build script
powershell -ExecutionPolicy Bypass -File "%~dp0build.ps1" %*
exit /b %ERRORLEVEL% 