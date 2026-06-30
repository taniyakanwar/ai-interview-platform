/// <reference types="vite/client" />

// This tells TypeScript that CSS files are valid imports
// Without this, TypeScript complains about import './index.css'
declare module '*.css' {
  const content: string
  export default content
}