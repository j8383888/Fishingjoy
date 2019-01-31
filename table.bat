@echo off
pushd %~dp0

set BRANCH=buyu

upa tools git@git.code4.in:grow/tools.git

upa ..\MahjongCommon git@git.code4.in:BaShi/MahjongCommon.git %BRANCH%

start python tools/table_game.py
ping 127.0.0.1 -n 5
python tools/fishpathoptimization.py

popd
if "%1"=="" pause

