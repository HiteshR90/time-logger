import type { ScreenshotInterval } from "../enums";

export interface Organization {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly plan: string;
  readonly settings: OrganizationSettings;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface OrganizationSettings {
  readonly screenshotIntervalMin: number | typeof ScreenshotInterval.RANDOM;
  readonly idleTimeoutMin: number;
  readonly blurScreenshots: boolean;
  readonly defaultCurrency: string;
  readonly defaultTaxRate: number;
  readonly dataRetentionDays: number;
  readonly appCategories: ReadonlyArray<AppCategoryRule>;
}

export interface AppCategoryRule {
  readonly pattern: string;
  readonly category: string;
}
