import resolve from '@rollup/plugin-node-resolve';          // 使用node_modules包
import terser from '@rollup/plugin-terser';                 // 代码压缩
import babel from '@rollup/plugin-babel';                   // ECMAScript兼容
import {importAssertionsPlugin} from 'rollup-plugin-import-assert';
import fetchRemoteFile from './fetch-remote-file.mjs';       // 将远程文件转换为本地
import pkg from './package.json' with { type:'json' };      // 获取package信息

// 版权信息
const repository = pkg.repository.url.replace(/(.+)(:\/\/.+)\.git$/,'https$2');
const now = new Date();
const date = (new Date(now.getTime()-now.getTimezoneOffset()*60000)).toISOString().substring(0,10);
const banner = `/*!
 * ${pkg.name} v${pkg.version}
 * ${pkg.description}
 * ${pkg.homepage}
 *
 * Copyright (c) 2025-present, ${pkg.author}
 *
 * Released under the ${pkg.license} License
 * ${repository}
 *
 * Created on: ${date}
 */`;

// 将远程文件转换成本地模块引用
const remoteUrl = 'https://passer-by.com/data_location/list.json';
const localPath = 'src/module/data/cn.js';

const commonPlugins = [
    resolve(),
    importAssertionsPlugin(),
    terser(),
    babel({
        babelHelpers: 'runtime',
        exclude:'node_modules/**'
    }),
    fetchRemoteFile(remoteUrl, localPath)
];


export default [{
    input: './src/widget-region.js',
    output:[{
        file: pkg.main,
        format: 'umd',
        name: 'widget-region',
        banner
    }],
    plugins: commonPlugins,
    watch: {
        exclude: ['node_modules/**', '**/data/**']
    }
}];
