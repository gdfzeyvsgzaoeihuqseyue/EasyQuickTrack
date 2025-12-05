module.exports = {
  friendlyName: 'Obtenir mes QR codes',
  description: 'Renvoie une liste paginée des QR codes créés par l\'utilisateur connecté.',

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
      max: 100,
    },
  },

  exits: {
    success: {
      statusCode: 200,
      description: 'La liste de QR codes personnels a été renvoyée.',
      responseType: 'ok',
    },
    unauthorized: {
      statusCode: 401,
      description: 'Utilisateur non authentifié.',
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
      // Vérification de l'authentification
      if (!this.req.user) {
        return exits.unauthorized({
          success: false,
          message: "Authentification requise."
        });
      }

      const userId = this.req.user.id;
      const skip = (inputs.page - 1) * inputs.limit;

      // Construire le critère de recherche
      let criteria = { createdBy: userId };
      
      const totalQrCodes = await EQTQrCode.count(criteria);

      // Récupérer les QR codes
      const qrCodes = await EQTQrCode.find(criteria)
        .populate('shortLink')
        .skip(skip)
        .limit(inputs.limit)
        .sort('createdAt DESC');

      const totalPages = Math.ceil(totalQrCodes / inputs.limit);

      return exits.success({
        success: true,
        message: "Liste de vos QR codes récupérée avec succès.",
        nb: totalQrCodes,
        nbOnPage: qrCodes.length,
        currentPage: inputs.page,
        totalPages: totalPages,
        data: qrCodes,
      });

    } catch (err) {
      sails.log.error('Erreur lors de la récupération des QR codes personnels:', err);
      return exits.serverError({
        message: 'Une erreur serveur s\'est produite.',
        error: err.message
      });
    }
  },
};
