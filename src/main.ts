import { Client } from 'tplink-smarthome-api';

const client = new Client();

client.startDiscovery().on('device-new', (device) => {
  // tslint:disable-next-line:no-console
  device.getSysInfo().then(console.log);
});
