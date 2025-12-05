module.exports = {
  friendlyName: 'Générer un QR code pour un lien court (authentifié)',
  description: 'Génère un QR code personnalisé pour un lien court existant, réservé au propriétaire.',

  inputs: {
    id: {
      type: 'string',
      required: true,
      description: 'ID du lien court pour lequel générer un QR code.',
    },
    title: {
      type: 'string',
      description: 'Le titre du QR code.',
    },
    format: {
      type: 'string',
      defaultsTo: 'png',
      isIn: ['png', 'svg', 'jpeg', 'webp'],
      description: 'Le format d\'image du QR code.',
    },
    size: {
      type: 'number',
      defaultsTo: 300,
      min: 100,
      max: 2000,
      description: 'Taille du QR code en pixels (carré).',
    },
    quality: {
      type: 'number',
      defaultsTo: 92,
      min: 1,
      max: 100,
      description: 'Qualité de l\'image (pour JPEG/WebP).',
    },
    foregroundColor: {
      type: 'string',
      defaultsTo: '#000000',
      description: 'Couleur de premier plan (pixels du QR code) en format hexadécimal.',
    },
    backgroundColor: {
      type: 'string',
      defaultsTo: '#FFFFFF',
      description: 'Couleur d\'arrière-plan en format hexadécimal.',
    },
    errorCorrectionLevel: {
      type: 'string',
      defaultsTo: 'M',
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
    logoFile: {
      type: 'ref',
      description: 'Fichier image du logo à intégrer au centre du QR code.',
    },
    logoSize: {
      type: 'number',
      defaultsTo: 20,
      min: 5,
      max: 30,
      description: 'Taille du logo en pourcentage de la taille totale du QR code.',
    },
    addSignature: {
      type: 'boolean',
      defaultsTo: true,
      description: 'Ajouter la signature.',
    },
    signatureColor: {
      type: 'string',
      defaultsTo: '#666666',
      description: 'Couleur de la signature en format hexadécimal.',
    },
    signatureFontSize: {
      type: 'number',
      defaultsTo: 12,
      min: 8,
      max: 24,
      description: 'Taille de la police de la signature.',
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
    notFound: {
      description: 'Lien non trouvé.',
      responseType: 'notFound',
    },
    invalidColor: {
      description: 'Une ou plusieurs couleurs fournies ne respectent pas le format hexadécimal (#RRGGBB ou #RGB).',
      responseType: 'badRequest',
    },
    unauthorized: {
      description: 'Utilisateur non authentifié ou non propriétaire du lien.',
      responseType: 'unauthorized'
    },
    serverError: {
      description: 'Erreur serveur inattendue.',
      responseType: 'serverError',
    },
  },

  fn: async function (inputs, exits) {
    try {
      // Vérification de l'authentification
      if (!this.req.user) {
        return exits.unauthorized({
          message: "Authentification requise."
        });
      }
      const userId = this.req.user.id;

      // Récupérer et vérifier la propriété du lien court
      const link = await EQTShortLink.findOne({
        id: inputs.id,
        createdBy: userId
      });
      if (!link) {
        return exits.unauthorized({
          message: 'Lien non trouvé ou non autorisé.'
        });
      }

      // Vérifier si un QR code existe déjà pour ce lien
      const existingQrCode = await EQTQrCode.findOne({ shortLink: link.id });

      if (existingQrCode) {
        if (inputs.download) {
          // Logique de téléchargement du fichier existant
          const base64Data = existingQrCode.qrCodeBase64.split(',')[1];
          const buffer = Buffer.from(base64Data, 'base64');
          const contentType = existingQrCode.qrCodeBase64.split(';')[0].split(':')[1];

          this.res.set('Content-Type', contentType);
          this.res.set('Content-Disposition', `inline; filename="qrcode-${link.shortCode}.${inputs.format}"`);
          this.res.set('Content-Length', buffer.length);
          return this.res.send(buffer);
        } else {
          return exits.success({
            message: 'Un QR code existe déjà pour ce lien.',
            qrCode: existingQrCode,
          });
        }
      }

      const qrcodeInputs = _.omit(inputs, ['id', 'download']);

      // Génération du QR code
      const { buffer, contentType } = await sails.helpers.utils.qrCodeGenerator.with({
        data: link.shortLink,
        ...qrcodeInputs,
      });

      // Enregistrement en base de données avec créateur
      const qrCodeBase64 = `data:${contentType};base64,${buffer.toString('base64')}`;
      const newQrCode = await EQTQrCode.create({
        title: inputs.title || `QRCode pour ${link.shortLink}`,
        shortLink: link.id,
        qrCodeBase64: qrCodeBase64,
        qrCodeType: 'shortlink',
        createdBy: userId,
        options: { ...qrcodeInputs },
      }).fetch();

      await EQTShortLink.updateOne({ id: link.id }).set({ qrCode: newQrCode.id });

      // Gestion de la réponse
      if (inputs.download) {
        this.res.set('Content-Type', contentType);
        this.res.set('Content-Disposition', `inline; filename="qrcode-${link.shortCode}.${inputs.format}"`);
        this.res.set('Content-Length', buffer.length);
        return this.res.send(buffer);
      }

      return exits.success({
        message: 'QR code généré et enregistré avec succès.',
        qrCode: newQrCode,
      });

    } catch (err) {
      if (err.message === 'invalidColor') {
        return exits.invalidColor({ message: 'Format de couleur invalide. Utilisez le format hexadécimal (#RRGGBB ou #RGB).' });
      }
      sails.log.error('Erreur génération QR code authentifié:', err);
      return exits.serverError({ message: 'Erreur serveur inattendue.', error: err.message });
    }
  },
};
