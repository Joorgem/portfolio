// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

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
        // More granular chunking strategy - only for actually used dependencies
        manualChunks: {
          // Three.js and related 3D libraries - largest chunk
          'three-core': ['three'],
          'three-react': ['@react-three/fiber', '@react-three/drei'],
          
          // State management
          'state': ['zustand'],
          
          // Animation libraries - only if actually used
          'framer': ['framer-motion'],
          
          // UI and utility libraries - only existing ones
          'ui-vendor': ['clsx'],
          
          // i18n separately for better caching
          'i18n': ['react-i18next', 'i18next'],
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
    },
    
    // Increase chunk size warning limit for 3D applications
    chunkSizeWarningLimit: 1000,
    
    // Use default minification (esbuild) - faster and included
    minify: true,
    
    // Disable source maps for production (smaller files)
    sourcemap: false,
    
    // Reduce CSS output
    cssMinify: true,
  },
  
  // Enhanced performance optimizations
  optimizeDeps: {
    include: [
      'three',
      '@react-three/fiber',
      '@react-three/drei', 
      'zustand',
      'framer-motion',
      'react',
      'react-dom',
      'react-i18next'
    ],
    exclude: [
      // Exclude heavy development dependencies
      '@vitejs/plugin-react'
    ]
  },
  
  // Resolve optimizations
  resolve: {
    alias: {
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