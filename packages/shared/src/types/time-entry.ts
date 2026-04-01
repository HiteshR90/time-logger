import type {
  TimeEntryStatus,
  TimesheetApproval,
  AppCategory,
} from "../enums";

export interface TimeEntry {
  readonly id: string;
  readonly userId: string;
  readonly projectId: string;
  readonly startTime: Date;
  readonly endTime: Date | null;
  readonly durationSec: number;
  readonly status: TimeEntryStatus;
  readonly approval: TimesheetApproval;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface ActivitySnapshot {
  readonly id: string;
  readonly timeEntryId: string;
  readonly timestamp: Date;
  readonly keystrokes: number;
  readonly mouseClicks: number;
  readonly mouseDistancePx: number;
  readonly activityLevel: number;
}

export interface AppUsageLog {
  readonly id: string;
  readonly timeEntryId: string;
  readonly app: string;
  readonly title: string;
  readonly url: string | null;
  readonly durationSec: number;
  readonly category: AppCategory;
}

export interface Screenshot {
  readonly id: string;
  readonly timeEntryId: string;
  readonly s3Key: string;
  readonly thumbnailKey: string | null;
  readonly timestamp: Date;
  readonly blurred: boolean;
}
