
/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import * as logger from "firebase-functions/logger";
import {onCall, HttpsError} from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import * as functions from 'firebase-functions';
import * as sgMail from '@sendgrid/mail';
import { onSchedule } from "firebase-functions/v2/scheduler";

// Initialize the Firebase Admin SDK.
admin.initializeApp();
const db = admin.firestore();


/**
 * TEMPORARY: Function to create the first admin user.
 * This should be removed after the first admin is created.
 */
export const createFirstAdmin = onCall(async (request) => {
    if (!request.auth) {
        throw new HttpsError("unauthenticated", "The function must be called while authenticated.");
    }
    
    const uid = request.auth.uid;
    logger.log("createFirstAdmin function called by user:", uid);
    
    try {
        // Check if any admin already exists
        const adminUsersSnapshot = await db.collection('users').where('isAdmin', '==', true).limit(1).get();
        
        if (!adminUsersSnapshot.empty) {
            throw new HttpsError("already-exists", "An admin user already exists. Use setAdminClaim instead.");
        }
        
        // Set custom claim
        await admin.auth().setCustomUserClaims(uid, {isAdmin: true});
        
        // Update Firestore document
        const userDocRef = db.collection('users').doc(uid);
        await userDocRef.update({ isAdmin: true });
        
        logger.log(`Successfully created first admin user: ${uid}`);
        return {
            message: "Success! You are now the first admin user. Please log out and log back in for changes to take effect.",
        };
    } catch (error: any) {
        logger.error(`Error creating first admin: ${uid}`, error);
        throw new HttpsError("internal", "Failed to create first admin user.", error);
    }
});

/**
 * A callable function that sets a custom user claim (`isAdmin`) on a user.
 * This can only be called by a user who is already an admin.
 */
export const setAdminClaim = onCall(async (request) => {
  // 1. Authentication Check: Ensure the user calling the function is authenticated.
  if (!request.auth) {
    logger.error("Unauthenticated user tried to call setAdminClaim");
    throw new HttpsError(
        "unauthenticated",
        "The function must be called while authenticated.",
    );
  }

  // 2. Admin Check: Ensure the user calling the function is an admin.
  // Check admin status in Firestore instead of custom claims
  const callerDoc = await db.collection('users').doc(request.auth.uid).get();
  if (!callerDoc.exists || !callerDoc.data()?.isAdmin) {
    logger.error(`User ${request.auth.uid} (not admin) tried to call setAdminClaim`);
    throw new HttpsError(
        "permission-denied",
        "You must be an admin to perform this action.",
    );
  }

  // 3. Input Validation: Ensure the required data (uid, isAdmin) was passed.
  const targetUid = request.data.uid;
  const isAdmin = request.data.isAdmin;
  if (typeof targetUid !== "string" || typeof isAdmin !== "boolean") {
    throw new HttpsError(
        "invalid-argument",
        "The function must be called with a 'uid' (string) and 'isAdmin' (boolean) argument.",
    );
  }

  // 4. Set the Custom Claim and update Firestore for UI consistency
  try {
    // Set the custom claim on the user's auth token FIRST.
    // This is the most critical operation.
    await admin.auth().setCustomUserClaims(targetUid, {isAdmin: isAdmin});
    
    // THEN, update the user's document in Firestore for immediate UI consistency.
    const userDocRef = admin.firestore().collection("users").doc(targetUid);
    await userDocRef.update({ isAdmin: isAdmin });

    logger.log(`Successfully set isAdmin=${isAdmin} for user ${targetUid} by admin ${request.auth.uid}`);
    return {
      message: `Success! User ${targetUid} has been ${isAdmin ? "made" : "removed as"} an admin. Please have them log out and log back in for changes to take full effect.`,
    };
  } catch (error) {
    logger.error(`Error setting custom claim for ${targetUid}`, error);
    throw new HttpsError(
        "internal",
        "An error occurred while setting the user claim. The user may not exist.",
    );
  }
});


// Funções de streaming removidas - não serão usadas
// O sistema de lives será apenas para agendamento e histórico

// Configurar SendGrid
sgMail.setApiKey(functions.config().sendgrid?.key || 'your-sendgrid-api-key');

