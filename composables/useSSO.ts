export const useSSO = () => {
  const config = useRuntimeConfig()

  const getSSOUrl = (action: 'login' | 'register' = 'login', returnUrl?: string) => {
    const ssoBase = config.public.ssoUrl as string
    const serviceDomain = config.public.serviceDomain as string

    // Constuction de l'URL de base
    const url = new URL(`${ssoBase}/auth/authorize`)

    // Paramètres
    url.searchParams.set('serviceId', String(config.public.serviceId))
    url.searchParams.set('action', action)

    // URL de retour
    if (returnUrl) {
      url.searchParams.set('returnUrl', returnUrl)
    } else {
      if (serviceDomain) {
        // Retrait d'un slash si l'url se termine par '/'
        const domain = serviceDomain.endsWith('/') ? serviceDomain.slice(0, -1) : serviceDomain
        url.searchParams.set('returnUrl', `${domain}/db`)
      } else if (process.client) {
        // Retour à la page actuelle si le serviceDomain est manquant
        url.searchParams.set('returnUrl', window.location.href)
      }
    }

    return url.toString()
  }

  return {
    getSSOUrl
  }
}
