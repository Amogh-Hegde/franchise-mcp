import { HealthCheck, HealthCheckInterface, HealthCheckResult } from '@nitrostack/core';
import mongoose from 'mongoose';

/**
 * System Health Check
 * 
 * Monitors system resources and uptime
 */
@HealthCheck({ 
  name: 'system', 
  description: 'System resource and uptime check',
  interval: 30 // Check every 30 seconds
})
export class SystemHealthCheck implements HealthCheckInterface {
  private startTime: number;

  constructor() {
    this.startTime = Date.now();
  }

  async check(): Promise<HealthCheckResult> {
    try {
      const memoryUsage = process.memoryUsage();
      const uptime = Date.now() - this.startTime;
      const uptimeSeconds = Math.floor(uptime / 1000);
      
      // Convert memory to MB
      const memoryUsedMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);
      const memoryTotalMB = Math.round(memoryUsage.heapTotal / 1024 / 1024);
      
      // Consider unhealthy if memory usage is > 90%
      const memoryPercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;
      const mongoStates = ['disconnected', 'connected', 'connecting', 'disconnecting'];
      const mongoState = mongoStates[mongoose.connection.readyState] ?? `unknown(${mongoose.connection.readyState})`;
      const isHealthy = memoryPercent < 90 && mongoose.connection.readyState !== 0;
      
      return {
        status: isHealthy ? 'up' : 'degraded',
        message: isHealthy 
          ? 'System is healthy' 
          : mongoose.connection.readyState === 0
            ? 'System is running but MongoDB is disconnected'
            : 'High memory usage detected',
        details: {
          uptime: `${uptimeSeconds}s`,
          memory: `${memoryUsedMB}MB / ${memoryTotalMB}MB (${Math.round(memoryPercent)}%)`,
          mongodb: mongoState,
          pid: process.pid,
          nodeVersion: process.version,
        },
      };
    } catch (error: any) {
      return {
        status: 'down',
        message: 'System health check failed',
        details: error.message,
      };
    }
  }
}
