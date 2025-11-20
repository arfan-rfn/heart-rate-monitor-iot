export type AuthMethod = "emailPassword" | "magicLink" | "google" | "apple"

export type AuthConfig = {
  methods: {
    emailPassword: boolean
    magicLink: boolean
    google: boolean
    apple: boolean
  }
  redirects: {
    afterSignIn: string
    afterSignUp: string
    afterSignOut: string
  }
  features: {
    rememberMe: boolean
    forgotPassword: boolean
    emailVerification: boolean
  }
}

export const authConfig: AuthConfig = {
  methods: {
    emailPassword: true,
    magicLink: false,
    google: false,
    apple: false,
  },
  redirects: {
    afterSignIn: "/dashboard",
    afterSignUp: "/dashboard",
    afterSignOut: "/",
  },
  features: {
    rememberMe: true,
    forgotPassword: true,
    emailVerification: true,
  },
}

export function getEnabledAuthMethods(): AuthMethod[] {
  const methods: AuthMethod[] = []

  if (authConfig.methods.emailPassword) methods.push("emailPassword")
  if (authConfig.methods.magicLink) methods.push("magicLink")
  if (authConfig.methods.google) methods.push("google")
  if (authConfig.methods.apple) methods.push("apple")

  return methods
}

export function isAuthMethodEnabled(method: AuthMethod): boolean {
  return authConfig.methods[method]
}

export function hasMultipleAuthMethods(): boolean {
  return getEnabledAuthMethods().length > 1
}

export function hasSingleAuthMethod(): boolean {
  return getEnabledAuthMethods().length === 1
}

export function getPrimaryAuthMethod(): AuthMethod | null {
  const enabledMethods = getEnabledAuthMethods()
  return enabledMethods.length > 0 ? enabledMethods[0] : null
}