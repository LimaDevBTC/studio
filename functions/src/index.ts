
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
// import {LivestreamServiceClient} from "@google-cloud/livestream";

// Initialize the Firebase Admin SDK.
admin.initializeApp();
const db = admin.firestore();
// const livestreamServiceClient = new LivestreamServiceClient();

// Get the project ID and location from environment variables or set defaults.
// const project = process.env.GCLOUD_PROJECT || "your-gcp-project-id";
// const location = "us-central1";


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
  // We check the custom claims on their token.
  const callerClaims = request.auth.token;
  if (callerClaims.isAdmin !== true) {
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


/**
 * Creates a live stream channel on Google Cloud Livestream API.
 * This can only be called by an authenticated admin user.
 */
export const createLiveStream = onCall(async (request) => {
    if (!request.auth || !request.auth.token.isAdmin) {
        throw new HttpsError("permission-denied", "You must be an admin to perform this action.");
    }
    logger.log("createLiveStream function called by admin:", request.auth.uid);
    // Returning a mock response due to package installation issues.
    throw new HttpsError("unavailable", "The Livestream service is temporarily unavailable.");

    /*
    const inputId = `mqm-crypto-input-${Date.now()}`;
    const channelId = `mqm-crypto-channel-${Date.now()}`;
    const liveDocRef = db.collection('live').doc('current');

    try {
        await liveDocRef.set({ status: 'generating' });

        // 1. Create Input Endpoint
        const [inputOperation] = await livestreamServiceClient.createInput({
            parent: `projects/${project}/locations/${location}`,
            inputId: inputId,
            input: { type: "RTMP_PUSH" },
        });
        await inputOperation.promise();
        logger.log("Livestream input created:", inputId);
        
        // 2. Create Channel
        const [channelOperation] = await livestreamServiceClient.createChannel({
            parent: `projects/${project}/locations/${location}`,
            channelId: channelId,
            channel: {
                inputAttachments: [{
                    key: 'default-input',
                    inputId: `projects/${project}/locations/${location}/inputs/${inputId}`,
                }],
                output: { uri: `gs://${project}.appspot.com/live/${channelId}/` },
            },
        });
        const [channel] = await channelOperation.promise();
        logger.log("Livestream channel created:", channelId);

        // 3. Start the Channel
        const [startOperation] = await livestreamServiceClient.startChannel({ name: channel.name });
        await startOperation.promise();
        logger.log("Channel started:", channelId);

        // 4. Get the created resources to extract URLs
        const [inputDetails] = await livestreamServiceClient.getInput({name: `projects/${project}/locations/${location}/inputs/${inputId}`});
        
        const liveState = {
            status: 'ready',
            rtmpUrl: inputDetails.uri,
            streamKey: "live", // For RTMP_PUSH, the stream key is often part of the path or defaults. Here we provide a simple one. The full URL is all that's needed.
            playbackUrl: `https://storage.googleapis.com/${project}.appspot.com/live/${channelId}/master.m3u8`,
            channelName: channel.name,
            inputName: inputDetails.name,
        };

        await liveDocRef.set(liveState, { merge: true });
        logger.log("Live stream details saved to Firestore.");
        return liveState;

    } catch (error: any) {
        logger.error("Error creating live stream:", error);
        await liveDocRef.set({ status: 'error', errorMessage: error.message }, { merge: true });
        throw new HttpsError("internal", "Failed to create live stream.", error);
    }
    */
});


/**
 * Finishes and cleans up a live stream channel.
 * This can only be called by an authenticated admin user.
 */
export const finishLiveStream = onCall(async (request) => {
    if (!request.auth || !request.auth.token.isAdmin) {
        throw new HttpsError("permission-denied", "You must be an admin to perform this action.");
    }
    
    logger.log("finishLiveStream function called by admin:", request.auth.uid);
    const liveDocRef = db.collection('live').doc('current');
    await liveDocRef.delete();
    return { message: "Live stream finished and cleaned up successfully." };
    
    /*
    const liveDocSnap = await liveDocRef.get();

    if (!liveDocSnap.exists) {
        logger.warn("No active live stream document found to finish.");
        return { message: "No active stream to finish." };
    }

    const { channelName, inputName } = liveDocSnap.data() as any;

    try {
        if (channelName) {
            await livestreamServiceClient.stopChannel({ name: channelName });
            logger.log("Channel stopped:", channelName);
            await livestreamServiceClient.deleteChannel({ name: channelName });
            logger.log("Channel deleted:", channelName);
        }
        if (inputName) {
            await livestreamServiceClient.deleteInput({ name: inputName });
            logger.log("Input deleted:", inputName);
        }
        
        await liveDocRef.delete();
        logger.log("Firestore live document deleted.");

        return { message: "Live stream finished and cleaned up successfully." };

    } catch (error: any) {
        logger.error("Error finishing live stream:", error);
        // Even if cleanup fails, remove the doc so the user doesn't see a broken state.
        await liveDocRef.delete();
        throw new HttpsError("internal", "Failed to clean up live stream resources.", error);
    }
    */
});
