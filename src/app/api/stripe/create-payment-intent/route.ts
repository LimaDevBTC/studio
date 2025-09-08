import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Verificar se a chave do Stripe existe
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
let stripe: Stripe | null = null;

if (stripeSecretKey) {
  stripe = new Stripe(stripeSecretKey, {
    apiVersion: '2024-12-18.acacia',
  });
}

export async function POST(request: NextRequest) {
  try {
    // Verificar se o Stripe está configurado
    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe não está configurado. Apenas pagamentos em cripto estão disponíveis.' },
        { status: 503 }
      );
    }

    const { amount, currency, metadata } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Amount deve ser maior que zero' },
        { status: 400 }
      );
    }

    // Criar Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: currency || 'usd',
      metadata: metadata || {},
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });

  } catch (error) {
    console.error('Erro ao criar Payment Intent:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
