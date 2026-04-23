export function shouldShowOnboarding(input: { hasUsers: boolean; hasCompletedOnboarding: boolean }): boolean {
  const { hasUsers, hasCompletedOnboarding } = input

  if (hasCompletedOnboarding) return false
  if (!hasUsers) return true

  return false
}
