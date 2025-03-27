import svelte from '@rollup/plugin-svelte';
import { babel } from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import livereload from 'rollup-plugin-livereload';
import { terser } from 'rollup-plugin-terser';
import nodePolyfills from 'rollup-plugin-node-polyfills';

const production = !process.env.ROLLUP_WATCH;

function serve() {
    let server;

    function toExit() {
        if (server) server.kill(0);
    }

    return {
        writeBundle() {
            if (server) return;
            server = require('child_process').spawn('npm', ['run', 'start', '--', '--dev'], {
                stdio: ['ignore', 'inherit', 'inherit'],
                shell: true
            });

            process.on('SIGTERM', toExit);
            process.on('exit', toExit);
        }
    };
}

export default {
    input: 'src/index.js',
    output: {
        sourcemap: true,
        format: 'iife',
        name: 'app',
        file: 'public/build/bundle.js'
    },
    plugins: [
        svelte({
            compilerOptions: {
                dev: !production
            },
            emitCss: false
        }),
        resolve({
            browser: true,
            dedupe: ['svelte'],
            exportConditions: ['svelte']
        }),
        commonjs(),
        nodePolyfills(),
        babel({
            babelHelpers: 'bundled',
            exclude: [/\/core-js\//],
            extensions: ['.js', '.jsx', '.es6', '.es', '.mjs', '.svelte'],
            presets: ['@babel/preset-env']
        }),
        !production && serve(),
        !production && livereload('public'),
        production && terser()
    ],
    watch: {
        clearScreen: false
    }
};
