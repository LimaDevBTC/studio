"use client";

import { ReactNode } from 'react';
import { useCourseAccess } from '@/hooks/use-course-access';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, BookOpen, Crown } from 'lucide-react';
import { useTranslations } from 'next-intl';
import UnifiedPaymentModal from './UnifiedPaymentModal';

interface CourseAccessGuardProps {
  courseId: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export default function CourseAccessGuard({ courseId, children, fallback }: CourseAccessGuardProps) {
  const { hasAccess, isLoading } = useCourseAccess(courseId);
  const t = useTranslations("CourseAccess");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verificando acesso...</p>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <Card className="max-w-2xl mx-auto mt-8">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-muted-foreground" />
          </div>
          <CardTitle className="text-2xl">Acesso Restrito</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            Este curso requer pagamento para ser acessado. 
            Faça o pagamento para desbloquear todo o conteúdo.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Comprar Curso
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Crown className="w-4 h-4" />
              Ver Planos de Assinatura
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
}
