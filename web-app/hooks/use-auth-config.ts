import { 
  authConfig, 
  type AuthMethod, 
  type AuthConfig,
  getEnabledAuthMethods,
  isAuthMethodEnabled,
  hasMultipleAuthMethods,
  hasSingleAuthMethod,
  getPrimaryAuthMethod
} from "@/config/auth"

export function useAuthConfig() {
  return {
    config: authConfig,
    methods: authConfig.methods,
    redirects: authConfig.redirects,
    features: authConfig.features,
    getEnabledMethods: getEnabledAuthMethods,
    isMethodEnabled: isAuthMethodEnabled,
    hasMultipleMethods: hasMultipleAuthMethods,
    hasSingleMethod: hasSingleAuthMethod,
    getPrimaryMethod: getPrimaryAuthMethod,
  }
}