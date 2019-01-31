#!/bin/bash

path=`pwd`

if [ ! -d "tools" ]; then
    git clone git@git.code4.in:grow/tools.git
fi
cd tools

git pull

cd ../..

if [ ! -d "MahjongCommon" ]; then
    git clone git@git.code4.in:BaShi/MahjongCommon.git
fi

cd MahjongCommon

git pull

git checkout bairenniuniu

cd ..

cd $path

python tools/table_game.py