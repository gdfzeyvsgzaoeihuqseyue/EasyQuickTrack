export const useSSO = () => {
  const config = useRuntimeConfig()

  const getSSOUrl = (action: 'login' | 'register' = 'login', returnUrl?: string) => {
    const ssoBase = config.public.ssoUrl as string
    const serviceDomain = config.public.serviceDomain as string

    // Construct the base URL for SSO
    const url = new URL(`${ssoBase}/auth/authorize`)

    // Add required parameters
    url.searchParams.set('serviceId', String(config.public.serviceId))
    url.searchParams.set('action', action)

    // Determine return URL
    if (returnUrl) {
      url.searchParams.set('returnUrl', returnUrl)
    } else {
      // Default to serviceDomain/db as requested
      if (serviceDomain) {
        // Remove trailing slash from serviceDomain if present to avoid double slashes
        const domain = serviceDomain.endsWith('/') ? serviceDomain.slice(0, -1) : serviceDomain
        url.searchParams.set('returnUrl', `${domain}/db`)
      } else if (process.client) {
        // Fallback to current location if serviceDomain is missing
        url.searchParams.set('returnUrl', window.location.href)
      }
    }

    return url.toString()
  }

  return {
    getSSOUrl
  }
}
