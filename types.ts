export interface SmartLink {
  id: string;
  name: string;
  originalUrl: string;
  slug: string;
  subId: string;
  description: string;
  thumbnailUrl?: string;
  status: 'active' | 'paused';
  createdAt: string;
  updatedAt: string;
  clickCount: number;
  uniqueCount: number;
}

export interface ClickRecord {
  id: string;
  linkId: string;
  linkSlug: string;
  linkName: string;
  subId: string;
  timestamp: string;
  userAgent: string;
  deviceType: 'mobile' | 'desktop' | 'tablet' | 'bot';
  browser: string;
  os: string;
  ipHash: string;
  referrer: string;
  queryParams: Record<string, string>;
  destinationUrl: string;
}

export interface OverviewStats {
  totalLinks: number;
  activeLinks: number;
  pausedLinks: number;
  totalClicks: number;
  uniqueVisitors: number;
  todayClicks: number;
  last7Days: {
    date: string;
    clicks: number;
    uniques: number;
  }[];
  devices: {
    mobile: number;
    desktop: number;
    tablet: number;
    bot: number;
  };
  recentActivity: ClickRecord[];
}

export type TabType = 'dashboard' | 'links' | 'create' | 'bulk' | 'backup' | 'guide';
