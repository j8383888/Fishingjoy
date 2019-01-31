#!/bin/bash

if [ ! -d "tools" ]; then
    git clone git@git.code4.in:grow/tools.git
fi
cd tools

git pull

cd ..

python tools/update_game.py