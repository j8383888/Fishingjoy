@echo off
pushd "%~dp0"

cd %~d0

if [ ! -d "release" ]; then
    git clone git@git.code4.in:BaShi/Game.release.git
    mv Game.release release
fi
cd release

git pull

git checkout buyu

cd ..

python tools/publish_game.py -b buyu
