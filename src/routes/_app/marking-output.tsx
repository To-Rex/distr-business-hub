import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth";
import { API } from "@/lib/api";
import { useSettings } from "@/lib/settings";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowUpRight,
  Package,
  Tag,
  Search,
  X,
  AlertCircle,
  Building2,
  QrCode,
  RefreshCw,
  Layers,
  ChevronDown,
  Table2,
  LayoutGrid,
  Download,
} from "lucide-react";

export const Route = createFileRoute("/_app/marking-output")({
  component: MarkirovkaChiqimPage,
});

type ApiProduct = {
  id: number;
  name: string;
  client_id: number;
  client_name: string;
  client_yur_name: string;
  markFull: string;
  mark: string;
};

type ApiGroup = {
  group_id: number;
  group_name: string;
  products: ApiProduct[];
};

type ApiResponse = {
  data: ApiGroup[];
  meta: {
    total_group: number;
    total_item: number;
  };
};

function MarkirovkaChiqimPage() {
  const { user } = useAuth();
  const { t } = useSettings();
  const [groups, setGroups] = useState<ApiGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set());
  const [selectedProduct, setSelectedProduct] = useState<{ product: ApiProduct; groupName: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [groupFilter, setGroupFilter] = useState<string>("all");
  const [view, setView] = useState<"table" | "cards">("table");

  useEffect(() => {
    if (groups.length > 0) {
      setExpandedGroups(new Set(groups.map((g) => g.group_id)));
    }
  }, [groups]);

  const fetchData = useCallback(() => {
    const baseUrl = user?.company_rel?.base_url;
    const login = user?.user_1c_login;
    const password = user?.user_1c_password;
    if (!baseUrl || !login || !password) {
      setLoading(false);
      setError(true);
      return;
    }

    let cancelled = false;
    const basic = btoa(`${login}:${password}`);

    setLoading(true);
    setError(false);

    fetch(API.invoiceMarksByGroup(baseUrl), {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization: `Basic ${basic}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((json: ApiResponse) => {
        if (cancelled) return;
        setGroups(json.data || []);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setError(true);
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, [user?.company_rel?.base_url, user?.user_1c_login, user?.user_1c_password]);

  useEffect(() => {
    const cancel = fetchData();
    return cancel;
  }, [fetchData]);

  const totalGroups = groups.length;
  const totalProducts = groups.reduce((s, g) => s + g.products.length, 0);
  const uniqueClients = new Set(groups.flatMap((g) => g.products.map((p) => p.client_name))).size;

  const filteredGroups = useMemo(() => {
    let filtered = groups;
    if (groupFilter !== "all") {
      filtered = filtered.filter((g) => String(g.group_id) === groupFilter);
    }
    if (searchQuery.trim()) {
      const words = searchQuery.trim().toLowerCase().split(/\s+/);
      filtered = filtered
        .map((g) => ({
          ...g,
          products: g.products.filter((p) => {
            const haystack = `${p.id} ${p.name} ${p.mark} ${p.client_name}`.toLowerCase();
            return words.every((w) => haystack.includes(w));
          }),
        }))
        .filter((g) => g.products.length > 0);
    }
    return filtered;
  }, [groups, searchQuery, groupFilter]);

  const exportToExcel = () => {
    const esc = (v: string | number | null | undefined) => (v ?? "").toString().replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    let html = `<table><thead><tr>`;
    const headers = ["Guruh", "ID", "Mahsulot", "GTIN", "To'liq mark", "Mijoz", "Yuridik nom"];
    for (const h of headers) html += `<th>${esc(h)}</th>`;
    html += `</tr></thead><tbody>`;
    for (const group of groups) {
      for (const product of group.products) {
        html += `<tr>`;
        html += `<td>${esc(group.group_name)}</td>`;
        html += `<td>${esc(product.id)}</td>`;
        html += `<td>${esc(product.name)}</td>`;
        html += `<td>${esc(product.mark)}</td>`;
        html += `<td>${esc(product.markFull)}</td>`;
        html += `<td>${esc(product.client_name)}</td>`;
        html += `<td>${esc(product.client_yur_name)}</td>`;
        html += `</tr>`;
      }
    }
    html += `</tbody></table>`;
    const blob = new Blob([html], { type: "application/vnd.ms-excel;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `markirovka_chiqim_${new Date().toISOString().slice(0, 10)}.xls`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("markirovkaChiqim")}
        description={t("markirovkaChiqimDesc")}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={exportToExcel} className="gap-1.5">
              <Download className="h-3.5 w-3.5" />
              {t("export")}
            </Button>
            <Button variant="outline" size="sm" onClick={fetchData} disabled={loading} className="gap-1.5">
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              {t("refresh")}
            </Button>
          </div>
        }
      />

      {loading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="p-5">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <Skeleton className="h-6 w-16 mt-3" />
                <Skeleton className="h-3 w-20 mt-1" />
              </Card>
            ))}
          </div>
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-5 w-48 mb-3" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-16 text-muted-foreground">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p>{t("errorTitle")}</p>
        </div>
      ) : groups.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Package className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p>{t("noDataFound")}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Card className="p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                  <ArrowUpRight className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xl sm:text-2xl font-semibold tracking-tight">{totalGroups}</p>
                  <p className="text-[11px] sm:text-xs text-muted-foreground truncate">{t("markingBatch")}</p>
                </div>
              </div>
            </Card>
            <Card className="p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10 text-success shrink-0">
                  <Package className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xl sm:text-2xl font-semibold tracking-tight">{totalProducts}</p>
                  <p className="text-[11px] sm:text-xs text-muted-foreground truncate">{t("products")}</p>
                </div>
              </div>
            </Card>
            <Card className="p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 shrink-0">
                  <Building2 className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xl sm:text-2xl font-semibold tracking-tight">{uniqueClients}</p>
                  <p className="text-[11px] sm:text-xs text-muted-foreground truncate">{t("clients")}</p>
                </div>
              </div>
            </Card>
            <Card className="p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shrink-0">
                  <Layers className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xl sm:text-2xl font-semibold tracking-tight">{totalGroups}</p>
                  <p className="text-[11px] sm:text-xs text-muted-foreground truncate">{t("markirovkaChiqimBatches")}</p>
                </div>
              </div>
            </Card>
          </div>

          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={`${t("search")}...`}
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                <div className="flex gap-2">
                  <Select value={groupFilter} onValueChange={setGroupFilter}>
                    <SelectTrigger className="w-full sm:w-[180px] h-9">
                      <SelectValue placeholder={t("markingBatch")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t("all")}</SelectItem>
                      {groups.map((g) => (
                        <SelectItem key={g.group_id} value={String(g.group_id)}>{g.group_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex border rounded-md overflow-hidden">
                    <button
                      onClick={() => setView("table")}
                      className={`p-1.5 transition-colors ${view === "table" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent"}`}
                      title={t("tableView")}
                    >
                      <Table2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setView("cards")}
                      className={`p-1.5 transition-colors ${view === "cards" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent"}`}
                      title={t("cardsView")}
                    >
                      <LayoutGrid className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {filteredGroups.length === 0 && !loading && (
            <div className="text-center py-12 text-muted-foreground">
              <Search className="h-8 w-8 mx-auto mb-3 opacity-30" />
              <p className="text-sm">{t("noDataFound")}</p>
            </div>
          )}

          {filteredGroups.map((group) => {
            const isOpen = expandedGroups.has(group.group_id);
            return (
              <Card key={group.group_id}>
                <CardContent className="p-4">
                  <div
                    className="flex items-center gap-2 pb-2 border-b cursor-pointer select-none"
                    onClick={() =>
                      setExpandedGroups((prev) => {
                        const next = new Set(prev);
                        if (next.has(group.group_id)) next.delete(group.group_id);
                        else next.add(group.group_id);
                        return next;
                      })
                    }
                  >
                    <ChevronDown
                      className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? "" : "-rotate-90"}`}
                    />
                    <Layers className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold text-sm">{group.group_name}</h3>
                    <Badge variant="outline" className="ml-auto text-[10px]">
                      {group.products.length}
                    </Badge>
                  </div>
                  {isOpen && (
                    <div className="pt-1">
                      {group.products.length === 0 ? (
                        <div className="text-center py-6 text-sm text-muted-foreground">
                          {t("noDataFound")}
                        </div>
                      ) : view === "table" ? (
                        <div className="divide-y">
                          <div className="grid grid-cols-[1fr_100px_140px_100px] gap-3 px-2 py-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                            <span>{t("products")}</span>
                            <span className="text-center">{t("markingGtin")}</span>
                            <span className="text-center">{t("client")}</span>
                            <span className="text-center">ID</span>
                          </div>
                          {group.products.map((product) => (
                            <div
                              key={product.id}
                              className="grid grid-cols-[1fr_100px_140px_100px] gap-3 px-2 py-3 items-center cursor-pointer hover:bg-muted/30 transition-colors rounded-sm"
                              onClick={() => setSelectedProduct({ product, groupName: group.group_name })}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/5 text-primary shrink-0">
                                  <Tag className="h-4 w-4" />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-medium truncate">{product.name}</p>
                                </div>
                              </div>
                              <span className="text-sm text-muted-foreground tabular-nums font-mono text-[11px] text-center truncate">
                                {product.mark || "—"}
                              </span>
                              <span className="text-sm text-muted-foreground text-center truncate" title={product.client_name}>
                                {product.client_name || "—"}
                              </span>
                              <span className="text-sm text-muted-foreground tabular-nums font-mono text-[11px] text-center">
                                #{product.id}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-3">
                          {group.products.map((product) => (
                            <div
                              key={product.id}
                              className="rounded-lg border bg-card p-3 cursor-pointer hover:bg-muted/30 hover:shadow-sm transition-all"
                              onClick={() => setSelectedProduct({ product, groupName: group.group_name })}
                            >
                              <div className="flex items-center gap-2 mb-2">
                                <Tag className="h-4 w-4 shrink-0 text-primary" />
                                <p className="text-sm font-medium truncate">{product.name}</p>
                              </div>
                              <div className="space-y-1.5 text-xs">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">{t("markingGtin")}:</span>
                                  <span className="font-mono truncate ml-2">{product.mark || "—"}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">{t("client")}:</span>
                                  <span className="truncate ml-2">{product.client_name || "—"}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">ID:</span>
                                  <span className="font-mono">#{product.id}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </>
      )}

      <Dialog open={!!selectedProduct} onOpenChange={(o) => !o && setSelectedProduct(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-primary" />
              {selectedProduct?.product.name}
            </DialogTitle>
            <DialogDescription>
              {selectedProduct?.groupName}
            </DialogDescription>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground mb-1">{t("markingGtin")}</p>
                  <p className="text-sm font-mono font-medium break-all">{selectedProduct.product.mark || "—"}</p>
                </div>
                <div className="rounded-lg border bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground mb-1">ID</p>
                  <p className="text-sm font-mono font-medium">#{selectedProduct.product.id}</p>
                </div>
              </div>

              <div className="rounded-lg border">
                <div className="text-center p-3">
                  <p className="text-xs text-muted-foreground mb-1 flex items-center justify-center gap-1">
                    <Building2 className="h-3 w-3" />
                    {t("client")}
                  </p>
                  <p className="text-lg font-bold">{selectedProduct.product.client_name || "—"}</p>
                  {selectedProduct.product.client_yur_name && (
                    <p className="text-xs text-muted-foreground mt-1">{selectedProduct.product.client_yur_name}</p>
                  )}
                </div>
              </div>

              {selectedProduct.product.markFull && (
                <div className="rounded-lg border bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    <QrCode className="h-3 w-3" />
                    Mark (to'liq)
                  </p>
                  <p className="text-xs font-mono break-all text-muted-foreground leading-relaxed select-all">
                    {selectedProduct.product.markFull}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
