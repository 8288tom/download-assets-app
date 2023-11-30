#!/bin/bash


mkdir -p /idomoo-grid/public_assets/1/assets/
mkdir -p /idomoo-grid/public_assets/1/assets/directory
mkdir -p /idomoo-grid/projects/1
touch /idomoo-grid/public_assets/1/assets/file.txt
touch /idomoo-grid/public_assets/1/assets/movie.mov
touch /idomoo-grid/public_assets/1/assets/music.mp3
touch /idomoo-grid/projects/1/thisisidm.idm


exec npm start
