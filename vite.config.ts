import inertia from '@inertiajs/vite';
import { wayfinder } from '@laravel/vite-plugin-wayfinder';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { bunny } from 'laravel-vite-plugin/fonts';
import { defineConfig } from 'vite';
import path from 'path'

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            refresh: true,
            fonts: [
                bunny('Instrument Sans', {
                    weights: [400, 500, 600],
                }),
            ],
        }),
        inertia(),
        react({
            babel: {
                plugins: ['babel-plugin-react-compiler'],
            },
        }),
        tailwindcss(),
        wayfinder({
            formVariants: true,
        }),
        
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './resources/js'),
            '@config': path.resolve(__dirname, './resources/js/config'),
        },
    },
    server: {
        host: '172.16.8.66', 
        // host: true, 
        port: 8994,
        strictPort: true,
        cors: true,
        hmr: {
            host: '172.16.8.66',
        },
    },

});
