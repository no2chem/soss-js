import * as cheerio from 'cheerio';
import * as request from 'request-promise-native';


//#region SOSS messages
/** These are messages supplied by the SOSS API. */
interface SossStationStatus {
  node: SossStationStatusNode;
}

interface SossStationStatusNode {
  enabled35: string;
  enabled70: string;
  fullhours: string;
  modified: string;
  station: string;
  status35: string;
  status70: string;
  title: string;
  unknown: string;
  unknown35: string;
  unknown70: string;
  unknownThreshold: string;
}

interface SossStationMessage {
  node: SossStationMessageNode;
}

interface SossStationMessageNode {
  station: string;
}

interface SossStationMessageData {
  node: SossStationMessageDataNode;
}

interface SossStationMessageDataNode {
  Nid: string;
  body: string;
  display_date_range: string;
  edit: string;
  end_date_display: string;
  flagged: string;
  from_date: string;
  nid: string;
  station_nid: string;
  title: string;
  to_date: string;
}

interface SossLocationData {
  additional: string;
  city: string;
  country: string;
  country_name: string;
  is_primary: string;
  latitude: string;
  longitude: string;
  name: string;
  postal_code: string;
  province: string;
  province_name: string;
  source: string;
  street: string;
}

interface SossStationStaticData {
  location: SossLocationData;
  /** An HTML string. */
  node_view: string;
}
//#endregion

//#region CAFCP SOSS URLs
const cafcpMobileSite = 'https://m.cafcp.org/nocache';
const cafcpSite = 'https://cafcp.org/';
//#endregion

//#region Private Functions
const parseStation = (status: SossStationStatus): Station => {
  const id = status.node.station;
  const name = status.node.title.replace('Status - ', '');
  const status35 = status.node.status35 as StationStatus;
  const status70 = status.node.status70 as StationStatus;
  const updated = new Date(Number(status.node.modified) * 1000);
  return {id, name, status35, status70, updated};
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
export enum StationStatus {
  /**
   * Online:
   * Station can deliver SOC > 95%
   * Boost compressor online
   * High pressure storage online
   * Chiller online
   * H2 source online
   * POS online
   */
  ONLINE = 'online',
  /**
   * Station can still deliver fuel but SOC<=95%
   * Boost compressor offline
   * High pressure storage offline
   * Chiller online
   * H2 source offline
   * POS online
   */
  LIMITED = 'limited',
  /**
   * Station cannot deliver fuel
   * Boost compressor offline
   * High pressure storage offline
   * Chiller offline
   * H2 source offline
   * POS offline
   */
  OFFLINE = 'offline',
  UNKNOWN = 'unknown'
}

/** Dynamic details about a station. */
export interface Station {
  /** The station identifier in SOSS. */
  id: string;
  /** The friendly name of the station. */
  name: string;
  /** The H35 status level. */
  status35: StationStatus;
  /** The H70 status level. */
  status70: StationStatus;
  /** The date the data was updated in SOSS. */
  updated: Date;
  /** Any message posted on the station. */
  message?: string;
}

/** Static information about the station. */
export interface StationStaticDetail {
  /** The latitude of the station. */
  longitude: number;
  /** The longitude of the station. */
  latitude: number;
  /** The country the station is located in. */
  country: string;
  /** The state the station is located in. */
  state: string;
  /** The city the station is located in. */
  city: string;
  /** The street the station is located on. */
  street: string;
  /** The zip code the station is located in. */
  zip: number;
  /**
   * What percent (as a whole percentage, so 100% -> 100), of the station
   *  energy sources are renewable.
   */
  renewable: number;
  /** The type of station (i.e., retail). */
  type: string;
  /** The status of the station. */
  status: string;
  /** When the station was opened (or is anticipated to open). */
  openDate: string;
  /** The pressure levels the station can deliver. */
  pressure: string;
  /** How the station derives hydrogen. */
  source: string;
  /** The hours the station is open, or 24/7 if it is open nonstop. */
  hours: string;
  /** The website of the station operator. */
  website: string;
  /** The customer support number of the station operator. */
  phone: string;
}
//#endregion

//#region Public (exported) Functions
/**
 * Get the status of all stations in SOSS.
 *
 * @returns {Promise<Station[]>}    An array of all stations in SOSS.
 */
export const getStatus = async(): Promise<Station[]> => {
  const status =
      JSON.parse(await request(`${cafcpMobileSite}/soss2-json-status`)) as
      SossStationStatus[];
  const info = JSON.parse(await request(
                   `${cafcpMobileSite}/soss2-json-station-message`)) as
      SossStationMessage[];

  const parsedStatus = status.map(parseStation);
  for (const station of info) {
    const parsedStation = parsedStatus.find(s => s.id === station.node.station);
    if (parsedStation !== undefined) {
      const message =
          JSON.parse(
              await request(`${cafcpMobileSite}/soss2-station-message-output/${
                  station.node.station}`)) as SossStationMessageData[];
      parsedStation.message = message[0].node.body;
    }
  }

  return parsedStatus;
};

const trimOrEmpty = (data?: string): string => {
  return data === undefined ? '' : data.trim();
};
/**
 * Get the static details of a specific station (from CAFCP).
 *
 * @param {string} id                       The ID of the station.
 * @returns {Promise<StationStaticDetail>}  Static information about the station.
 */
export const getStationStaticDetails =
    async(id: string): Promise<StationStaticDetail> => {
  const data =
      JSON.parse(await request(`${cafcpSite}/cafcp-station-details/${id}`)) as
      SossStationStaticData;
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
    renewable: Number((renewableMatch as RegExpExecArray)[1]),
    type: trimOrEmpty(
        $('table').find('tr').eq(2).find('td').eq(1).text() as string),
    status: trimOrEmpty(
        $('table').find('tr').eq(3).find('td').eq(1).text() as string),
    openDate: trimOrEmpty(
        $('table').find('tr').eq(4).find('td').eq(1).text() as string),
    pressure: trimOrEmpty(
        $('table').find('tr').eq(5).find('td').eq(1).text() as string),
    source: trimOrEmpty(
        $('table').find('tr').eq(6).find('td').eq(1).text() as string),
    hours: trimOrEmpty(
        $('table').find('tr').eq(7).find('td').eq(1).text() as string),
    website: trimOrEmpty(
        $('table').find('tr').eq(8).find('td').eq(1).find('a').attr('href') as
        string),
    phone: trimOrEmpty(
        $('table').find('tr').eq(9).find('td').eq(1).html() as string)
  };
};
//#endregion
