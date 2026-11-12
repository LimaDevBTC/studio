import type { Metadata } from "next";
import { MqmHome } from "@/components/marketing/MqmHome";

const TITLE = "MQM Crypto | Educação sobre Bitcoin, autocustódia e comunidade";
const DESCRIPTION =
  "Educação sobre Bitcoin, cripto e autocustódia com Marcelo de Queiroz. Conheça a história por trás do MQM, a Comunidade MQM e a mentoria personalizada.";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  return {
    title: TITLE,
    description: DESCRIPTION,
    alternates: { canonical: `/${locale}` },
    openGraph: { title: TITLE, description: DESCRIPTION, url: `/${locale}` },
    twitter: { title: TITLE, description: DESCRIPTION },
  };
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "MQM Crypto",
  url: "https://www.mqmcrypto.com",
  sameAs: [
    "https://x.com/mqmcrypto",
    "https://www.youtube.com/@mQmcrypto",
    "https://www.instagram.com/mqm_racional/",
  ],
};

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <MqmHome locale={locale} />
    </>
  );
}
