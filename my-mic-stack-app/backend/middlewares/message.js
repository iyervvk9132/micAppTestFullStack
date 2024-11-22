const Nexmo = require("nexmo"); // Nexmo for SMS communication

/**
 * @constant nexmo
 * @description Nexmo SMS API configuration.
 * @property {string} apiKey - Nexmo API key.
 * @property {string} apiSecret - Nexmo API secret.
 */
const nexmo = new Nexmo({
    apiKey: "9554da47",
    apiSecret: "SR1K1dNZ8rx7dJAK",
  });

  module.exports = nexmo;
