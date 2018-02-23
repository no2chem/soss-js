"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var cheerio = require("cheerio");
var request = require("request-promise-native");
//#endregion
//#region CAFCP SOSS URLs
var cafcpMobileSite = 'https://m.cafcp.org/nocache';
var cafcpSite = 'https://cafcp.org/';
//#endregion
//#region Private Functions
var parseStation = function (status) {
    var id = status.node.station;
    var name = status.node.title.replace('Status - ', '');
    var status35 = status.node.status35;
    var status70 = status.node.status70;
    var updated = new Date(Number(status.node.modified) * 1000);
    return { id: id, name: name, status35: status35, status70: status70, updated: updated };
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
exports.getStatus = function () { return __awaiter(_this, void 0, void 0, function () {
    var status, _a, _b, info, _c, _d, parsedStatus, _loop_1, _i, info_1, station;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                _b = (_a = JSON).parse;
                return [4 /*yield*/, request(cafcpMobileSite + "/soss2-json-status")];
            case 1:
                status = _b.apply(_a, [_e.sent()]);
                _d = (_c = JSON).parse;
                return [4 /*yield*/, request(cafcpMobileSite + "/soss2-json-station-message")];
            case 2:
                info = _d.apply(_c, [_e.sent()]);
                parsedStatus = status.map(parseStation);
                _loop_1 = function (station) {
                    var parsedStation, message, _a, _b;
                    return __generator(this, function (_c) {
                        switch (_c.label) {
                            case 0:
                                parsedStation = parsedStatus.find(function (s) { return s.id === station.node.station; });
                                if (!(parsedStation !== undefined)) return [3 /*break*/, 2];
                                _b = (_a = JSON).parse;
                                return [4 /*yield*/, request(cafcpMobileSite + "/soss2-station-message-output/" + station.node.station)];
                            case 1:
                                message = _b.apply(_a, [_c.sent()]);
                                parsedStation.message = message[0].node.body;
                                _c.label = 2;
                            case 2: return [2 /*return*/];
                        }
                    });
                };
                _i = 0, info_1 = info;
                _e.label = 3;
            case 3:
                if (!(_i < info_1.length)) return [3 /*break*/, 6];
                station = info_1[_i];
                return [5 /*yield**/, _loop_1(station)];
            case 4:
                _e.sent();
                _e.label = 5;
            case 5:
                _i++;
                return [3 /*break*/, 3];
            case 6: return [2 /*return*/, parsedStatus];
        }
    });
}); };
/**
 * Get the static details of a specific station (from CAFCP).
 *
 * @param {string} id                       The ID of the station.
 * @returns {Promise<StationStaticDetail>}  Static information about the station.
 */
exports.getStationStaticDetails = function (id) { return __awaiter(_this, void 0, void 0, function () {
    var data, _a, _b, $, renewableRegex, renewableMatch;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _b = (_a = JSON).parse;
                return [4 /*yield*/, request(cafcpSite + "/cafcp-station-details/" + id)];
            case 1:
                data = _b.apply(_a, [_c.sent()]);
                $ = cheerio.load(data.node_view);
                renewableRegex = /Renewable Hydrogen: ([0-9]+)\%/g;
                renewableMatch = renewableRegex.exec($('.renewable-content p').text());
                return [2 /*return*/, {
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
                    }];
        }
    });
}); };
//#endregion
//# sourceMappingURL=soss.js.map