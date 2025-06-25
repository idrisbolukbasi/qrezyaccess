// src/app/api/control-device/route.ts

import { NextResponse, NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
    // This route is temporarily disabled because the 'ewelink-api-next' package
    // could not be installed due to a persistent 'ETARGET' error.
    return NextResponse.json(
        { 
            error: 'Device control is temporarily unavailable due to a package installation issue.' 
        }, 
        { status: 503 } // 503 Service Unavailable
    );
}
