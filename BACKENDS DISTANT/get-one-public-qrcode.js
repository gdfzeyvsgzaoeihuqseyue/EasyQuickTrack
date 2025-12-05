module.exports = {
  friendlyName: 'Obtenir un QR code invité par ID',
  description: 'Récupère un QR code spécifique créé en tant qu\'invité, vérifié par jeton.',

  inputs: {
    id: {
      type: 'string',
      required: true,
      description: 'ID du QR code à récupérer.'
    },
    guestAccessToken: {
      type: 'string',
      required: true,
      description: 'Token d\'accès pour le QR code ou le lien associé.'
    },
    download: {
      type: 'boolean',
      defaultsTo: true,
      description: 'Si vrai, renvoie le fichier QR code directement au lieu du JSON.'
    }
  },

  exits: {
    success: {
      description: 'QR code trouvé et renvoyé avec succès.'
    },
    unauthorized: {
      description: 'Token invalide, expiré ou accès non autorisé.',
      responseType: 'unauthorized'
    },
    notFound: {
      description: 'QR code non trouvé.',
      responseType: 'notFound'
    },
    serverError: {
      description: 'Erreur serveur inattendue.',
      responseType: 'serverError'
    },
  },

  fn: async function (inputs, exits) {
    try {
      // Récupération du QR code et vérification du statut invité
      const qrCode = await EQTQrCode.findOne({
        id: inputs.id,
        createdBy: null,
      }).populate('shortLink');

      if (!qrCode) {
        return exits.notFound({ message: 'QR code non trouvé.' });
      }

      // Vérification d'accès via le token
      let hasAccess = false;

      // Le QR code est associé à un lien court invité
      if (qrCode.shortLink && qrCode.shortLink.isGuestLink && qrCode.shortLink.guestAccessToken === inputs.guestAccessToken) {
        hasAccess = true;
      }
      
      // Le QR code est un QR code de type 'url'
      if (qrCode.isGuestQrCode && !qrCode.shortLink) {
         const validGuestLink = await EQTShortLink.findOne({ guestAccessToken: inputs.guestAccessToken, isGuestLink: true });
         if (validGuestLink) {
             hasAccess = true;
         }
      }

      if (!hasAccess) {
        return exits.unauthorized({ message: 'Jeton invalide ou accès non autorisé à cette ressource.' });
      }

      // Gestion du téléchargement binaire
      if (inputs.download) {
        const base64Data = qrCode.qrCodeBase64.split(',')[1];
        const buffer = Buffer.from(base64Data, 'base64');
        const contentType = qrCode.qrCodeBase64.split(';')[0].split(':')[1];
        this.res.set('Content-Type', contentType);
        this.res.set('Content-Disposition', `inline; filename="qrcode-guest-${inputs.id}.${qrCode.options.format || 'png'}"`);
        this.res.set('Content-Length', buffer.length);
      
        return this.res.send(buffer);
      }

      // Renvoi des données JSON
      return exits.success({
        message: 'QR code invité récupéré avec succès.',
        qrCode: qrCode
      });

    } catch (err) {
      sails.log.error('Erreur lors de la récupération du QR code invité:', err);
      return exits.serverError({ message: 'Erreur serveur inattendue.', error: err.message });
    }
  },
};
