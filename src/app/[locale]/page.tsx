import {useTranslations} from 'next-intl';
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { BookOpen, ShieldCheck, BarChart } from "lucide-react";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AuthStatus } from "@/components/AuthStatus";
import { LocaleSwitcher } from '@/components/LocaleSwitcher';
import { Link } from '@/navigation';


const features = [
  {
    icon: <BookOpen className="w-8 h-8 text-primary" />,
    title: "feature1Title",
    description: "feature1Desc",
  },
  {
    icon: <ShieldCheck className="w-8 h-8 text-primary" />,
    title: "feature2Title",
    description: "feature2Desc",
  },
  {
    icon: <BarChart className="w-8 h-8 text-primary" />,
    title: "feature3Title",
    description: "feature3Desc",
  },
];

const coursePreviews = [
  {
    title: "course1Title",
    description: "course1Desc",
    image: "https://placehold.co/600x400.png",
    aiHint: "bitcoin abstract",
  },
  {
    title: "course2Title",
    description: "course2Desc",
    image: "https://placehold.co/600x400.png",
    aiHint: "finance technology",
  },
  {
    title: "course3Title",
    description: "course3Desc",
    image: "https://placehold.co/600x400.png",
    aiHint: "stock charts",
  },
];


export default function Home() {
  const t = useTranslations('HomePage');
  
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="px-4 lg:px-6 h-16 flex items-center">
        <Logo />
        <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
          <LocaleSwitcher />
          <ThemeToggle />
          <AuthStatus />
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline">
                    {t('heroTitle')}
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    {t('heroSubtitle')}
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button size="lg" asChild>
                    <Link href="/signup">{t('startFreeTrial')}</Link>
                  </Button>
                </div>
              </div>
              <Image
                src="https://placehold.co/600x600.png"
                data-ai-hint="crypto abstract"
                width="600"
                height="600"
                alt="Hero"
                className="mx-auto aspect-square overflow-hidden rounded-xl object-cover sm:w-full lg:order-last"
              />
            </div>
          </div>
        </section>

        <section id="features" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm">{t('featuresTitle')}</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">{t('featuresTitle')}</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  {t('featuresSubtitle')}
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3 mt-12">
              {features.map((feature, index) => (
                <div key={index} className="grid gap-1 text-center">
                  <div className="flex justify-center">{feature.icon}</div>
                  <h3 className="text-lg font-bold">{t(feature.title)}</h3>
                  <p className="text-sm text-muted-foreground">{t(feature.description)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="courses" className="w-full py-12 md:py-24 lg:py-32 bg-secondary">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">{t('coursesTitle')}</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  {t('coursesSubtitle')}
                </p>
              </div>
            </div>
            <div className="mx-auto grid gap-8 sm:grid-cols-2 lg:grid-cols-3 mt-12">
              {coursePreviews.map((course) => (
                <Card key={course.title} className="bg-card">
                  <CardHeader className="p-0">
                    <Image src={course.image} data-ai-hint={course.aiHint} alt={t(course.title)} width={600} height={400} className="rounded-t-lg object-cover aspect-video" />
                  </CardHeader>
                  <CardContent className="pt-6">
                    <h3 className="text-lg font-bold">{t(course.title)}</h3>
                    <p className="text-sm text-muted-foreground mt-2">{t(course.description)}</p>
                    <Button variant="link" className="p-0 mt-4" asChild>
                      <Link href="/login">{t('learnMore')}</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight font-headline">
                {t('pricingTitle')}
              </h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                {t('pricingSubtitle')}
              </p>
            </div>
            <div className="mx-auto w-full max-w-sm space-y-2">
              <Button asChild size="lg" className="w-full">
                <Link href="/dashboard/subscription">{t('viewSubscriptions')}</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">{t('footerRights')}</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="#" className="text-xs hover:underline underline-offset-4">
            {t('footerTerms')}
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4">
            {t('footerPrivacy')}
          </Link>
        </nav>
      </footer>
    </div>
  );
}
