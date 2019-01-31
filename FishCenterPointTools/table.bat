@echo off
pushd %~dp0

set BRANCH=buyu

set cmd=..\..\MahjongCommon\table\*.json
set cmdts=..\..\MahjongCommon\table\*.ts
set dst=resource\table
set dstts=src\Atable


upa ..\..\MahjongCommon git@git.code4.in:BaShi/MahjongCommon.git %BRANCH%

del /Q %dst%\*.*
del /Q %dstts%\*.*
xcopy "%cmd%" "%dst%" /e /i /h
xcopy "%cmdts%" "%dstts%" /e /i /h

popd
if "%1"=="" pause

