#!/bin/bash


basePath=$(cd `dirname $0`; pwd)

cd ${basePath}/../
rm -r dist

node ${basePath}/build.js --prepublish

# npm run prepublish
# ./node_modules/.bin/webpack
# ./node_modules/.bin/webpack -p
# ./node_modules/.bin/webpack --config extension/webpack.config.js
# ./node_modules/.bin/webpack --config extension/webpack.config.js -p

node ${basePath}/build.js -i ${basePath}/../echarts.all.js -o ${basePath}/../dist/echarts.min.js --lang en

rm -rf ${basePath}/../../echartTest/WebContent/dist/*.js
cp -R ${basePath}/../dist/*.js ${basePath}/../../echartTest/WebContent/dist/
