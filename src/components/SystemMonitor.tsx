import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useSettings } from "@/lib/settings";
import { useQuery } from "@tanstack/react-query";
import { fetchSystemMonitor } from "@/lib/admin-api";
import { Cpu, HardDrive, MemoryStick, Network, Activity, Server, Clock, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  parts.push(`${mins}m`);
  return parts.join(" ");
}

function getUsageColor(percent: number): string {
  if (percent >= 90) return "bg-red-500";
  if (percent >= 70) return "bg-orange-500";
  if (percent >= 50) return "bg-yellow-500";
  return "bg-green-500";
}

function getUsageTextColor(percent: number): string {
  if (percent >= 90) return "text-red-600 dark:text-red-400";
  if (percent >= 70) return "text-orange-600 dark:text-orange-400";
  if (percent >= 50) return "text-yellow-600 dark:text-yellow-400";
  return "text-green-600 dark:text-green-400";
}

export function SystemMonitor() {
  const { t } = useSettings();

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["system-monitor"],
    queryFn: fetchSystemMonitor,
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <div className="h-4 w-24 bg-muted rounded animate-pulse" />
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="h-8 w-16 bg-muted rounded animate-pulse" />
              <div className="h-2 bg-muted rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (isError || !data) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>{t("systemMonitorError")}</p>
        </CardContent>
      </Card>
    );
  }

  const { system, cpu, memory, disks, network, top_processes } = data;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          <h3 className="text-base font-semibold">{t("systemMonitor")}</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className="h-8 gap-1 text-muted-foreground"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
          <span className="text-xs">{t("refresh")}</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* System Info */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Server className="h-4 w-4 text-primary" />
              {t("smSystemInfo")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("smHostname")}</span>
              <span className="font-medium truncate ml-2">{system.hostname}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">OS</span>
              <span className="font-medium">{system.os_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("smArch")}</span>
              <span className="font-medium">{system.architecture}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("smUptime")}</span>
              <span className="font-medium">{formatUptime(system.uptime_seconds)}</span>
            </div>
          </CardContent>
        </Card>

        {/* CPU */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Cpu className="h-4 w-4 text-primary" />
              {t("smCpu")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-end justify-between">
              <span className={`text-2xl font-bold ${getUsageTextColor(cpu.percent_usage)}`}>
                {cpu.percent_usage.toFixed(1)}%
              </span>
              <span className="text-xs text-muted-foreground">
                {cpu.physical_cores}P / {cpu.total_cores}L
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${getUsageColor(cpu.percent_usage)}`}
                style={{ width: `${Math.min(cpu.percent_usage, 100)}%` }}
              />
            </div>
            {cpu.per_core_percent.length > 0 && (
              <div className="grid grid-cols-4 gap-1">
                {cpu.per_core_percent.slice(0, 8).map((val, i) => (
                  <div key={i} className="text-center">
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden mb-0.5">
                      <div
                        className={`h-full rounded-full ${getUsageColor(val)}`}
                        style={{ width: `${Math.min(val, 100)}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground">{val.toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            )}
            {cpu.frequency_current != null && (
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{t("smFrequency")}</span>
                <span>{cpu.frequency_current.toFixed(0)} MHz</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Memory */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <MemoryStick className="h-4 w-4 text-primary" />
              {t("smMemory")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-end justify-between">
              <span className={`text-2xl font-bold ${getUsageTextColor(memory.percent)}`}>
                {memory.percent.toFixed(1)}%
              </span>
              <span className="text-xs text-muted-foreground">
                {formatBytes(memory.used)} / {formatBytes(memory.total)}
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${getUsageColor(memory.percent)}`}
                style={{ width: `${Math.min(memory.percent, 100)}%` }}
              />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{t("smAvailable")}</span>
                <span>{formatBytes(memory.available)}</span>
              </div>
              {memory.swap_total > 0 && (
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Swap ({memory.swap_percent.toFixed(1)}%)</span>
                  <span>
                    {formatBytes(memory.swap_used)} / {formatBytes(memory.swap_total)}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Disk */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <HardDrive className="h-4 w-4 text-primary" />
              {t("smDisk")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {disks.map((disk, i) => (
              <div key={i}>
                <div className="flex items-end justify-between">
                  <span className={`text-2xl font-bold ${getUsageTextColor(disk.percent)}`}>
                    {disk.percent.toFixed(1)}%
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatBytes(disk.used)} / {formatBytes(disk.total)}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${getUsageColor(disk.percent)}`}
                    style={{ width: `${Math.min(disk.percent, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>{t("smFree")}</span>
                  <span>{formatBytes(disk.free)}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Network */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Network className="h-4 w-4 text-primary" />
              {t("smNetwork")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {network.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("noData")}</p>
            ) : (
              <div className="space-y-3">
                {network.map((iface, i) => (
                  <div key={i} className="border rounded-lg p-3">
                    <div className="font-medium text-sm mb-2">{iface.name}</div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-muted-foreground">{t("smSent")}:</span>{" "}
                        <span className="font-medium">{formatBytes(iface.bytes_sent)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">{t("smReceived")}:</span>{" "}
                        <span className="font-medium">{formatBytes(iface.bytes_recv)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">{t("smPacketsSent")}:</span>{" "}
                        <span className="font-medium">{iface.packets_sent.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">{t("smPacketsRecv")}:</span>{" "}
                        <span className="font-medium">{iface.packets_recv.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Processes */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              {t("smTopProcesses")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {top_processes.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("noData")}</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b text-muted-foreground">
                      <th className="text-left py-1.5 pr-2 font-medium">PID</th>
                      <th className="text-left py-1.5 pr-2 font-medium">{t("smProcessName")}</th>
                      <th className="text-right py-1.5 pr-2 font-medium">CPU %</th>
                      <th className="text-right py-1.5 pr-2 font-medium">{t("smMemUsage")}</th>
                      <th className="text-right py-1.5 font-medium">{t("status")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {top_processes.map((proc) => (
                      <tr key={proc.pid} className="border-b last:border-0">
                        <td className="py-1.5 pr-2 text-muted-foreground">{proc.pid}</td>
                        <td className="py-1.5 pr-2 font-medium truncate max-w-[120px]">{proc.name}</td>
                        <td className={`py-1.5 pr-2 text-right ${getUsageTextColor(proc.cpu_percent)}`}>
                          {proc.cpu_percent.toFixed(1)}
                        </td>
                        <td className="py-1.5 pr-2 text-right">{proc.memory_percent.toFixed(1)}</td>
                        <td className="py-1.5 text-right">
                          <span
                            className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium ${
                              proc.status === "running"
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                            }`}
                          >
                            {proc.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
