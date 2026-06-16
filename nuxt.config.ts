/// <reference path="./types/nitro-robots.d.ts" />
import { join } from 'node:path';
import tailwindcss from '@tailwindcss/vite';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/main.css'],
  typescript: {
    typeCheck: true,
  },
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: [
        '@heroicons/vue/24/outline',
        '@heroicons/vue/24/solid',
        '@vueuse/core',
        '@vueuse/gesture',
        '@tanstack/vue-table',
        '@internationalized/date',
        'reka-ui',
        'tailwind-merge',
        'tailwind-variants',
        'tailwindcss',
        'vue',
        'vue-router',
        'zod',
        'dotenv',
        'drizzle-orm',
      ],
    },
  },

  app: {
    head: {
      htmlAttrs: { lang: 'de' },
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        {
          rel: 'preconnect',
          href: 'https://fonts.gstatic.com',
          crossorigin: '',
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400..700&family=IBM+Plex+Mono:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;1,100;1,200;1,300;1,400;1,500;1,600;1,700&display=swap',
        },
      ],
    },
  },

  modules: ['nuxt-auth-utils', '@nuxt/eslint', '@nuxtjs/robots', '@nuxtjs/sitemap'],

  site: {
    url: process.env.NUXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
    name: 'Hallöchen',
  },

  sitemap: {
    exclude: ['/internal/**', '/login', '/logout', '/setup'],
  },

  routeRules: {
    '/internal/**': { robots: false },
    '/login': { robots: false },
    '/logout': { robots: false },
    '/setup': { robots: false },
  },

  nitro: {
    storage: {
      files: {
        driver: 'fs',
        base: process.env.FILES_STORAGE_PATH ?? join(process.cwd(), 'files'),
      },
    },
    externals: {
      // Nitro's file tracer misses libvips .so files loaded via dlopen by sharp.
      traceInclude: ['node_modules/sharp/**', 'node_modules/@img/**'],
    },
  },

  runtimeConfig: {
    smtpHost: process.env.SMTP_HOST ?? '',
    smtpPort: Number(process.env.SMTP_PORT ?? 587),
    smtpUser: process.env.SMTP_USER ?? '',
    smtpPass: process.env.SMTP_PASS ?? '',
    mailFrom: process.env.MAIL_FROM ?? 'info@halloechen.org',
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
    },
  },
});