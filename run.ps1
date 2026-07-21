# run.ps1 — Start the FitSync project (Django backend + React frontend)
# Usage:  .\run.ps1
$ErrorActionPreference = "Stop"
$root = $PSScriptRoot

Write-Host "Starting FitSync..." -ForegroundColor Cyan

# Backend — Django REST API on http://127.0.0.1:8000
Start-Process powershell -ArgumentList @(
  "-NoExit", "-Command",
  "cd '$root\backend\gym_backend'; & '$root\backend\.venv\Scripts\python.exe' manage.py runserver 127.0.0.1:8000"
)

# Frontend — Vite/React dev server on http://localhost:8080
Start-Process powershell -ArgumentList @(
  "-NoExit", "-Command",
  "cd '$root\frontend'; npm run dev"
)

Write-Host ""
Write-Host "FitSync is starting in two new windows:" -ForegroundColor Green
Write-Host "  Backend : http://127.0.0.1:8000"
Write-Host "  Frontend: http://localhost:8080"
Write-Host "  Login   : user / admin123"
Write-Host ""
Write-Host "Close either window (or press Ctrl+C in it) to stop that server."
