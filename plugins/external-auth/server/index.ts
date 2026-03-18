import { PluginManager, Hook } from "@server/utils/PluginManager";
import config from "../plugin.json";
import router from "./auth/external-auth";
import env from "./env";

const enabled = !!env.EXTERNAL_AUTH_CLIENT_ID && !!env.EXTERNAL_AUTH_CLIENT_SECRET;

if (enabled) {
  PluginManager.add([
    {
      ...config,
      type: Hook.AuthProvider,
      value: { router, id: config.id },
    },
  ]);
}