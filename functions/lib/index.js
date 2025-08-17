"use strict";
/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.finishLiveStream = exports.createLiveStream = exports.setAdminClaim = exports.createFirstAdmin = void 0;
const logger = require("firebase-functions/logger");
const https_1 = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
// Initialize the Firebase Admin SDK.
admin.initializeApp();
const db = admin.firestore();
/**
 * TEMPORARY: Function to create the first admin user.
 * This should be removed after the first admin is created.
 */
exports.createFirstAdmin = (0, https_1.onCall)(async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }
    const uid = request.auth.uid;
    logger.log("createFirstAdmin function called by user:", uid);
    try {
        // Check if any admin already exists
        const adminUsersSnapshot = await db.collection('users').where('isAdmin', '==', true).limit(1).get();
        if (!adminUsersSnapshot.empty) {
            throw new https_1.HttpsError("already-exists", "An admin user already exists. Use setAdminClaim instead.");
        }
        // Set custom claim
        await admin.auth().setCustomUserClaims(uid, { isAdmin: true });
        // Update Firestore document
        const userDocRef = db.collection('users').doc(uid);
        await userDocRef.update({ isAdmin: true });
        logger.log(`Successfully created first admin user: ${uid}`);
        return {
            message: "Success! You are now the first admin user. Please log out and log back in for changes to take effect.",
        };
    }
    catch (error) {
        logger.error(`Error creating first admin: ${uid}`, error);
        throw new https_1.HttpsError("internal", "Failed to create first admin user.", error);
    }
});
/**
 * A callable function that sets a custom user claim (`isAdmin`) on a user.
 * This can only be called by a user who is already an admin.
 */
exports.setAdminClaim = (0, https_1.onCall)(async (request) => {
    var _a;
    // 1. Authentication Check: Ensure the user calling the function is authenticated.
    if (!request.auth) {
        logger.error("Unauthenticated user tried to call setAdminClaim");
        throw new https_1.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }
    // 2. Admin Check: Ensure the user calling the function is an admin.
    // Check admin status in Firestore instead of custom claims
    const callerDoc = await db.collection('users').doc(request.auth.uid).get();
    if (!callerDoc.exists || !((_a = callerDoc.data()) === null || _a === void 0 ? void 0 : _a.isAdmin)) {
        logger.error(`User ${request.auth.uid} (not admin) tried to call setAdminClaim`);
        throw new https_1.HttpsError("permission-denied", "You must be an admin to perform this action.");
    }
    // 3. Input Validation: Ensure the required data (uid, isAdmin) was passed.
    const targetUid = request.data.uid;
    const isAdmin = request.data.isAdmin;
    if (typeof targetUid !== "string" || typeof isAdmin !== "boolean") {
        throw new https_1.HttpsError("invalid-argument", "The function must be called with a 'uid' (string) and 'isAdmin' (boolean) argument.");
    }
    // 4. Set the Custom Claim and update Firestore for UI consistency
    try {
        // Set the custom claim on the user's auth token FIRST.
        // This is the most critical operation.
        await admin.auth().setCustomUserClaims(targetUid, { isAdmin: isAdmin });
        // THEN, update the user's document in Firestore for immediate UI consistency.
        const userDocRef = admin.firestore().collection("users").doc(targetUid);
        await userDocRef.update({ isAdmin: isAdmin });
        logger.log(`Successfully set isAdmin=${isAdmin} for user ${targetUid} by admin ${request.auth.uid}`);
        return {
            message: `Success! User ${targetUid} has been ${isAdmin ? "made" : "removed as"} an admin. Please have them log out and log back in for changes to take full effect.`,
        };
    }
    catch (error) {
        logger.error(`Error setting custom claim for ${targetUid}`, error);
        throw new https_1.HttpsError("internal", "An error occurred while setting the user claim. The user may not exist.");
    }
});
/**
 * Creates a live stream channel using Agora.io.
 * This can only be called by an authenticated admin user.
 */
exports.createLiveStream = (0, https_1.onCall)(async (request) => {
    var _a;
    if (!request.auth) {
        throw new https_1.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }
    // Check admin status in Firestore instead of custom claims
    const userDoc = await db.collection('users').doc(request.auth.uid).get();
    if (!userDoc.exists || !((_a = userDoc.data()) === null || _a === void 0 ? void 0 : _a.isAdmin)) {
        throw new https_1.HttpsError("permission-denied", "You must be an admin to perform this action.");
    }
    logger.log("createLiveStream function called by admin:", request.auth.uid);
    const channelId = `mqm-crypto-${Date.now()}`;
    const liveDocRef = db.collection('live').doc('current');
    try {
        await liveDocRef.set({
            status: 'ready',
            channelId: channelId,
            createdBy: request.auth.uid,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            // Agora.io não precisa de RTMP, usa WebRTC diretamente
            agoraChannelId: channelId,
            agoraAppId: process.env.AGORA_APP_ID || 'your-agora-app-id'
        });
        logger.log("Live stream channel created:", channelId);
        return {
            status: 'ready',
            channelId: channelId,
            agoraChannelId: channelId,
            agoraAppId: process.env.AGORA_APP_ID || 'your-agora-app-id'
        };
    }
    catch (error) {
        logger.error("Error creating live stream:", error);
        await liveDocRef.set({ status: 'error', errorMessage: error.message }, { merge: true });
        throw new https_1.HttpsError("internal", "Failed to create live stream.", error);
    }
});
/**
 * Finishes and cleans up a live stream channel.
 * This can only be called by an authenticated admin user.
 */
exports.finishLiveStream = (0, https_1.onCall)(async (request) => {
    var _a;
    if (!request.auth) {
        throw new https_1.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }
    // Check admin status in Firestore instead of custom claims
    const userDoc = await db.collection('users').doc(request.auth.uid).get();
    if (!userDoc.exists || !((_a = userDoc.data()) === null || _a === void 0 ? void 0 : _a.isAdmin)) {
        throw new https_1.HttpsError("permission-denied", "You must be an admin to perform this action.");
    }
    logger.log("finishLiveStream function called by admin:", request.auth.uid);
    const liveDocRef = db.collection('live').doc('current');
    try {
        // Agora.io não precisa de cleanup complexo, apenas remove o documento
        await liveDocRef.delete();
        logger.log("Live stream finished and cleaned up successfully.");
        return { message: "Live stream finished and cleaned up successfully." };
    }
    catch (error) {
        logger.error("Error finishing live stream:", error);
        throw new https_1.HttpsError("internal", "Failed to finish live stream.", error);
    }
});
//# sourceMappingURL=index.js.map