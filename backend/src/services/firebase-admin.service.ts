import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const serviceAccountPath = path.resolve(process.cwd(), 'firebase-service-account.json');

const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf-8')) as Record<string, unknown>;

const app = getApps().length
  ? getApps()[0]
  : initializeApp({
      credential: cert(serviceAccount),
    });

export const firebaseAdminAuth = getAuth(app);
