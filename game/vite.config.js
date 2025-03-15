import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import path from "path"
import { copyFileSync, mkdirSync, existsSync, readdirSync, statSync } from 'fs'

// Simple function to recursively copy a directory
function copyDir(src, dest) {
  if (!existsSync(dest)) {
    mkdirSync(dest, { recursive: true });
  }
  
  const entries = readdirSync(src, { withFileTypes: true });
  
  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      copyFileSync(srcPath, destPath);
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-assets',
      closeBundle() {
        // No need to copy assets separately since we'll use Vite's built-in public directory handling
        console.log('Build complete. Assets from public directory will be included automatically.');
      }
    }
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "../webroot",
    emptyOutDir: true,
  },
  publicDir: 'public', // This tells Vite to copy everything from the public directory to the root of the build output
})