// Cloud Function para enviar emails em massa
export const sendWaitlistEmails = functions.https.onCall(async (data, context) => {
  // Verificar se o usuário é admin
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Usuário não autenticado');
  }

  try {
    const userDoc = await admin.firestore().collection('users').doc(context.auth.uid).get();
    if (!userDoc.exists || !userDoc.data()?.isAdmin) {
      throw new functions.https.HttpsError('permission-denied', 'Acesso negado: apenas admins podem enviar emails');
    }
  } catch (error) {
    throw new functions.https.HttpsError('permission-denied', 'Erro ao verificar permissões');
  }

  const { courseId, emailTemplate, recipientEmails } = data;

  if (!courseId || !emailTemplate || !recipientEmails || !Array.isArray(recipientEmails)) {
    throw new functions.https.HttpsError('invalid-argument', 'Dados inválidos fornecidos');
  }

  try {
    const results = [];
    const errors = [];

    // Enviar emails para cada destinatário
    for (const email of recipientEmails) {
      try {
        const msg = {
          to: email,
          from: functions.config().sendgrid?.from || 'support@mqmcrypto.com',
          subject: `🎯 Curso Disponível: ${courseId}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
                <h1 style="margin: 0; font-size: 28px;">🎉 Curso Disponível!</h1>
                <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">O curso que você estava esperando já está disponível!</p>
              </div>
              
              <div style="padding: 30px; background: white;">
                <h2 style="color: #333; margin-bottom: 20px;">${courseId}</h2>
                
                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  ${emailTemplate.replace(/\n/g, '<br>')}
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${functions.config().app?.url || 'https://mqmcrypto.com'}/dashboard/courses" 
                     style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                    Acessar Curso Agora
                  </a>
                </div>
                
                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                
                <p style="color: #666; font-size: 14px; text-align: center;">
                  Este email foi enviado automaticamente. Se você não solicitou esta notificação, 
                  pode ignorar ou cancelar sua inscrição na lista de espera.
                </p>
              </div>
              
              <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px;">
                <p>© 2024 Sua Plataforma. Todos os direitos reservados.</p>
              </div>
            </div>
          `,
          text: `
            🎉 Curso Disponível: ${courseId}
            
            ${emailTemplate}
            
            Acesse agora: ${functions.config().app?.url || 'https://mqmcrypto.com'}/dashboard/courses
            
            ---
            Este email foi enviado automaticamente.
          `
        };

        await sgMail.send(msg);
        results.push({ email, status: 'success' });
        
        // Atualizar status no Firestore
        const waitlistQuery = admin.firestore()
          .collection('waitlist')
          .where('courseId', '==', courseId)
          .where('userEmail', '==', email);
        
        const waitlistDocs = await waitlistQuery.get();
        for (const doc of waitlistDocs.docs) {
          await doc.ref.update({ 
            status: 'notified',
            notifiedAt: admin.firestore.FieldValue.serverTimestamp()
          });
        }

      } catch (error: any) {
        console.error(`Erro ao enviar email para ${email}:`, error);
        errors.push({ email, status: 'error', error: error.message });
      }
    }

    return {
      success: true,
      results,
      errors,
      totalSent: results.length,
      totalErrors: errors.length
    };

  } catch (error) {
    console.error('Erro geral ao enviar emails:', error);
    throw new functions.https.HttpsError('internal', 'Erro interno ao enviar emails');
  }
});

/**
 * Scheduled function to check and update expired subscriptions daily
 * Runs every day at 2:00 AM UTC
 */
export const checkExpiredSubscriptions = onSchedule({
  schedule: "0 2 * * *", // Every day at 2:00 AM UTC
  timeZone: "UTC"
}, async (event) => {
  logger.log("Starting expired subscription check...");
  
  try {
    const now = new Date();
    const usersSnapshot = await db.collection('users')
      .where('planExpiryDate', '<=', now)
      .where('plan', '!=', 'Free Trial')
      .get();
    
    let updatedCount = 0;
    
    for (const doc of usersSnapshot.docs) {
      const userData = doc.data();
      
      // Only update if the plan is actually expired
      if (userData.planExpiryDate && userData.planExpiryDate.toDate() <= now) {
        await doc.ref.update({
          plan: 'Free Trial',
          planExpiryDate: null,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        logger.log(`Updated expired subscription for user: ${doc.id}`);
        updatedCount++;
      }
    }
    
    logger.log(`Expired subscription check completed. Updated ${updatedCount} users.`);
    
  } catch (error) {
    logger.error("Error checking expired subscriptions:", error);
    throw error;
  }
});