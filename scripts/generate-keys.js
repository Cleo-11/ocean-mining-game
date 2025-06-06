const { randomBytes } = require("crypto")

function generateSecureKey(bytes = 32) {
  return randomBytes(bytes).toString("hex")
}

console.log("🔐 Ocean Mining Game - Security Key Generator")
console.log("=".repeat(50))
console.log()

const jwtSecret = generateSecureKey()
const adminSecret = generateSecureKey()

console.log("📋 Copy these to your environment variables:")
console.log()
console.log(`JWT_SECRET=${jwtSecret}`)
console.log(`ADMIN_SECRET_KEY=${adminSecret}`)
console.log()

console.log("🔧 For Vercel deployment:")
console.log("1. Go to your Vercel dashboard")
console.log("2. Select your project")
console.log("3. Go to Settings → Environment Variables")
console.log("4. Add the variables above")
console.log("5. Redeploy your project")
console.log()

console.log("💡 For local development:")
console.log("Add these to your .env.local file")
