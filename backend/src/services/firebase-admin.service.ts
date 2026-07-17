import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

function loadServiceAccount(): Record<string, unknown> {
  const envJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

  if (envJson) {
    return JSON.parse(envJson) as Record<string, unknown>;
  }

  const serviceAccountPath = path.resolve(process.cwd(), 'firebase-service-account.json');

  if (existsSync(serviceAccountPath)) {
    return JSON.parse(readFileSync(serviceAccountPath, 'utf-8')) as Record<string, unknown>;
  }

  throw new Error('Firebase service account credentials are missing.');
}

const app = getApps().length
  ? getApps()[0]
  : initializeApp({
      credential: cert(loadServiceAccount()),
    });

export const firebaseAdminAuth = getAuth(app);
