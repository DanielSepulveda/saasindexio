import path from "path";
import { Interval } from "@interval/sdk";

const interval = new Interval({
  apiKey: process.env.INTERVAL_KEY,
  routesDirectory: path.resolve(__dirname, "routes"),
});

void interval.listen();
