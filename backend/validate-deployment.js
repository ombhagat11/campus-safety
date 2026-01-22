#!/usr/bin/env node

/**
 * Pre-deployment validation script
 * Run this before deploying to Vercel to catch common issues
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REQUIRED_FILES = [
    'package.json',
    'vercel.json',
    '.vercelignore',
    'index.js',
    'src/app.js',
    'src/config/env.js',
];

const REQUIRED_ENV_VARS = [
    'MONGODB_URI',
    'CLERK_SECRET_KEY',
    'CLERK_PUBLISHABLE_KEY',
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
    'FRONTEND_URL',
];

const OPTIONAL_ENV_VARS = [
    'EMAIL_HOST',
    'EMAIL_USER',
    'REDIS_HOST',
];

console.log('🔍 Running pre-deployment validation...\n');

let hasErrors = false;
let hasWarnings = false;

// Check required files
console.log('📁 Checking required files...');
REQUIRED_FILES.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        console.log(`  ✅ ${file}`);
    } else {
        console.log(`  ❌ ${file} - MISSING`);
        hasErrors = true;
    }
});

// Check package.json
console.log('\n📦 Checking package.json...');
try {
    const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
    
    if (packageJson.type === 'module') {
        console.log('  ✅ ES modules enabled');
    } else {
        console.log('  ⚠️  Not using ES modules');
        hasWarnings = true;
    }
    
    if (packageJson.scripts && packageJson.scripts.start) {
        console.log('  ✅ Start script defined');
    } else {
        console.log('  ❌ Start script missing');
        hasErrors = true;
    }
    
    // Check for problematic dependencies
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    if (deps['socket.io']) {
        console.log('  ⚠️  Socket.io detected - will be disabled on Vercel');
        hasWarnings = true;
    }
    if (deps['bull']) {
        console.log('  ⚠️  Bull queue detected - may not work on Vercel');
        hasWarnings = true;
    }
} catch (error) {
    console.log('  ❌ Error reading package.json:', error.message);
    hasErrors = true;
}

// Check vercel.json
console.log('\n⚙️  Checking vercel.json...');
try {
    const vercelJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'vercel.json'), 'utf8'));
    
    if (vercelJson.version === 2) {
        console.log('  ✅ Vercel version 2');
    } else {
        console.log('  ⚠️  Not using Vercel version 2');
        hasWarnings = true;
    }
    
    if (vercelJson.builds && vercelJson.builds.length > 0) {
        console.log('  ✅ Builds configured');
    } else {
        console.log('  ❌ No builds configured');
        hasErrors = true;
    }
} catch (error) {
    console.log('  ❌ Error reading vercel.json:', error.message);
    hasErrors = true;
}

// Check environment variables
console.log('\n🔐 Checking environment variables...');
console.log('  (Note: These should be set in Vercel dashboard)\n');

console.log('  Required variables:');
REQUIRED_ENV_VARS.forEach(envVar => {
    console.log(`    - ${envVar}`);
});

console.log('\n  Optional variables:');
OPTIONAL_ENV_VARS.forEach(envVar => {
    console.log(`    - ${envVar}`);
});

// Check for .env file (should not be deployed)
if (fs.existsSync(path.join(__dirname, '.env'))) {
    console.log('\n  ⚠️  .env file found - ensure it\'s in .gitignore');
    hasWarnings = true;
}

// Check .gitignore
console.log('\n📝 Checking .gitignore...');
try {
    const gitignore = fs.readFileSync(path.join(__dirname, '.gitignore'), 'utf8');
    if (gitignore.includes('.env')) {
        console.log('  ✅ .env is ignored');
    } else {
        console.log('  ⚠️  .env not in .gitignore');
        hasWarnings = true;
    }
    if (gitignore.includes('node_modules')) {
        console.log('  ✅ node_modules is ignored');
    } else {
        console.log('  ⚠️  node_modules not in .gitignore');
        hasWarnings = true;
    }
} catch (error) {
    console.log('  ⚠️  .gitignore not found');
    hasWarnings = true;
}

// Final summary
console.log('\n' + '='.repeat(50));
if (hasErrors) {
    console.log('❌ VALIDATION FAILED - Fix errors before deploying');
    process.exit(1);
} else if (hasWarnings) {
    console.log('⚠️  VALIDATION PASSED WITH WARNINGS');
    console.log('   Review warnings before deploying');
    process.exit(0);
} else {
    console.log('✅ VALIDATION PASSED - Ready to deploy!');
    console.log('\nNext steps:');
    console.log('  1. Set environment variables in Vercel dashboard');
    console.log('  2. Run: vercel --prod');
    console.log('  3. Test deployed endpoints');
    process.exit(0);
}
