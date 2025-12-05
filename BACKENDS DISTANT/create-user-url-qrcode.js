module.exports = {
  friendlyName: 'Générer un QR code pour une URL (authentifié)',
  description: 'Génère un code QR personnalisé pour une URL avec toutes les options avancées, signature PGS, et l\'enregistre pour l\'utilisateur.',

  inputs: {
    url: {
      type: 'string',
      required: true,
      description: 'L\'URL pour laquelle générer un code QR.',
      isURL: true,
    },
    title: {
      type: 'string',
      description: 'Le titre du code QR, pour l\'identifier facilement dans la base de données.',
    },
    format: {
      type: 'string',
      defaultsTo: 'png',
      isIn: ['png', 'svg', 'jpeg', 'webp'],
      description: 'Le format d\'image du code QR.',
    },
    size: {
      type: 'number',
      defaultsTo: 300,
      min: 100,
      max: 2000,
      description: 'Taille du code QR en pixels (carré).',
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
      description: 'Couleur de premier plan (pixels du code QR) en format hexadécimal.',
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
      description: 'Marge autour du code QR (en modules).',
    },
    logoFile: {
      type: 'ref',
      description: 'Fichier image du logo à intégrer au centre du code QR.',
    },
    logoSize: {
      type: 'number',
      defaultsTo: 20,
      min: 5,
      max: 30,
      description: 'Taille du logo en pourcentage de la taille totale du code QR.',
    },
    addSignature: {
      type: 'boolean',
      defaultsTo: true,
      description: 'Ajouter la signature en bas du code QR.',
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
      description: 'Si vrai, renvoie le fichier code QR directement au lieu du JSON.',
    },
  },

  exits: {
    success: {
      description: 'Code QR généré et renvoyé avec succès.',
    },
    exists: {
      description: 'Un code QR existe déjà pour cette URL et ces options.',
      responseType: 'ok',
    },
    invalidUrl: {
      description: 'L\'URL fournie n\'est pas valide.',
      responseType: 'badRequest',
    },
    invalidColor: {
      description: 'Une ou plusieurs couleurs fournies ne respectent pas le format hexadécimal (#RRGGBB ou #RGB).',
      responseType: 'badRequest',
    },
    unauthorized: { 
      description: 'Utilisateur non authentifié.', 
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
        return exits.unauthorized({ message: "Authentification requise." });
      }
      const userId = this.req.user.id;
      
      // Vérification de l'existence
      const existingQrCode = await EQTQrCode.findOne({
        qrCodeType: 'url',
        url: inputs.url,
        createdBy: userId,
      });

      if (existingQrCode) {
        if (inputs.download) {
          const base64Data = existingQrCode.qrCodeBase64.split(',')[1];
          const buffer = Buffer.from(base64Data, 'base64');
          const contentType = existingQrCode.qrCodeBase64.split(';')[0].split(':')[1];
          
          this.res.set('Content-Type', contentType);
          this.res.set('Content-Disposition', `inline; filename="qrcode-url.${inputs.format}"`);
          this.res.set('Content-Length', buffer.length);
          return this.res.send(buffer);
        } else {
          return exits.exists({
            message: 'Un code QR existe déjà pour cette URL par votre compte.',
            qrCode: existingQrCode,
          });
        }
      }

      const qrcodeInputs = _.omit(inputs, ['url', 'download']);

      // Génération du QR code
      const { buffer, contentType } = await sails.helpers.utils.qrCodeGenerator.with({
        data: inputs.url,
        ...qrcodeInputs,
      });

      // Enregistrement en base de données avec créateur
      const qrCodeBase64 = `data:${contentType};base64,${buffer.toString('base64')}`;
      const newQrCode = await EQTQrCode.create({
        title: inputs.title || `QRCode pour ${inputs.url}`,
        qrCodeBase64: qrCodeBase64,
        qrCodeType: 'url',
        url: inputs.url,
        createdBy: userId,
        options: { ...qrcodeInputs, url: inputs.url },
      }).fetch();

      // Gestion de la réponse
      if (inputs.download) {
        this.res.set('Content-Type', contentType);
        this.res.set('Content-Disposition', `inline; filename="qrcode-url.${inputs.format}"`);
        this.res.set('Content-Length', buffer.length);
        return this.res.send(buffer);
      }

      return exits.success({
        message: 'Code QR généré et enregistré avec succès.',
        qrCode: newQrCode,
      });

    } catch (err) {
      if (err.message === 'invalidColor') {
        return exits.invalidColor({ message: 'Format de couleur invalide. Utilisez le format hexadécimal (#RRGGBB ou #RGB).' });
      }
      sails.log.error('Erreur génération QR code URL authentifié:', err);
      return exits.serverError({ message: 'Erreur serveur inattendue.', error: err.message });
    }
  },
};
