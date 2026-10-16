import { MarketingProductPage } from "@/components/marketing/MqmMarketing";

export default async function ComunidadePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return <MarketingProductPage locale={locale} productKey="community" />;
}
