@echo off
pushd "%~dp0"

cd %~d0

set dst=release
set BRANCH=buyu

REM upa %dst% git@git.code4.in:BaShi/Game.release.git %BRANCH%

upa tools git@git.code4.in:grow/tools.git

REM start python tools/fishpathoptimization.py

python tools\publish_game.py -b %BRANCH% -lb master

popd

if "%1"=="" pause