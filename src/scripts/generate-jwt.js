#!/usr/bin/env node

/**
 * Generate JWT tokens for Supabase
 * 
 * Usage:
 *   node scripts/generate-jwt.js <secret>
 * 
 * Example:
 *   node scripts/generate-jwt.js my-super-secret-jwt-token
 */

const crypto = require('crypto');

function base64url(input) {
  return input
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function generateJWT(secret, payload) {
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };

  const encodedHeader = base64url(Buffer.from(JSON.stringify(header)));
  const encodedPayload = base64url(Buffer.from(JSON.stringify(payload)));
  
  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest();
  
  const encodedSignature = base64url(signature);
  
  return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
}

// Get secret from command line argument
const secret = process.argv[2];

if (!secret) {
  console.error('❌ Error: Please provide a JWT secret as an argument');
  console.log('\nUsage:');
  console.log('  node scripts/generate-jwt.js <secret>');
  console.log('\nExample:');
  console.log('  node scripts/generate-jwt.js my-super-secret-jwt-token');
  console.log('\nTo generate a random secret:');
  console.log('  openssl rand -base64 32');
  process.exit(1);
}

if (secret.length < 32) {
  console.warn('⚠️  Warning: JWT secret should be at least 32 characters long!');
  console.log('   Current length:', secret.length);
  console.log('\n');
}

// Generate tokens
const anonPayload = {
  iss: 'supabase',
  role: 'anon',
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + (10 * 365 * 24 * 60 * 60) // 10 years
};

const serviceRolePayload = {
  iss: 'supabase',
  role: 'service_role',
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + (10 * 365 * 24 * 60 * 60) // 10 years
};

const anonToken = generateJWT(secret, anonPayload);
const serviceRoleToken = generateJWT(secret, serviceRolePayload);

console.log('✅ JWT Tokens Generated Successfully!\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log('Add these to your .env file:\n');
console.log('JWT_SECRET=' + secret);
console.log('ANON_KEY=' + anonToken);
console.log('SERVICE_ROLE_KEY=' + serviceRoleToken);
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log('⚠️  SECURITY NOTES:');
console.log('   • Keep SERVICE_ROLE_KEY secret - it has full database access!');
console.log('   • ANON_KEY is safe to use in client-side code');
console.log('   • Change these tokens before going to production');
console.log('   • Never commit .env files to version control\n');
