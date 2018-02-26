# California Hydrogen SOSS API

[![Build Status](https://travis-ci.org/no2chem/soss-js.svg?branch=master)](https://travis-ci.org/no2chem/soss-js)

This project enables a user to query the [California Hydrogen Fuel Cell Partnership](https://cafcp.org)'s
Station Operational Status System (SOSS). This is the same data that appears on the California Hydrogen Fuel Cell
Partnership's [station map](https://cafcp.org/stationmap).

You can find API documentation [here](https://no2chem.github.io/soss-js/). Typescript definitions are included.

A quick example which prints the status of all stations in the system:
```typescript
import * as soss from "soss";

async function printStatus() : void {
  let stationStatus = await soss.getStatus();
  console.log(JSON.stringify(stationStatus, null , 2));
};

printStatus();
```

This project is not affiliated in any way with  California Hydrogen Fuel Cell Partnership.