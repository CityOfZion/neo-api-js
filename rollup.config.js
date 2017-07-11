import eslint from 'rollup-plugin-eslint';
import resolve from "rollup-plugin-node-resolve";
import commonjs from 'rollup-plugin-commonjs';

export default {
    entry: 'index.js',
    format: 'umd',
    dest: 'build/neo.js',
    //sourceMap: 'inline',
    moduleName: 'neo',
    plugins: [
        eslint({
            exclude: [
                'src/styles/**'
            ],
            fix: false
        }),
        resolve({
            jsnext: true,
            main: true,
            module: true,
            browser: true
        }),
        commonjs()
    ]
}