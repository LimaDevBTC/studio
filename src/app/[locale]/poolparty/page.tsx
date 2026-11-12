import type { Metadata } from "next";
import { PoolPartyPage } from "@/components/marketing/poolparty/PoolPartyPage";

export const metadata: Metadata = {
  title: "Pool Party · MQM Crypto",
  description:
    "Pool Party: aprenda a montar as melhores pools de liquidez com um dos pioneiros no Brasil e ganhar muita taxa. Análise de oportunidades, todas as modalidades e gestão de portfólio.",
  openGraph: {
    title: "Pool Party · MQM Crypto",
    description:
      "Venha aprender a montar as melhores pool de liquidez com um dos pioneiros no Brasil e ganhar muita taxa!",
    images: [
      {
        url: "/marketing/mqm/poolparty/poolparty-social.jpg",
        width: 1200,
        height: 630,
        alt: "Pool Party · MQM Crypto",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pool Party · MQM Crypto",
    description:
      "Venha aprender a montar as melhores pool de liquidez com um dos pioneiros no Brasil e ganhar muita taxa!",
    images: ["/marketing/mqm/poolparty/poolparty-social.jpg"],
  },
};

export default async function PoolParty({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return <PoolPartyPage locale={locale} />;
}
