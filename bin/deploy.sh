#!/bin/sh

gulp build

cp index.html dist/

git subtree push --prefix dist origin gh-pages
