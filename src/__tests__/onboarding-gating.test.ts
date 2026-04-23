import { describe, expect, it } from 'vitest'
import { shouldShowOnboarding } from '../lib/onboarding-gate'

describe('onboarding gate', () => {
  it('shows onboarding only for very first install (no users + not completed)', () => {
    expect(shouldShowOnboarding({ hasUsers: false, hasCompletedOnboarding: false })).toBe(true)
  })

  it('does not show onboarding when users already exist, even on a fresh device/PWA install', () => {
    expect(shouldShowOnboarding({ hasUsers: true, hasCompletedOnboarding: false })).toBe(false)
  })

  it('does not show onboarding when completed flag is true', () => {
    expect(shouldShowOnboarding({ hasUsers: true, hasCompletedOnboarding: true })).toBe(false)
    expect(shouldShowOnboarding({ hasUsers: false, hasCompletedOnboarding: true })).toBe(false)
  })
})
