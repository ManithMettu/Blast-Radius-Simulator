import serverless from "serverless-http";
import { buildExpressApp } from "../../dist/app";

const app = buildExpressApp();

export const handler = serverless(app);
