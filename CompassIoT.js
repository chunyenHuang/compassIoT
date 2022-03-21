const axios = require('axios');
const qs = require('qs');

const getBasicToken = (id, secret) => Buffer.from([id, secret].join(':')).toString('base64');

module.exports = class CompassIoT {
  constructor({
    env = 'sandbox',
    clientId,
    clientSecret,
  }) {
    this.env = env;
    this.apiUrl = env === 'sandbox' ? 'https://api.compassiot.cloud' : 'https://api.compassiot.cloud';
    this.clientId = clientId;
    this.clientSecret = clientSecret;
  }

  async getApiHeaders() {
    const { accessTokenExpiredAt } = this;

    if (!accessTokenExpiredAt || (accessTokenExpiredAt && accessTokenExpiredAt >= Date.now())) {
      await this.getAccessToken();
    }

    const { accessToken } = this;

    return {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
    };
  }

  async request(options) {
    try {
      const { data } = await axios(Object.assign(options, {
        headers: options.headers || (await this.getApiHeaders()),
      }));
      return data;
    } catch (e) {
      throw new Error(JSON.stringify(e.response.data));
    }
  }

  async getAccessToken() {
    const { apiUrl, clientId, clientSecret } = this;

    const options = {
      method: 'POST',
      url: `${apiUrl}/auth`,
      data: qs.stringify({
        grant_type: 'client_credentials',
      }),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        authorization: `Basic ${getBasicToken(clientId, clientSecret)}`,
      },
    };
    const data = await this.request(options);
    this.accessToken = data.access_token;
    this.accessTokenExpiredAt = Date.now() + data.expires_in * 1000;
  }

  async createFleet(fleetName) {
    const { apiUrl } = this;
    const options = {
      method: 'POST',
      url: `${apiUrl}/fleet/twirp.fleet.FleetService/CreateFleet`,
      data: {
        name: fleetName,
      },
      headers: await this.getApiHeaders(),
    };

    return this.request(options);
  }

  async listFleetVehicles(fleetName, page = 0) {
    const { apiUrl } = this;
    const options = {
      method: 'POST',
      url: `${apiUrl}/fleet/twirp.fleet.FleetService/ListFleetVehicles`,
      data: {
        fleet_name: fleetName,
        page,
      },
    };

    return this.request(options);
  }

  async putVehicles(fleetName, vehicles = []) {
    const { apiUrl } = this;
    const options = {
      method: 'POST',
      url: `${apiUrl}/fleet/twirp.fleet.FleetService/PutVehicles`,
      data: {
        fleet_name: fleetName,
        vehicles,
      },
    };

    return this.request(options);
  }

  async getConnectedVehicles(fleetName, startTime, endTime) {
    const { apiUrl } = this;
    const options = {
      method: 'POST',
      url: `${apiUrl}/fleet/twirp.fleet.FleetService/GetConnectedVehiclesProposal2`,
      data: {
        fleet_name: fleetName,
        start_time: startTime,
        end_time: endTime,
      },
    };

    return this.request(options);
  }
};
