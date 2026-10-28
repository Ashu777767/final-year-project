@echo off
REM Run FastAPI, Spring Boot, and React dev server in separate windows

REM FastAPI (ml-service)
start "FastAPI" cmd /k "cd /d d:\\Projects\\co2-digital-twin\\ml-service && uvicorn main:app --reload"

REM Spring Boot backend
start "SpringBoot" cmd /k "cd /d d:\\Projects\\co2-digital-twin\\backend && .\\mvnw.cmd spring-boot:run"

REM React/Vite frontend
start "ReactDev" cmd /k "cd /d d:\\Projects\\co2-digital-twin\\frontend && npm run dev"
