import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import mdx from '@mdx-js/rollup'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import remarkFrontmatter from 'remark-frontmatter'
import remarkMdxFrontmatter from 'remark-mdx-frontmatter'

// https://vite.dev/config/
export default defineConfig({
  base: '/NeuralMastery-vite/',
  plugins: [
    // MDX must run before the React plugin's JSX transform sees .mdx files
    mdx({
      remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter, remarkMath],
      rehypePlugins: [rehypeKatex],
      providerImportSource: '@mdx-js/react',
    }),
    // Default include (.jsx/.tsx only) -- must NOT also match .mdx, since
    // mdx()'s transform (above) has to run on the raw MDX source first and
    // hand off compiled JSX; pointing react()'s babel step at the raw .mdx
    // text directly (its frontmatter block especially) fails to parse.
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@site': __dirname,
    },
  },
})
