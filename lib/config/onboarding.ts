// Feature flag for the public /setup admin-creation flow.
//
// Set NEXT_PUBLIC_ENABLE_ONBOARDING="false" to disable the public setup route
// entirely (e.g. when seeding the first admin via SQL on a hardened deployment).
// When unset or "true", the existing first-admin onboarding works as before.
export function isOnboardingEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_ONBOARDING !== 'false'
}
