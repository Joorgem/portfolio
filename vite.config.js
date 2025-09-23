// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [
    react(), 
    tailwindcss()
  ],
  
  server: {
    host: '0.0.0.0', // Permite que a aplicação seja acessada por outros dispositivos na rede
    port: 5173,     // Opcional, mas garante que a porta seja 5173
    hmr: {
      overlay: false // Reduces development noise
    }
  },
  
  build: {
    // Target modern browsers for smaller bundles
    target: 'es2020',
    
    // Enable CSS code splitting
    cssCodeSplit: true,
    
    // Bundle optimization
    rollupOptions: {
      output: {
        // PRODUCTION FIX: Less aggressive chunking to prevent race conditions
        manualChunks: (id) => {
          // Critical dependencies stay in main chunk to prevent loading delays
          // ZUSTAND removed from separate chunk - keep in main for critical state management

          // Three.js core - only split truly large dependencies
          if (id.includes('three') && !id.includes('@react-three')) {
            return 'three-core';
          }

          // Keep React Three ecosystem together for better loading
          if (id.includes('@react-three/fiber') || id.includes('@react-three/drei')) {
            return 'three-react';
          }

          // Large animation library can be separate
          if (id.includes('framer-motion')) {
            return 'framer';
          }

          // i18n can be separate as it's not critical for initial load
          if (id.includes('react-i18next') || id.includes('i18next')) {
            return 'i18n';
          }

          // Only split truly large vendor libraries
          if (id.includes('node_modules')) {
            // Keep critical libs in main chunk
            if (id.includes('zustand') || id.includes('clsx') || id.includes('react-responsive')) {
              return undefined; // Stay in main chunk
            }
            return 'vendor';
          }
        },
        
        // Optimize chunk names for better caching
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/i.test(assetInfo.name)) {
            return `media/[name]-[hash].${ext}`;
          }
          if (/\.(png|jpe?g|gif|svg|webp|ico)(\?.*)?$/i.test(assetInfo.name)) {
            return `img/[name]-[hash].${ext}`;
          }
          if (ext === 'css') {
            return `css/[name]-[hash].${ext}`;
          }
          return `assets/[name]-[hash].${ext}`;
        }
      },
      
      // External dependencies for CDN loading (optional)
      external: [],

      // Tree shaking seguro - preserva i18n e dependências críticas
      treeshake: {
        preset: 'recommended', // Mudado de 'smallest' para 'recommended'
        moduleSideEffects: (id) => {
          // Preserva side effects para i18n e stores
          return id.includes('i18n') || id.includes('store') || id.includes('zustand');
        },
        propertyReadSideEffects: true, // Mudado para true para preservar getters
        tryCatchDeoptimization: true   // Mudado para true para preservar error handling
      }
    },
    
    // PRODUCTION FIX: Increased chunk size limit to accommodate critical dependencies in main chunk
    chunkSizeWarningLimit: 1500, // Increased from 1000 to allow critical libs in main
    
    // Use default minification (esbuild) - faster and included
    minify: true,
    
    // Disable source maps for production (smaller files)
    sourcemap: false,
    
    // Reduce CSS output
    cssMinify: true,
  },
  
  // PRODUCTION FIX: Enhanced optimizations with critical dependencies pre-bundled
  optimizeDeps: {
    include: [
      'three',
      '@react-three/fiber',
      '@react-three/drei',
      'zustand', // Critical for state management - pre-bundle to prevent delays
      'zustand/middleware', // Include middleware for subscribeWithSelector
      'framer-motion',
      'react',
      'react-dom',
      'react-i18next',
      'i18next',
      'i18next-browser-languagedetector',
      'clsx', // Critical utility - pre-bundle
      'react-responsive' // Critical for mobile detection - pre-bundle
    ],
    exclude: [
      // Exclude heavy development dependencies
      '@vitejs/plugin-react'
    ],
    // Force refresh of deps to ensure consistency across environments
    force: process.env.NODE_ENV === 'production'
  },
  
  // Resolve optimizations
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // Optimize Three.js imports
      'three/examples/jsm': 'three/examples/jsm',
    }
  },
  
  // Experimental features for better performance
  experimental: {
    renderBuiltUrl(filename, { hostType }) {
      if (hostType === 'js') {
        // Optimize asset loading for JS files
        return { js: `"${filename}"` };
      }
      return filename;
    }
  },
  
  // Define environment variables
  define: {
    // Remove development-only code
    __DEV__: process.env.NODE_ENV === 'development',
    __PROD__: process.env.NODE_ENV === 'production'
  }
});