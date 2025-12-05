module.exports = {
  friendlyName: 'Générer un QR code pour une URL (public)',
  description: 'Génère un code QR de base pour une URL pour les utilisateurs non authentifiés, avec limitation de taux.',

  inputs: {
    url: {
      type: 'string',
      required: true,
      description: 'L\'URL pour laquelle générer un code QR.',
      isURL: true,
    },
    title: {
      type: 'string',
      description: 'Le titre du code QR (ignoré pour les invités).'
    },
    format: {
      type: 'string',
      defaultsTo: 'png',
      isIn: ['png', 'svg', 'jpeg', 'webp']
    },
    size: {
      type: 'number',
      defaultsTo: 250,
      min: 100,
      max: 500
    },
    foregroundColor: {
      type: 'string',
      defaultsTo: '#000000'
    },
    backgroundColor: {
      type: 'string',
      defaultsTo: '#FFFFFF'
    },
    errorCorrectionLevel: {
      type: 'string',
      defaultsTo: 'L',
      isIn: ['L', 'M', 'Q', 'H']
    },
    margin: {
      type: 'number',
      defaultsTo: 2,
      min: 0,
      max: 5
    },
    download: {
      type: 'boolean',
      defaultsTo: true
    },
  },

  exits: {
    success: {
      description: 'Code QR généré et renvoyé avec succès.'
    },
    invalidUrl: {
      description: 'L\'URL fournie n\'est pas valide.',
      responseType: 'badRequest'
    },
    tooManyRequests: {
      description: "Limite de création de QR codes atteinte pour aujourd'hui.",
      responseType: 'tooManyRequests'
    },
    serverError: {
      description: 'Erreur serveur inattendue.', responseType: 'serverError'
    },
  },

  fn: async function (inputs, exits) {
    try {
      const clientIp = this.req.ip || this.req.headers['x-forwarded-for'] || this.req.connection.remoteAddress;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Limiteur de Taux basé sur l'IP
      const qrCodesCreatedToday = await EQTQrCode.count({
        where: {
          createdBy: null,
          isGuestQrCode: true,
          createdAt: { '>=': today.getTime(), '<': tomorrow.getTime() }
        }
      });

      // Limite 2 QR codes par jour par IP
      if (qrCodesCreatedToday >= 2) {
        return exits.tooManyRequests({
          message: 'Limite atteinte: maximum 2 codes QR par jour par adresse IP.',
          limit: 5,
          resetTime: tomorrow.toISOString()
        });
      }

      // Définir les options par défaut
      const publicOptions = {
        format: inputs.format,
        size: Math.min(inputs.size, 500),
        foregroundColor: inputs.foregroundColor,
        backgroundColor: inputs.backgroundColor,
        errorCorrectionLevel: inputs.errorCorrectionLevel,
        margin: Math.min(inputs.margin, 5),
      };

      // Génération du QR code avec les options publiques
      const { buffer, contentType } = await sails.helpers.utils.qrCodeGenerator.with({
        data: inputs.url,
        ...publicOptions,
      });

      // Enregistrement en base de données comme 'Invité'
      const qrCodeBase64 = `data:${contentType};base64,${buffer.toString('base64')}`;
      const newQrCode = await EQTQrCode.create({
        title: `QRCode Public pour ${inputs.url}`,
        qrCodeBase64: qrCodeBase64,
        qrCodeType: 'url',
        url: inputs.url,
        isGuestQrCode: true,
        options: { ...publicOptions, url: inputs.url },
      }).fetch();

      // Gestion de la réponse
      if (inputs.download) {
        this.res.set('Content-Type', contentType);
        this.res.set('Content-Disposition', `inline; filename="qrcode-public-url.${inputs.format}"`);
        this.res.set('Content-Length', buffer.length);
        return this.res.send(buffer);
      }

      return exits.success({
        message: 'Code QR public généré et enregistré avec succès.',
        qrCode: newQrCode,
        note: `Ce code QR a été créé sans options avancées et expirera. Limite journalière: ${qrCodesCreatedToday + 1}/5.`,
      });

    } catch (err) {
      if (err.name === 'UsageError' && err.message.includes('isURL')) {
        return exits.invalidUrl({ message: 'URL invalide fournie.' });
      }
      sails.log.error('Erreur génération QR code URL public:', err);
      return exits.serverError({ message: 'Erreur serveur inattendue.', error: err.message });
    }
  },
};
