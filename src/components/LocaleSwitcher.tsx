'use client';

import { useLocale, useTranslations } from 'next-intl';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { usePathname } from 'next/navigation';
import { useTransition } from 'react';

const nativeNames = {
  en: 'English',
  es: 'Español',
  pt: 'Português',
} as const;

export function LocaleSwitcher() {
  const t = useTranslations('LocaleSwitcher');
  const locale = useLocale();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const onSelectChange = (nextLocale: string) => {
    startTransition(() => {
      // Reconstruct the path with the new locale, handling the existing locale prefix
      const currentPathWithoutLocale = pathname.startsWith(`/${locale}`)
        ? pathname.substring(`/${locale}`.length)
        : pathname;
      
      const newPath = `/${nextLocale}${currentPathWithoutLocale || '/'}`;
      
      // Use window.location.href for a full page redirect. This is more robust in complex routing scenarios.
      window.location.href = newPath;
    });
  };

  return (
    <Select defaultValue={locale} onValueChange={onSelectChange} disabled={isPending}>
      <SelectTrigger className="w-auto min-w-[120px]">
        <SelectValue placeholder={t('label')}>
          {nativeNames[locale as keyof typeof nativeNames]}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="en">{nativeNames.en}</SelectItem>
        <SelectItem value="es">{nativeNames.es}</SelectItem>
        <SelectItem value="pt">{nativeNames.pt}</SelectItem>
      </SelectContent>
    </Select>
  );
}
