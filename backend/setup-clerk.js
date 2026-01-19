#!/usr/bin/env node

/**
 * Clerk Setup Wizard
 * Interactive script to configure Clerk authentication
 */

import readline from 'readline';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function main() {
    console.log('\n🔐 Clerk Authentication Setup Wizard\n');
    console.log('This wizard will help you configure Clerk for Campus Safety.\n');

    // Get Clerk credentials
    console.log('📋 Step 1: Clerk Credentials');
    console.log('Get these from: https://dashboard.clerk.com/last-active?path=api-keys\n');

    const secretKey = await question('Enter your Clerk Secret Key (sk_test_...): ');
    const publishableKey = await question('Enter your Clerk Publishable Key (pk_test_...): ');
    const webhookSecret = await question('Enter your Clerk Webhook Secret (whsec_...) [optional]: ');

    // Validate inputs
    if (!secretKey.startsWith('sk_')) {
        console.error('❌ Invalid secret key. Should start with sk_test_ or sk_live_');
        process.exit(1);
    }

    if (!publishableKey.startsWith('pk_')) {
        console.error('❌ Invalid publishable key. Should start with pk_test_ or pk_live_');
        process.exit(1);
    }

    // Update backend .env
    console.log('\n📝 Updating backend .env...');
    const backendEnvPath = path.join(__dirname, '.env');
    let backendEnv = '';

    if (fs.existsSync(backendEnvPath)) {
        backendEnv = fs.readFileSync(backendEnvPath, 'utf8');
    }

    // Update or add Clerk variables
    const updateEnvVar = (env, key, value) => {
        const regex = new RegExp(`^${key}=.*$`, 'm');
        if (regex.test(env)) {
            return env.replace(regex, `${key}=${value}`);
        } else {
            return env + `\n${key}=${value}`;
        }
    };

    backendEnv = updateEnvVar(backendEnv, 'CLERK_SECRET_KEY', secretKey);
    backendEnv = updateEnvVar(backendEnv, 'CLERK_PUBLISHABLE_KEY', publishableKey);
    if (webhookSecret) {
        backendEnv = updateEnvVar(backendEnv, 'CLERK_WEBHOOK_SECRET', webhookSecret);
    }

    fs.writeFileSync(backendEnvPath, backendEnv);
    console.log('✅ Backend .env updated');

    // Update frontend .env
    console.log('\n📝 Updating frontend .env...');
    const frontendEnvPath = path.join(__dirname, '..', 'frontend', '.env');
    let frontendEnv = '';

    if (fs.existsSync(frontendEnvPath)) {
        frontendEnv = fs.readFileSync(frontendEnvPath, 'utf8');
    }

    frontendEnv = updateEnvVar(frontendEnv, 'VITE_CLERK_PUBLISHABLE_KEY', publishableKey);

    fs.writeFileSync(frontendEnvPath, frontendEnv);
    console.log('✅ Frontend .env updated');

    // Next steps
    console.log('\n✨ Setup Complete!\n');
    console.log('📋 Next Steps:\n');
    console.log('1. Set up webhooks:');
    console.log('   - Install ngrok: npm install -g ngrok');
    console.log('   - Start backend: npm run dev');
    console.log('   - In new terminal: ngrok http 5000');
    console.log('   - Add webhook in Clerk dashboard\n');
    console.log('2. Seed campus data:');
    console.log('   - Run: node src/seed.js\n');
    console.log('3. Start the application:');
    console.log('   - Backend: npm run dev');
    console.log('   - Frontend: cd ../frontend && npm run dev\n');
    console.log('4. Test registration:');
    console.log('   - Go to http://localhost:5173/register');
    console.log('   - Use campus code from seeded data\n');
    console.log('📚 For detailed instructions, see CLERK_SETUP_GUIDE.md\n');

    rl.close();
}

main().catch((error) => {
    console.error('❌ Error:', error.message);
    rl.close();
    process.exit(1);
});
