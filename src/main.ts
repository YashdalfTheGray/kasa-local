import express from 'express';
import { Client, Device, Sysinfo } from 'tplink-smarthome-api';
import morgan from 'morgan';
import helmet from 'helmet';

interface ExtractedDeviceDetails {
  host: Device['host'];
  alias: Sysinfo['alias'];
}

const wrap =
  (fn: express.RequestHandler) =>
  (...args: Parameters<express.RequestHandler>) =>
    Promise.resolve(fn(...args)).catch(args[2]);

const app = express();
app.use(morgan('combined'));
app.use(express.json());
app.use(helmet());

const port = process.env.PORT || process.argv[2] || 8080;

const client = new Client();

const devices: Map<string, ExtractedDeviceDetails> = new Map();

client
  .on('device-new', async (device: Device) => {
    const deviceInfo = await device.getSysInfo();

    if (!devices.has(deviceInfo.deviceId)) {
      devices.set(deviceInfo.deviceId, {
        host: device.host,
        alias: deviceInfo.alias,
      });
    }

    console.log(`Found new device on host ${device.host}`);
  })
  .startDiscovery();

client.on('error', (e) => {
  console.error(e);
});
client.on('discovery-invalid', (e) => {
  console.error(e);
});

const intervalHandler = setInterval(() => {
  console.log('Restarting discovery');
  client.stopDiscovery();
  client.startDiscovery();
}, 5 * 60 * 1000);

app.get('/', (_, res) => {
  res.sendStatus(200);
});

app.get(
  '/devices',
  wrap((_, res) => {
    res.json(
      [...devices.entries()].map(([id, { host, alias }]) => ({
        id,
        host,
        alias,
      }))
    );
  })
);

app.post(
  '/device-toggle',
  wrap(async (req, res) => {
    try {
      const { hostAddress } = req.body;
      const device = await client.getDevice({ host: hostAddress });
      const result = await device.togglePowerState();
      res.send(result);
    } catch {
      res.sendStatus(500);
    }
  })
);

app.listen(port, () => {
  console.log(`Server running on ${port}`);
});

process.on('exit', () => {
  console.log(`Gracefully shutting down server`);
  clearInterval(intervalHandler);
  client.stopDiscovery();
});

process.on('SIGINT', () => {
  process.exit(0);
});
