module.exports = {
  friendlyName: 'Obtenir un de mes QR codes par ID',
  description: 'Récupère un QR code spécifique créé par l\'utilisateur connecté.',

  inputs: {
    id: {
      type: 'string',
      required: true,
      description: 'ID du QR code à récupérer.'
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
      description: 'Utilisateur non authentifié ou non propriétaire du QR code.',
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
      // Vérification de l'authentification
      if (!this.req.user) {
        return exits.unauthorized({ message: "Authentification requise." });
      }
      const userId = this.req.user.id;
      
      // Récupération et vérification de la propriété
      const qrCode = await EQTQrCode.findOne({
        id: inputs.id,
        createdBy: userId
      })
      .populate('shortLink');

      if (!qrCode) {
        return exits.unauthorized({
          message: 'QR code non trouvé ou accès non autorisé.'
        });
      }
      
      // Gestion du téléchargement binaire
      if (inputs.download) {
        const base64Data = qrCode.qrCodeBase64.split(',')[1];
        const buffer = Buffer.from(base64Data, 'base64');
        const contentType = qrCode.qrCodeBase64.split(';')[0].split(':')[1];
        this.res.set('Content-Type', contentType);
        this.res.set('Content-Disposition', `inline; filename="qrcode-${inputs.id}.${qrCode.options.format || 'png'}"`);
        this.res.set('Content-Length', buffer.length);
      
        return this.res.send(buffer);
      }

      // Renvoi des données JSON
      return exits.success({
        message: 'QR code personnel récupéré avec succès.',
        qrCode: qrCode
      });

    } catch (err) {
      sails.log.error('Erreur lors de la récupération du QR code personnel:', err);
      return exits.serverError({ message: 'Erreur serveur inattendue.', error: err.message });
    }
  },
};
