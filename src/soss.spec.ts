import 'mocha';

import * as chai from 'chai';

import * as soss from './soss';


// Needed for should.not.be.undefined.
/* tslint:disable:no-unused-expression */

chai.should();

describe('Get all station data', () => {
  it('should return at least 1 station', async () => {
    const stations = await soss.getStatus();
    stations.length.should.be.at.least(1);
  });
});

describe('Get single station detail', () => {
  it('should at least return location information', async () => {
    const stationDetail = await soss.getStationStaticDetails('15030');
    stationDetail.latitude.should.not.be.undefined;
    stationDetail.longitude.should.not.be.undefined;
    stationDetail.zip.should.not.be.undefined;
    stationDetail.source.should.not.be.undefined;
    stationDetail.city.should.not.be.undefined;
    stationDetail.country.should.not.be.undefined;
    stationDetail.hours.should.not.be.undefined;
    stationDetail.pressure.should.not.be.undefined;
    stationDetail.phone.should.not.be.undefined;
    stationDetail.renewable.should.not.be.undefined;
    stationDetail.renewable.should.not.be.greaterThan(100);
    stationDetail.street.should.not.be.undefined;
    stationDetail.status.should.not.be.undefined;
    stationDetail.type.should.not.be.undefined;
  });
});
