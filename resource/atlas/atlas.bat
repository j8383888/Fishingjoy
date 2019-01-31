@echo off
pushd "%~dp0"

del /Q .\*.png
del /Q .\*.json

call ImageStudio
call ImagePack egret .\* -margin:1

popd
if "%1"=="" pause
