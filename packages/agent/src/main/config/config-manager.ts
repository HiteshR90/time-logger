import Store from "electron-store";
import { apiRequest } from "../api-client";
import { DEFAULTS } from "@time-tracker/shared";

const store = new Store();

export interface AgentConfig {
  screenshotIntervalMin: number;
  idleTimeoutMin: number;
  blurScreenshots: boolean;
  appCategories: Array<{ pattern: string; category: string }>;
}

function getDefaultConfig(): AgentConfig {
  return {
    screenshotIntervalMin: DEFAULTS.SCREENSHOT_INTERVAL_MIN,
    idleTimeoutMin: DEFAULTS.IDLE_TIMEOUT_MIN,
    blurScreenshots: false,
    appCategories: [],
  };
}

export function loadCachedConfig(): AgentConfig {
  const cached = store.get("agentConfig") as AgentConfig | undefined;
  return cached ?? getDefaultConfig();
}

export async function fetchConfig(): Promise<AgentConfig> {
  try {
    const { data } = await apiRequest("/organizations/me");
    const settings = data.settings as any;

    const config: AgentConfig = {
      screenshotIntervalMin:
        settings?.screenshotIntervalMin ?? DEFAULTS.SCREENSHOT_INTERVAL_MIN,
      idleTimeoutMin: settings?.idleTimeoutMin ?? DEFAULTS.IDLE_TIMEOUT_MIN,
      blurScreenshots: settings?.blurScreenshots ?? false,
      appCategories: settings?.appCategories ?? [],
    };

    store.set("agentConfig", config);
    return config;
  } catch {
    return loadCachedConfig();
  }
}
