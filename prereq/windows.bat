@echo off

rem Define expected versions
set git_version=2.39.1
set nodejs_version=18.13.0
set npm_version=9.3.1
set conc_version=7.8.0
set nx_version=15.5.2

rem Check git version
for /f "tokens=3" %%i in ('git --version') do set git_installed_version=%%i
if "%git_installed_version%" NEQ "%git_version%" (
    echo Updating git to version %git_version%...
    choco install git
    echo Git version %git_version% installed.
) else (
    echo Git version %git_version% is installed.
)

echo .

rem Check node version
for /f "tokens=1" %%i in ('node -v') do set nodejs_installed_version=%%i
if "%nodejs_installed_version:~1%" NEQ "%nodejs_version%" (
    echo Updating Nodejs to version %nodejs_version%...
    choco install nodejs
    echo Nodejs version %nodejs_version% installed.
) else (
    echo Nodejs version %nodejs_version% is installed.
)

echo .

rem Check npm version
for /f "tokens=1" %%i in ('npm -v') do set npm_installed_version=%%i
if "%npm_installed_version%" NEQ "%npm_version%" (
    echo Updating npm to version %npm_version%...
    npm install -g npm@%npm_version%
    echo npm version %npm_version% installed.
) else (
    echo npm version %npm_version% is installed.
)

echo .

rem Check concurrently version
for /f "tokens=1" %%i in ('concurrently -v') do set conc_installed_version=%%i
if "%conc_installed_version%" NEQ "%conc_version%" (
    echo Updating concurrently to version %conc_version%...
    npm install -g concurrently@%conc_version%
    echo concurrently version %conc_version% installed.
) else (
    echo concurrently version %conc_version% is installed.
)

echo .

rem Check nx version
echo Updating nx to version %nx_version%...
npm install -g nx@%nx_version%
echo nx version %nx_version% installed.

echo
echo All prerequisites are up to date