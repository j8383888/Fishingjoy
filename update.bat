@echo off
pushd "%~dp0"

cd %~d0

upa tools git@git.code4.in:grow/tools.git
python tools/update_game.py

popd

if "%1"=="" pause