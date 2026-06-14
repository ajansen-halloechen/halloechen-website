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
      title: 'Hallöchen - genossenschaftliche Kneipe in Berlin-Moabit',
      meta: [
        {
          name: 'description',
          content:
            'Hallöchen ist eine genossenschaftlich geführte Kneipe in Berlin-Moabit: Vong Kiez, für Kiez. Bezahlbare Getränke, Konzerte, Veranstaltungen und gemütliches Beisammensein.',
        },
        { name: 'robots', content: 'index, follow' },
        {
          name: 'keywords',
          content:
            'Hallöchen, Kneipe Berlin-Moabit, Bar Berlin-Moabit, genossenschaftliche Kneipe, Trinkgenossenschaft, Kiezkneipe',
        },
        {
          property: 'og:title',
          content: 'Hallöchen – genossenschaftliche Kneipe in Berlin-Moabit',
        },
        { property: 'og:url', content: 'https://halloechen.org/' },
        {
          property: 'og:image',
          content: 'https://halloechen.org/og-image.jpg',
        },
        {
          property: 'og:description',
          content:
            'Deine genossenschaftlich geführte Kiezkneipe in Berlin-Moabit – Getränke, Konzerte, Veranstaltungen und Gemeinschaft.',
        },
        { property: 'og:type', content: 'website' },
        { property: 'og:locale', content: 'de_DE' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'canonical', href: 'https://halloechen.org/' },
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
      script: [
        {
          type: 'application/ld+json',
          innerHTML: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BarOrPub',
            name: 'Hallöchen',
            url: 'https://halloechen.org/',
            image: 'https://halloechen.org/og-image.jpg',
            description:
              'Hallöchen ist eine genossenschaftlich geführte Kneipe in Berlin-Moabit: Vong Kiez, für Kiez. Bezahlbare Getränke, Konzerte, Veranstaltungen und gemütliches Beisammensein.',
            email: 'info@halloechen.org',
            address: {
              '@type': 'PostalAddress',
              streetAddress: 'Waldstraße 44a',
              postalCode: '10551',
              addressLocality: 'Berlin',
              addressRegion: 'BE',
              addressCountry: 'DE',
            },
            geo: {
              '@type': 'GeoCoordinates',
              latitude: 52.53025886201924,
              longitude: 13.330796153087,
            },
            sameAs: ['https://www.instagram.com/halloechen_moabit/'],
            priceRange: '€',
            openingHoursSpecification: [
              {
                '@type': 'OpeningHoursSpecification',
                dayOfWeek: 'Thursday',
                opens: '18:00',
                closes: '01:00',
              },
              {
                '@type': 'OpeningHoursSpecification',
                dayOfWeek: 'Friday',
                opens: '18:00',
                closes: '04:00',
              },
              {
                '@type': 'OpeningHoursSpecification',
                dayOfWeek: 'Saturday',
                opens: '18:00',
                closes: '04:00',
              },
            ],
          }),
        },
      ],
    },
  },

  modules: ['nuxt-auth-utils', '@nuxt/eslint'],

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
