module.exports = {
  friendlyName: 'Générer un QR code pour un lien court (invité)',
  description: 'Génère un QR code de base pour un lien court d\'invité en utilisant le jeton d\'accès.',

  inputs: {
    identifier: {
      type: 'string',
      required: true,
      description: 'ID ou code court (shortCode) du lien invité.',
    },
    guestAccessToken: {
      type: 'string',
      required: true,
      description: 'Le jeton d\'accès pour le lien invité.',
    },
    format: {
      type: 'string',
      defaultsTo: 'png',
      isIn: ['png', 'svg', 'jpeg', 'webp'],
      description: 'Le format d\'image du QR code.',
    },
    size: {
      type: 'number',
      defaultsTo: 250,
      min: 100,
      max: 500,
      description: 'Taille du QR code en pixels (carré).',
    },
    errorCorrectionLevel: {
      type: 'string',
      defaultsTo: 'L',
      isIn: ['L', 'M', 'Q', 'H'],
      description: 'Niveau de correction d\'erreur (L=~7%, M=~15%, Q=~25%, H=~30%).',
    },
    margin: {
      type: 'number',
      defaultsTo: 4,
      min: 0,
      max: 20,
      description: 'Marge autour du QR code (en modules).',
    },
    download: {
      type: 'boolean',
      defaultsTo: true,
      description: 'Si vrai, renvoie le fichier QR code directement au lieu du JSON.',
    },
  },

  exits: {
    success: {
      description: 'QR code généré et renvoyé avec succès.',
    },
    unauthorized: {
      description: 'Jeton invalide ou lien non trouvé.',
      responseType: 'unauthorized'
    },
    linkExpired: {
      description: 'Le lien invité a expiré.',
      responseType: 'badRequest'
    },
    serverError: {
      description: 'Erreur serveur inattendue.',
      responseType: 'serverError',
    },
  },

  fn: async function (inputs, exits) {
    try {
      const now = new Date();

      // Authentification/Vérification du lien invité
      const link = await EQTShortLink.findOne({
        or: [
          { id: inputs.identifier },
          { shortCode: inputs.identifier },
        ],
        isGuestLink: true,
        guestAccessToken: inputs.guestAccessToken,
        createdBy: null,
      });

      if (!link) {
        return exits.unauthorized({
          message: 'Lien invité non trouvé ou jeton invalide.'
        });
      }

      // Vérification d'expiration
      if (link.expiresAt && new Date(link.expiresAt) <= now) {
        return exits.linkExpired({
          message: 'Le lien invité a expiré et ne peut plus être modifié.'
        });
      }

      // Vérifier si un QR code existe déjà pour ce lien
      const existingQrCode = await EQTQrCode.findOne({ shortLink: link.id });

      if (existingQrCode) {
        // Logique de renvoi
        const base64Data = existingQrCode.qrCodeBase64.split(',')[1];
        const buffer = Buffer.from(base64Data, 'base64');
        const contentType = existingQrCode.qrCodeBase64.split(';')[0].split(':')[1];

        this.res.set('Content-Type', contentType);
        this.res.set('Content-Disposition', `inline; filename="qrcode-${link.shortCode}.${inputs.format}"`);
        this.res.set('Content-Length', buffer.length);
        return this.res.send(buffer);
      }

      // Définir les options par défaut pour les invités
      const guestOptions = {
        format: inputs.format,
        size: Math.min(inputs.size, 500),
        foregroundColor: '#000000',
        backgroundColor: '#FFFFFF',
        errorCorrectionLevel: inputs.errorCorrectionLevel,
        margin: Math.min(inputs.margin, 5),
      };

      // Génération du QR code
      const { buffer, contentType } = await sails.helpers.utils.qrCodeGenerator.with({
        data: link.shortLink,
        ...guestOptions,
      });

      // Enregistrement en base de données
      const qrCodeBase64 = `data:${contentType};base64,${buffer.toString('base64')}`;
      const newQrCode = await EQTQrCode.create({
        title: `QRCode Invité pour ${link.shortCode}`,
        shortLink: link.id,
        qrCodeBase64: qrCodeBase64,
        qrCodeType: 'shortlink',
        isGuestQrCode: true,
        options: { ...guestOptions },
      }).fetch();

      // Mettre à jour le lien court avec l'ID du QR code
      await EQTShortLink.updateOne({ id: link.id }).set({ qrCode: newQrCode.id });

      // Gestion de la réponse
      this.res.set('Content-Type', contentType);
      this.res.set('Content-Disposition', `inline; filename="qrcode-${link.shortCode}.${inputs.format}"`);
      this.res.set('Content-Length', buffer.length);
      return this.res.send(buffer);

    } catch (err) {
      sails.log.error('Erreur génération QR code invité:', err);
      return exits.serverError({ message: 'Erreur serveur inattendue.', error: err.message });
    }
  },
};
