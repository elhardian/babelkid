import type { Metadata } from "next";
import {
  SCHOOL_ADDRESS,
  SCHOOL_CONTACT,
  SCHOOL_GEO,
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  SITE_NAME,
  SITE_TAGLINE,
  SITE_URL,
} from "@/lib/site";

type PageSeoInput = {
  title: string;
  description: string;
  path?: string;
  keywords?: string[];
  image?: string;
  noIndex?: boolean;
};

export function absoluteUrl(path = "/") {
  if (path.startsWith("http")) return path;
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${p}`;
}

export function pageMetadata({
  title,
  description,
  path = "/",
  keywords = [...SITE_KEYWORDS],
  image = "/hero-illustration.png",
  noIndex = false,
}: PageSeoInput): Metadata {
  const url = absoluteUrl(path);
  const ogImage = absoluteUrl(image);
  const fullTitle = title.includes(SITE_NAME)
    ? title
    : `${title} | ${SITE_NAME}`;

  return {
    // absolute avoids double suffix from root title.template
    title: { absolute: fullTitle },
    description,
    keywords,
    alternates: { canonical: url },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      type: "website",
      locale: "id_ID",
      url,
      siteName: SITE_NAME,
      title: fullTitle,
      description,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${SITE_NAME} — ${SITE_TAGLINE}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [ogImage],
    },
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": ["EducationalOrganization", "LocalBusiness", "Preschool"],
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    alternateName: ["Babel Kids", "TK BabelKids Pangkalpinang"],
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    logo: absoluteUrl("/logo.png"),
    image: absoluteUrl("/hero-illustration.png"),
    telephone: SCHOOL_CONTACT.phoneE164,
    email: SCHOOL_CONTACT.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: SCHOOL_ADDRESS.street,
      addressLocality: SCHOOL_ADDRESS.city,
      addressRegion: SCHOOL_ADDRESS.region,
      postalCode: SCHOOL_ADDRESS.postalCode,
      addressCountry: SCHOOL_ADDRESS.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: SCHOOL_GEO.lat,
      longitude: SCHOOL_GEO.lng,
    },
    areaServed: {
      "@type": "City",
      name: "Pangkalpinang",
    },
    sameAs: [
      MAPS_SAME_AS,
      `https://www.instagram.com/${SCHOOL_CONTACT.instagram}/`,
    ],
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
        ],
        opens: "07:30",
        closes: "12:00",
      },
    ],
    priceRange: "$$",
  };
}

const MAPS_SAME_AS =
  "https://www.google.com/maps/place/Babel+Kids/@-2.1252929,106.1078513,17z";

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    publisher: { "@id": `${SITE_URL}/#organization` },
    inLanguage: "id-ID",
  };
}

export function breadcrumbJsonLd(
  items: { name: string; path: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function faqJsonLd(
  faqs: { question: string; answer: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer,
      },
    })),
  };
}
