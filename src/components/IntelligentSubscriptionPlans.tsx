import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Star, TrendingUp, Users, BookOpen } from "lucide-react";
import { useSubscriptionLogic } from '@/hooks/use-subscription-logic';
import { useTranslations } from 'next-intl';
import CryptoPaymentModal from './CryptoPaymentModal';

interface IntelligentSubscriptionPlansProps {
  className?: string;
}

export default function IntelligentSubscriptionPlans({ className }: IntelligentSubscriptionPlansProps) {
  const t = useTranslations('SubscriptionPage');
  const { displayLogic, isLoading } = useSubscriptionLogic();

  if (isLoading) {
    return (
      <div className={`${className} space-y-6`}>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const plans = [
    {
      id: "monthly",
      name: t('monthly'),
      price: 49.00,
      description: t('monthlyDescription'),
      features: [
        t('monthlyFeature1'),
        t('monthlyFeature2'),
        t('monthlyFeature3'),
        t('monthlyFeature4')
      ],
      popular: false,
      show: displayLogic.showMonthly,
      upgradeFrom: null
    },
    {
      id: "yearly",
      name: t('yearly'),
      price: 499.00,
      description: t('yearlyDescription'),
      features: [
        t('yearlyFeature1'),
        t('yearlyFeature2'),
        t('yearlyFeature3'),
        t('yearlyFeature4'),
        t('yearlyFeature5')
      ],
      popular: true,
      show: displayLogic.showAnnual,
      upgradeFrom: displayLogic.subscriptionType === 'monthly' ? 'monthly' : null
    },
    {
      id: "consultation",
      name: t('consultation'),
      price: 39.00,
      description: t('consultationDescription'),
      features: [
        t('consultationFeature1'),
        t('consultationFeature2'),
        t('consultationFeature3'),
        t('consultationFeature4'),
        t('consultationFeature5')
      ],
      popular: false,
      show: displayLogic.showConsultation,
      upgradeFrom: null
    }
  ];

  const visiblePlans = plans.filter(plan => plan.show);

  if (visiblePlans.length === 0) {
    return (
      <div className={`${className} text-center py-12`}>
        <Crown className="h-16 w-16 text-[#F7931A] mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-card-foreground mb-2">
          {t('alreadyBestPlan')}
        </h3>
        <p className="text-muted-foreground">
          {t('alreadyBestPlanDesc')}
        </p>
      </div>
    );
  }

  return (
    <div className={`${className} space-y-6`}>
      {/* Título Inteligente */}
      <div className="text-center space-y-4">
        {displayLogic.hasActiveSubscription ? (
          <>
            <h2 className="text-3xl font-bold text-card-foreground">
              {t('upgradeOptions')}
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {displayLogic.subscriptionType === 'monthly' && t('upgradeMonthlyMessage')}
              {displayLogic.subscriptionType === 'annual' && t('upgradeAnnualMessage')}
              {displayLogic.subscriptionType === 'consultation' && t('upgradeConsultationMessage')}
              {displayLogic.subscriptionType === 'course' && t('upgradeCourseMessage')}
            </p>
          </>
        ) : (
          <>
            <h2 className="text-3xl font-bold text-card-foreground">
              {t('chooseYourPlan')}
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('planSubtitle')}
            </p>
          </>
        )}
      </div>

      {/* Planos */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visiblePlans.map((plan) => (
          <Card 
            key={plan.id} 
            className={`relative transition-all hover:shadow-lg ${
              plan.popular ? 'border-[#F7931A] shadow-lg' : 'border-border'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-[#F7931A] text-white px-3 py-1">
                  <Star className="h-3 w-3 mr-1" />
                  {t('mostPopular')}
                </Badge>
              </div>
            )}

            {plan.upgradeFrom && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-blue-500 text-white px-3 py-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {t('recommendedUpgrade')}
                </Badge>
              </div>
            )}

            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl font-bold text-card-foreground">
                {plan.name}
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                {plan.description}
              </CardDescription>
              
              <div className="mt-4">
                <span className="text-4xl font-bold text-[#F7931A]">
                  USD${plan.price.toFixed(2).replace('.', ',')}
                </span>
                {plan.id === 'yearly' && (
                  <span className="text-sm text-muted-foreground ml-2">
                    /year
                  </span>
                )}
                {plan.id === 'monthly' && (
                  <span className="text-sm text-muted-foreground ml-2">
                    /month
                  </span>
                )}
                {plan.id === 'consultation' && (
                  <span className="text-sm text-muted-foreground ml-2">
                    /session
                  </span>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-[#F7931A] flex-shrink-0" />
                    <span className="text-sm text-card-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-4">
                <CryptoPaymentModal
                  courseId={plan.id}
                  courseTitle={plan.name}
                  coursePrice={plan.price}
                  type={plan.id === 'consultation' ? 'consultation' : 'subscription'}
                  trigger={
                    <Button 
                      className={`w-full ${
                        plan.popular 
                          ? 'bg-[#F7931A] hover:bg-[#F7931A]/90 text-white' 
                          : 'bg-card-foreground hover:bg-card-foreground/90 text-card'
                      }`}
                    >
                      {plan.upgradeFrom ? t('upgradeNow') : t('startNow')}
                    </Button>
                  }
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Mensagem de Upgrade */}
      {displayLogic.subscriptionType === 'monthly' && (
        <div className="text-center p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-blue-800 mb-2">
            💡 {t('upgradeTip')}
          </h3>
          <p className="text-blue-700">
            {t('upgradeTipDesc')}
          </p>
        </div>
      )}
    </div>
  );
}
