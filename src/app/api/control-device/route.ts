// src/app/api/control-device/route.ts
// This file is the Next.js API route that will manage communication with the Ewelink API
// using the ewelink-api-next library.

import { initializeApp, getApps, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { NextResponse, NextRequest } from 'next/server';
import Ewelink from 'ewelink-api-next'; // Import the ewelink-api-next library as a default import

// Initialize Firebase Admin SDK
// Ensure it's initialized only once on the server side (Next.js API Routes)
if (!getApps().length) {
    initializeApp({
        credential: applicationDefault(), // Provides automatic authentication in Firebase App Hosting environment
    });
}

const db = getFirestore(); // Firebase Admin Firestore service instance

export async function POST(request: NextRequest) {
    try {
        // Get necessary parameters from the request body
        const { userId, ewelinkAccountId, deviceId, action } = await request.json(); // 'action' will be 'on' or 'off'

        // Check if parameters are missing
        if (!userId || !ewelinkAccountId || !deviceId || !action) {
            return NextResponse.json({ error: 'Missing parameters (userId, ewelinkAccountId, deviceId, action).' }, { status: 400 });
        }

        // 1. Fetch Global Ewelink API App ID and Secret from Firestore
        const globalConfigRef = db.collection('app_settings').doc('ewelink_global_config');
        const globalConfigSnap = await globalConfigRef.get();

        // Check if the global configuration document exists
        if (!globalConfigSnap.exists) {
            console.error('API Route Error: Global Ewelink API configuration not found.');
            return NextResponse.json({ error: 'Global Ewelink API configuration not found.' }, { status: 500 });
        }

        // Get global configuration data
        const { global_ewelink_appid, global_ewelink_secret } = globalConfigSnap.data() as { global_ewelink_appid: string, global_ewelink_secret: string };

        // 2. Fetch Substore's Ewelink account information from Firestore
        const ewelinkAccountRef = db.collection('users').doc(userId).collection('ewelink_accounts').doc(ewelinkAccountId);
        const ewelinkAccountSnap = await ewelinkAccountRef.get();

        // Check if the Ewelink account document exists
        if (!ewelinkAccountSnap.exists) {
            console.error('API Route Error: Ewelink account not found.');
            return NextResponse.json({ error: 'Ewelink account not found.' }, { status: 404 });
        }

        // Get Ewelink account information
        const { ewelink_email, ewelink_password, ewelink_region, ewelink_area_code } = ewelinkAccountSnap.data() as { ewelink_email: string, ewelink_password: string, ewelink_region: string, ewelink_area_code: string };
        
        // Create an ewelink-api-next WebAPI instance
        // We use the WebAPI class found within the imported Ewelink object
        const api = new Ewelink.WebAPI({ // <-- Corrected usage here
            appId: global_ewelink_appid,
            appSecret: global_ewelink_secret,
            region: ewelink_region, // Region is typically required when creating the API instance
        });

        // Log in to the Ewelink API
        // Credentials and area code are passed to the login() method.
        await api.user.login({
            account: ewelink_email,
            password: ewelink_password,
            areaCode: ewelink_area_code, // areaCode is required in the login method
        });

        console.log('Ewelink API login successful.');

        // Set the device status (turn on/off)
        const controlResponse = await api.device.setThingStatus({
            type: 1, // Device type, usually 1 for on/off switches
            id: deviceId, // ID of the device to control
            params: { switch: action } // 'on' or 'off' command
        });

        console.log('Ewelink Device Control Response:', controlResponse);

        // Return a successful response
        return NextResponse.json({ message: `Device successfully turned ${action}.`, response: controlResponse }, { status: 200 });

    } catch (error: unknown) { // Error type updated to 'unknown' and handled more safely
        console.error('API Route General Error:', error);
        // Determine the type of the error and return an appropriate message
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred.';
        return NextResponse.json({ error: `Server error: ${errorMessage}` }, { status: 500 });
    }
}
