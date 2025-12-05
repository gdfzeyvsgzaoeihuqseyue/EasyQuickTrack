module.exports = {

  /**
   * * ===============================================
   * PUBLIQUES
   * * ===============================================
   */
  'GET /api/v1/public/eqt/qrCode/create-sht-qrcode/:identifier': {
    action: 'eqt/public/create-public-sht-qrcode'
  },
  'GET /api/v1/public/eqt/create-url-qrcode': {
    action: 'eqt/public/qrCode/create-public-url-qrcode'
  },
  'POST /api/v1/public/eqt/create-url-qrcode': {
    action: 'eqt/public/qrcode/create-public-url-qrcode'
  },
  'GET /api/v1/public/eqt/get-qrcode': {
    action: 'eqt/public/qrcode/get-all-public-qrcode'
  },
  'GET /api/v1/public/eqt/get-qrcode/:id': {
    action: 'eqt/public/qrcode/get-one-user-qrcode'
  },

  /**
   * * ===============================================
   * UTILISATEUR
   * * ===============================================
   */
  'GET /api/v1/user/eqt/create-sht-qrcode/:id': {
    policy: ['is-user'],
    action: 'eqt/user/qrCode/create-user-sht-qrcode'
  },
  'GET /api/v1/user/eqt/create-url-qrcode': {
    policy: ['is-user'],
    action: 'eqt/user/qrCode/create-user-url-qrcode'
  },
  'POST /api/v1/user/eqt/create-url-qrcode': {
    policy: ['is-user'],
    action: 'eqt/user/qrcode/create-user-url-qrcode'
  },
  'GET /api/v1/user/eqt/get-qrcode': {
    policy: ['is-user'],
    action: 'eqt/user/qrcode/get-all-user-qrcode'
  },
  'GET /api/v1/user/eqt/get-qrcode/:id': {
    policy: ['is-user'],
    action: 'eqt/user/qrcode/get-one-user-qrcode'
  },

};
