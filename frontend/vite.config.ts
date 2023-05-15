/* eslint-disable @typescript-eslint/no-explicit-any */
/// <reference types="vitest" />
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import viteTsConfigPaths from 'vite-tsconfig-paths';

export default defineConfig(({ mode }): any => {
    process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };

    return {
        server: {
            host: process.env.VITE_HOST || 'localhost',
            port: process.env.VITE_PORT || 8000,
            strictPort: true,
            https: process.env.VITE_USE_HTTPS === 'true',
        },
        plugins: [
            react(),
            viteTsConfigPaths({
                root: './',
            }),
        ],
        test: {
            globals: true,
            cache: {
                dir: './node_modules/.vitest',
            },
            environment: 'jsdom',
            include: ['src/**/*.{test,spec}.{js,jsx,ts,tsx}'],
        },
        // worker: {
        //  plugins: [
        //    viteTsConfigPaths({
        //      root: './',
        //    }),
        //  ],
        // },
    };
});
