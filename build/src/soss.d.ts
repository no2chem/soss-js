/**
 * Describes station statuses.
 *  Status information from:
 *  Station Operational Status System (SOSS) 3.0 Implementation, SOSS 3.1
 * Upgrade, and Station Map Upgrade Project
 *  https://www.hydrogen.energy.gov/pdfs/review16/tv027_xiong_2016_o.pdf
 */
export declare enum StationStatus {
    /**
     * Online:
     * Station can deliver SOC > 95%
     * Boost compressor online
     * High pressure storage online
     * Chiller online
     * H2 source online
     * POS online
     */
    ONLINE = "online",
    /**
     * Station can still deliver fuel but SOC<=95%
     * Boost compressor offline
     * High pressure storage offline
     * Chiller online
     * H2 source offline
     * POS online
     */
    LIMITED = "limited",
    /**
     * Station cannot deliver fuel
     * Boost compressor offline
     * High pressure storage offline
     * Chiller offline
     * H2 source offline
     * POS offline
     */
    OFFLINE = "offline",
    UNKNOWN = "unknown",
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
/**
 * Get the status of all stations in SOSS.
 *
 * @returns {Promise<Station[]>}    An array of all stations in SOSS.
 */
export declare const getStatus: () => Promise<Station[]>;
/**
 * Get the static details of a specific station (from CAFCP).
 *
 * @param {string} id                       The ID of the station.
 * @returns {Promise<StationStaticDetail>}  Static information about the station.
 */
export declare const getStationStaticDetails: (id: string) => Promise<StationStaticDetail>;
