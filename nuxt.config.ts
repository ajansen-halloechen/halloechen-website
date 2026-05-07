import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  css: ["~/assets/main.css"],

  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: [
        "@heroicons/vue/24/outline",
        "@heroicons/vue/24/solid",
        "@vueuse/core",
        "@vueuse/gesture",
      ],
    },
  },

  app: {
    head: {
      htmlAttrs: { lang: "de" },
      title: "Hallöchen - genossenschaftliche Kneipe in Berlin-Moabit",
      meta: [
        {
          name: "description",
          content:
            "Hallöchen ist eine genossenschaftlich geführte Kneipe in Berlin-Moabit: Vong Kiez, für Kiez. Bezahlbare Getränke, Konzerte, Veranstaltungen und gemütliches Beisammensein.",
        },
        { name: "robots", content: "index, follow" },
        {
          name: "keywords",
          content:
            "Hallöchen, Kneipe Berlin-Moabit, Bar Berlin-Moabit, genossenschaftliche Kneipe, Trinkgenossenschaft, Kiezkneipe",
        },
        {
          property: "og:title",
          content: "Hallöchen – genossenschaftliche Kneipe in Berlin-Moabit",
        },
        { property: "og:url", content: "https://halloechen.org/" },
        {
          property: "og:image",
          content: "https://halloechen.org/og-image.jpg",
        },
        {
          property: "og:description",
          content:
            "Deine genossenschaftlich geführte Kiezkneipe in Berlin-Moabit – Getränke, Konzerte, Veranstaltungen und Gemeinschaft.",
        },
        { property: "og:type", content: "website" },
        { property: "og:locale", content: "de_DE" },
      ],
      link: [
        { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
        { rel: "canonical", href: "https://halloechen.org/" },
      ],
      script: [
        {
          type: "application/ld+json",
          innerHTML: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BarOrPub",
            name: "Hallöchen",
            url: "https://halloechen.org/",
            image: "https://halloechen.org/og-image.jpg",
            description:
              "Hallöchen ist eine genossenschaftlich geführte Kneipe in Berlin-Moabit: Vong Kiez, für Kiez. Bezahlbare Getränke, Konzerte, Veranstaltungen und gemütliches Beisammensein.",
            email: "info@halloechen.org",
            address: {
              "@type": "PostalAddress",
              streetAddress: "Waldstraße 44a",
              postalCode: "10551",
              addressLocality: "Berlin",
              addressRegion: "BE",
              addressCountry: "DE",
            },
            geo: {
              "@type": "GeoCoordinates",
              latitude: 52.53025886201924,
              longitude: 13.330796153087,
            },
            sameAs: ["https://www.instagram.com/halloechen_moabit/"],
            priceRange: "€",
            openingHoursSpecification: [
              {
                "@type": "OpeningHoursSpecification",
                dayOfWeek: "Thursday",
                opens: "18:00",
                closes: "01:00",
              },
              {
                "@type": "OpeningHoursSpecification",
                dayOfWeek: "Friday",
                opens: "18:00",
                closes: "04:00",
              },
              {
                "@type": "OpeningHoursSpecification",
                dayOfWeek: "Saturday",
                opens: "18:00",
                closes: "04:00",
              },
            ],
          }),
        },
      ],
    },
  },
});
