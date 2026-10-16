
import {Pathnames} from 'next-intl/navigation';

export const locales = ['en', 'es', 'pt'] as const;

export const pathnames = {
  '/': '/',
  '/comunidade': '/comunidade',
  '/manual': '/manual',
  '/mentoria': '/mentoria',
  '/login': {
    en: '/login',
    es: '/iniciar-sesion',
    pt: '/login'
  },
  '/signup': {
    en: '/signup',
    es: '/registro',
    pt: '/cadastro'
  },
  '/dashboard': '/dashboard',
  '/dashboard/profile': '/dashboard/profile',
  '/dashboard/settings': '/dashboard/settings',
  '/dashboard/account': '/dashboard/account',
  '/dashboard/courses': '/dashboard/courses',
  '/dashboard/courses/[courseId]': '/dashboard/courses/[courseId]',
  '/dashboard/courses/[courseId]/lesson/[lessonId]': '/dashboard/courses/[courseId]/lesson/[lessonId]',
  '/dashboard/subscription': '/dashboard/subscription',
  '/dashboard/consultation': '/dashboard/consultation',
  '/dashboard/live': '/dashboard/live',

  '/admin/dashboard': '/admin/dashboard',
  '/admin/courses': '/admin/courses',
  '/admin/courses/[courseId]': '/admin/courses/[courseId]',
  '/admin/users': '/admin/users',
  '/admin/live': '/admin/live',
  '/admin/consultations': '/admin/consultations',
  '/admin/payments': '/admin/payments',
  '/admin/waitlist': '/admin/waitlist'
} satisfies Pathnames<typeof locales>;

// Use the default: `always`
export const localePrefix = undefined;

export type AppPathnames = keyof typeof pathnames;
