import { Page } from '@playwright/test';

interface BackendTelemetry {
  layer: 'backend';
  route: string;
  context: {
    timestamp: number;
    env: string;
  };
  metrics: {
    latency: number;
    errorCount: number;
    statusCodes: Record<number, number>;
  };
}

export class BackendCollector {
  private requests: Array<{
    url: string;
    method: string;
    status: number;
    duration: number;
    timestamp: number;
  }> = [];

  async initialize(page: Page) {
    page.on('response', async (response) => {
      const request = response.request();
      
      if (request.url().includes('/api/')) {
        this.requests.push({
          url: request.url(),
          method: request.method(),
          status: response.status(),
          duration: 0,
          timestamp: Date.now()
        });
      }
    });
  }

  async collect(route: string): Promise<BackendTelemetry> {
    const apiRequests = this.requests.filter(r => r.url.includes(route));
    
    const avgLatency = apiRequests.length > 0
      ? apiRequests.reduce((sum, r) => sum + r.duration, 0) / apiRequests.length
      : 0;
    
    const errorCount = apiRequests.filter(r => r.status >= 400).length;
    
    const statusCodes = apiRequests.reduce((acc, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    return {
      layer: 'backend',
      route,
      context: {
        timestamp: Date.now(),
        env: process.env.NODE_ENV || 'development'
      },
      metrics: {
        latency: Math.round(avgLatency * 100) / 100,
        errorCount,
        statusCodes
      }
    };
  }
}
