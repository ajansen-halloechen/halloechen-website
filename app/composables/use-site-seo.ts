export function useSiteSeo() {
  const site = useSiteConfig();
  const route = useRoute();

  const siteUrl = computed(() => site.url.replace(/\/$/, ''));
  const pageUrl = computed(() => `${siteUrl.value}${route.path}`);
  const ogImage = computed(() => `${siteUrl.value}/og-image.jpg`);

  useSeoMeta({
    title: 'Hallöchen - genossenschaftliche Kneipe in Berlin-Moabit',
    description:
      'Hallöchen ist eine genossenschaftlich geführte Kneipe in Berlin-Moabit: Vong Kiez, für Kiez. Bezahlbare Getränke, Konzerte, Veranstaltungen und gemütliches Beisammensein.',
    keywords:
      'Hallöchen, Kneipe Berlin-Moabit, Bar Berlin-Moabit, genossenschaftliche Kneipe, Trinkgenossenschaft, Kiezkneipe',
    ogTitle: 'Hallöchen – genossenschaftliche Kneipe in Berlin-Moabit',
    ogDescription:
      'Deine genossenschaftlich geführte Kiezkneipe in Berlin-Moabit – Getränke, Konzerte, Veranstaltungen und Gemeinschaft.',
    ogUrl: pageUrl,
    ogImage: ogImage,
    ogType: 'website',
    ogLocale: 'de_DE',
  });

  useHead({
    link: [{ rel: 'canonical', href: pageUrl }],
    script: [
      {
        type: 'application/ld+json',
        innerHTML: computed(() =>
          JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BarOrPub',
            name: 'Hallöchen',
            url: pageUrl.value,
            image: ogImage.value,
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
        ),
      },
    ],
  });
}
