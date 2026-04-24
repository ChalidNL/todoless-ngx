/**
 * Onboarding gate — determines which onboarding screen to show (if any).
 *
 * Three scenarios:
 *   1. First-ever user (no users exist) → admin onboarding
 *   2. Existing user who hasn't seen onboarding → user onboarding
 *   3. User already onboarded → skip
 */
export type OnboardingMode = 'admin' | 'user' | 'none'

export function getOnboardingMode(input: {
  hasUsers: boolean
  isAuthenticated: boolean
  hasUserSeenOnboarding: boolean
}): OnboardingMode {
  const { hasUsers, isAuthenticated, hasUserSeenOnboarding } = input

  // Scenario 1: very first install — no users yet
  if (!hasUsers) return 'admin'

  // Scenario 2: users exist, current user authenticated but hasn't seen onboarding
  if (isAuthenticated && !hasUserSeenOnboarding) return 'user'

  // Scenario 3: already onboarded or not authenticated (→ show login)
  return 'none'
}
