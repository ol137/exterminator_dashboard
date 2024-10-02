@ECHO OFF
echo Exterminator Manager Panel by Oliver Lee-McKinney
goto check_Permissions

:check_Permissions
    net session >nul 2>&1
    if %errorLevel% == 0 (
        goto main
    ) else (
	echo Please run the batch file as administrator! It's a requirement for the MySQL server!
        goto no_Perms
    )

:main
cd /d "%~dp0"
echo Starting ReactJS server...
cd exterminator_frontend
start /b npm run dev
echo Starting SQL database...
cd ..
cd exterminator_database
start /b .\mysql-5.7.17-winx64\bin\mysqld.exe --defaults-file=".\\mysql-5.7.17-winx64\\config.ini" --explicit_defaults_for_timestamp --console
echo Starting Express Server...
cd ..
cd exterminator_backend
start /b npm run build
timeout /t 3
start /b npm run start
cls
echo Server started! Make sure to close this window to shut down the server once you're done.

:no_Perms
pause >nul