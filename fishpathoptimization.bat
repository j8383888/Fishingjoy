@echo off
pushd %~dp0

python tools/fishpathoptimization.py

popd
if "%1"=="" pause