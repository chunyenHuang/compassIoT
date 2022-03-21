# compassIoT

## API Docs

- https://api.compassiot.cloud/doc/fleet

## GetStarted

```javascript
const CompassIot = require('compassiot');

const compassIoT = new CompassIoT({ env: 'sandbox', clientId, clientSecret });

//
const result = await compassIoT.createFleet(fleetName);

//
const { vehicles } = await compassIoT.listFleetVehicles(fleetName);

//
const toUpateVehicles1 = [{
  vin: 'abc',
  odo: 0,
}];
await compassIoT.putVehicles(fleetName, toUpateVehicles1);

//
const connectedVehicles = await compassIoT.getConnectedVehicles(fleetName);
```