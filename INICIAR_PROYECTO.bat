@echo off
title Sistema Web Dr. Lisandro Marquez - Urologia (Vue 3 + Flask + PostgreSQL)
color 0b
chcp 65001 >nul
echo =================================================================
echo   INICIANDO SISTEMA WEB MEDICO - DR. LISANDRO MARQUEZ
echo   Arquitectura: Vue 3 + Vite + Tailwind + Flask + PostgreSQL
echo =================================================================
echo.
echo [1/3] Iniciando API Backend Flask (Puerto 5000)...
start "Backend Flask - Dr. Lisandro" /min cmd /c "cd /d C:\Users\reina\Desktop\Backend_Web && .\venv\Scripts\python.exe app.py"

echo [2/3] Iniciando Servidor Frontend Vue 3 + Vite (Puerto 3000)...
start "Frontend Vue 3 - Dr. Lisandro" /min cmd /c "cd /d C:\Users\reina\Oncodev && npm run dev"

echo [3/3] Abriendo aplicacion en su navegador predeterminado...
timeout /t 2 /nobreak >nul
start http://localhost:3000

echo.
echo =================================================================
echo   ¡SISTEMA VUE 3 + FLASK ACTIVO EXITOSAMENTE!
echo.
echo   - Web Oficial y Portal:  http://localhost:3000
echo   - Backend API REST:       http://localhost:5000
echo   - Base de Datos:          PostgreSQL (dr_lisandro_db)
echo   - Proyecto Vue 3:         C:\Users\reina\Oncodev
echo   - Credenciales Doctor:    Usuario: admin  ^|  Clave: admin123
echo =================================================================
echo.
echo Presione cualquier tecla para salir.
pause >nul
