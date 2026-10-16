import { HomePageClient } from "@/components/marketing/HomePageClient";
import { JsonLd } from "@/components/seo/JsonLd";
import { organizationJsonLd, pageMetadata, websiteJsonLd } from "@/lib/seo";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE } from "@/lib/site";

export const metadata = pageMetadata({
  title: `${SITE_NAME} — ${SITE_TAGLINE}`,
  description: SITE_DESCRIPTION,
  path: "/",
});

export default function HomePage() {
  return (
    <>
      <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />
      <HomePageClient />
    </>
  );
}
