@echo off
pushd "%~dp0"

set dst=..\release

if exist Scripts\NUL (
	xcopy Scripts bin-release\web\dev\Scripts\ /E /D
)

if exist error.txt  del error.txt /f /q

echo ----------------------------
echo egret build -e
call egret build -e

echo ----------------------------
echo egret publish --version dev
call egret publish --version dev

set BRANCH=fishteam
upa %dst% git@git.code4.in:BaShi/Game.release.git %BRANCH%

rmdir /S /Q %dst%\libs
rmdir /S /Q %dst%\resource
del /Q %dst%\*.*
md %dst%\
md %dst%\resource\
xcopy bin-release\web\dev\* %dst% /S

popd

if "%1"=="" pause