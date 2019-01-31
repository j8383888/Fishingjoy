@echo off
pushd "%~dp0"

upa tools git@git.code4.in:grow/tools.git
python tools\resource.py -op 1


popd
if "%1"=="" pause
