"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const cheerio = require("cheerio");
const request = require("request-promise-native");
//#endregion
//#region CAFCP SOSS URLs
const cafcpMobileSite = 'https://m.cafcp.org/nocache';
const cafcpSite = 'https://cafcp.org/';
//#endregion
//#region Private Functions
const parseStation = (status) => {
    const id = status.node.station;
    const name = status.node.title.replace('Status - ', '');
    const status35 = status.node.status35;
    const status70 = status.node.status70;
    const updated = new Date(Number(status.node.modified) * 1000);
    return { id, name, status35, status70, updated };
};
//#endregion
//#region Public Interfaces
/**
 * Describes station statuses.
 *  Status information from:
 *  Station Operational Status System (SOSS) 3.0 Implementation, SOSS 3.1
 * Upgrade, and Station Map Upgrade Project
 *  https://www.hydrogen.energy.gov/pdfs/review16/tv027_xiong_2016_o.pdf
 */
var StationStatus;
(function (StationStatus) {
    /**
     * Online:
     * Station can deliver SOC > 95%
     * Boost compressor online
     * High pressure storage online
     * Chiller online
     * H2 source online
     * POS online
     */
    StationStatus["ONLINE"] = "online";
    /**
     * Station can still deliver fuel but SOC<=95%
     * Boost compressor offline
     * High pressure storage offline
     * Chiller online
     * H2 source offline
     * POS online
     */
    StationStatus["LIMITED"] = "limited";
    /**
     * Station cannot deliver fuel
     * Boost compressor offline
     * High pressure storage offline
     * Chiller offline
     * H2 source offline
     * POS offline
     */
    StationStatus["OFFLINE"] = "offline";
    StationStatus["UNKNOWN"] = "unknown";
})(StationStatus = exports.StationStatus || (exports.StationStatus = {}));
//#endregion
//#region Public (exported) Functions
/**
 * Get the status of all stations in SOSS.
 *
 * @returns {Promise<Station[]>}    An array of all stations in SOSS.
 */
exports.getStatus = () => __awaiter(this, void 0, void 0, function* () {
    const status = JSON.parse(yield request(`${cafcpMobileSite}/soss2-json-status`));
    const info = JSON.parse(yield request(`${cafcpMobileSite}/soss2-json-station-message`));
    const parsedStatus = status.map(parseStation);
    for (const station of info) {
        const parsedStation = parsedStatus.find(s => s.id === station.node.station);
        if (parsedStation !== undefined) {
            const message = JSON.parse(yield request(`${cafcpMobileSite}/soss2-station-message-output/${station.node.station}`));
            parsedStation.message = message[0].node.body;
        }
    }
    return parsedStatus;
});
/**
 * Get the static details of a specific station (from CAFCP).
 *
 * @param {string} id                       The ID of the station.
 * @returns {Promise<StationStaticDetail>}  Static information about the station.
 */
exports.getStationStaticDetails = (id) => __awaiter(this, void 0, void 0, function* () {
    const data = JSON.parse(yield request(`${cafcpSite}/cafcp-station-details/${id}`));
    const $ = cheerio.load(data.node_view);
    const renewableRegex = /Renewable Hydrogen: ([0-9]+)\%/g;
    const renewableMatch = renewableRegex.exec($('.renewable-content p').text());
    return {
        longitude: Number(data.location.longitude),
        latitude: Number(data.location.latitude),
        country: data.location.country,
        state: data.location.province,
        city: data.location.city,
        street: data.location.street,
        zip: Number(data.location.postal_code),
        renewable: Number(renewableMatch[1]),
        type: $('table').find('tr').eq(2).find('td').eq(1).text().trim(),
        status: $('table').find('tr').eq(3).find('td').eq(1).text().trim(),
        openDate: $('table').find('tr').eq(4).find('td').eq(1).text().trim(),
        pressure: $('table').find('tr').eq(5).find('td').eq(1).text().trim(),
        source: $('table').find('tr').eq(6).find('td').eq(1).text().trim(),
        hours: $('table').find('tr').eq(7).find('td').eq(1).text().trim(),
        website: $('table').find('tr').eq(8).find('td').eq(1).find('a').attr('href')
            .trim(),
        phone: $('table').find('tr').eq(9).find('td').eq(1).html().trim()
    };
});
//#endregion
//# sourceMappingURL=soss.js.map