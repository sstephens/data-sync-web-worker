#!/bin/sh

gulp build

git subtree push --prefix docs origin gh-pages
