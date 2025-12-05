module.exports = {
  friendlyName: 'Obtenir les QR codes invités',
  description: 'Renvoie une liste paginée des QR codes créés en tant qu\'invité avec son jeton d\'accès.',

  inputs: {
    page: {
      type: 'number',
      defaultsTo: 1,
      description: 'Le numéro de la page pour la pagination.',
      min: 1,
    },
    limit: {
      type: 'number',
      defaultsTo: 10,
      description: 'Le nombre de QR codes à renvoyer par page.',
      max: 50,
    },
    guestAccessToken: {
      type: 'string',
      required: true,
      description: 'Token d\'accès pour consulter les ressources invitées.',
    },
  },

  exits: {
    success: {
      statusCode: 200,
      description: 'La liste de QR codes invités a été renvoyée.',
      responseType: 'ok',
    },
    unauthorized: {
      statusCode: 401,
      description: 'Token invalide ou non trouvé.',
      responseType: 'unauthorized',
    },
    serverError: {
      statusCode: 500,
      description: 'Une erreur serveur s\'est produite.',
      responseType: 'serverError',
    },
  },

  fn: async function (inputs, exits) {
    try {
      const skip = (inputs.page - 1) * inputs.limit;

      // Construire le critère de recherche
      const criteria = {
        isGuestQrCode: true,
        guestAccessToken: inputs.guestAccessToken,
        createdBy: null,
      };

      // Trouver les IDs de tous les liens invités possédant ce jeton
      const guestLinks = await EQTShortLink.find({
        isGuestLink: true,
        guestAccessToken: inputs.guestAccessToken,
        createdBy: null,
      }).select(['id']);

      const guestLinkIds = guestLinks.map(link => link.id);

      // Définir le critère de recherche des QR codes
      const qrCodeCriteria = {
        or: [
          { shortLink: { in: guestLinkIds } },
          { qrCodeType: 'url', isGuestQrCode: true, createdBy: null }
        ]
      };

      // Si aucun lien invité n'est trouvé, le jeton est invalide
      if (guestLinkIds.length === 0) {
        return exits.unauthorized({
          message: 'Token invalide ou aucun lien invité trouvé pour ce token.'
        });
      }

      const finalCriteria = {
        or: [
          { shortLink: { in: guestLinkIds } },
          { isGuestQrCode: true }
        ]
      };

      const totalQrCodes = await EQTQrCode.count(finalCriteria);

      // Récupérer les QR codes
      const qrCodes = await EQTQrCode.find(finalCriteria)
        .populate('shortLink')
        .skip(skip)
        .limit(inputs.limit)
        .sort('createdAt DESC');

      const totalPages = Math.ceil(totalQrCodes / inputs.limit);

      return exits.success({
        success: true,
        message: "Liste des QR codes invités récupérée.",
        nb: totalQrCodes,
        nbOnPage: qrCodes.length,
        currentPage: inputs.page,
        totalPages: totalPages,
        data: qrCodes,
        warning: 'Cette liste inclut les QR codes associés à vos liens et ceux créés directement via URL.',
      });

    } catch (err) {
      sails.log.error('Erreur lors de la récupération des QR codes invités:', err);
      return exits.serverError({
        message: 'Une erreur serveur s\'est produite.',
        error: err.message
      });
    }
  },
};