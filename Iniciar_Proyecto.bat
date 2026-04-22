@echo off
echo ==========================================
echo INICIANDO PROYECTO (POS PAPELERIA)
echo ==========================================

echo [1/2] Instalando dependencias del Backend...
cd backend
call npm install
call npx prisma generate
call npx prisma db push
call npm run seed
cd ..

echo [2/2] Instalando dependencias del Frontend...
cd frontend
call npm install
cd ..

echo ==========================================
echo INICIANDO SERVIDORES...
echo ==========================================
echo El sistema esta iniciando en esta misma ventana!
echo Backend estara en: http://localhost:3001
echo Frontend estara en: http://localhost:5173
echo.
echo Presiona Ctrl+C para detener ambos servidores.
echo ==========================================

start /B cmd /c "cd backend && npm run dev"
start /B cmd /c "cd frontend && npm run dev"

:: Mantiene la ventana principal abierta y en espera indefinidamente
:loop
timeout /t 3600 /nobreak >nul
goto loop
