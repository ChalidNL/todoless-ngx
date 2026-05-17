/**
 * Onboarding gate — determines which onboarding screen to show (if any).
 *
 * Four scenarios:
 *   1. First-ever user (no users exist) → admin onboarding (create account + family)
 *   2. Setup complete + not authenticated → info onboarding (read-only slides, then login)
 *   3. Authenticated user who hasn't seen onboarding → user onboarding
 *   4. All good → skip
 */
export type OnboardingMode = 'admin' | 'user' | 'info' | 'none'

export function getOnboardingMode(input: {
  hasUsers: boolean
  isAuthenticated: boolean
  hasUserSeenOnboarding: boolean
  setupComplete?: boolean
}): OnboardingMode {
  const { hasUsers, isAuthenticated, hasUserSeenOnboarding, setupComplete } = input

  // Scenario 1: very first install — no users yet
  if (!hasUsers) return 'admin'

  // Scenario 2: setup not complete and not authenticated → onboarding required
  // This keeps first-run UX consistent even when a bootstrap user already exists.
  if (!isAuthenticated && !setupComplete) return 'admin'

  // Scenario 3: setup complete, not logged in → info mode (slides + go to login)
  if (!isAuthenticated && setupComplete) return 'info'

  // Scenario 4: authenticated but hasn't seen onboarding
  if (isAuthenticated && !hasUserSeenOnboarding) return 'user'

  // Scenario 5: already onboarded
  return 'none'
}
