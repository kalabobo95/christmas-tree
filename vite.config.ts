import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      base: './', // 使用相对路径，适配移动端
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        outDir: 'dist',
        assetsDir: 'assets',
        // 移动端优化
        minify: 'terser',
        terserOptions: {
          compress: {
            drop_console: true, // 生产环境移除 console
          }
        },
        rollupOptions: {
          output: {
            manualChunks: {
              'three': ['three'],
              'react-vendor': ['react', 'react-dom'],
              'three-fiber': ['@react-three/fiber', '@react-three/drei', '@react-three/postprocessing']
            }
          }
        }
      }
    };
});
