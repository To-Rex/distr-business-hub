import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth";
import { API } from "@/lib/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useSettings } from "@/lib/settings";
import { formatWithSpaces } from "@/lib/utils";
import { AlertCircle, ChevronDown, LayoutGrid, Rows3, Search, Store } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export const Route = createFileRoute("/_app/warehouse")({ component: WarehousePage });

type WarehouseProduct = {
  id: number;
  name: string;
  articul: string;
  unit: string;
  qtyInCase: number;
  info: string;
  category: string;
  brand: string;
  status: string;
  store_name: string;
  store_id: number;
  qty: number;
  bron: number;
  markirovka: number;
  type_price: string;
  price: number;
  cry: string;
};

type WarehouseGroup = {
  group_id: number;
  group_name: string;
  products: WarehouseProduct[];
};

type WarehouseResponse = {
  data: WarehouseGroup[];
  meta?: {
    total_group?: number;
    total_item?: number;
  };
};

type SortMode = "name-asc" | "name-desc" | "qty-desc" | "qty-asc" | "price-desc" | "price-asc";

function formatNumber(n: number): string {
  return formatWithSpaces(n, 2);
}

function WarehousePage() {
  const { t } = useSettings();
  const { user } = useAuth();
  const [groups, setGroups] = useState<WarehouseGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [viewMode, setViewMode] = useState<"cards" | "table">("table");
  const [sortMode, setSortMode] = useState<SortMode>("name-asc");
  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!user?.company_rel?.base_url || !user?.user_1c_login || !user?.user_1c_password) {
      setLoading(false);
      setError(t("notAvailable"));
      return;
    }

    const baseUrl = user.company_rel.base_url;
    const basic = btoa(`${user.user_1c_login}:${user.user_1c_password}`);

    fetch(API.productsByGroup(baseUrl), {
      headers: {
        accept: "application/json",
        Authorization: `Basic ${basic}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: WarehouseResponse) => {
        const list = data.data ?? [];
        setGroups(list);
        setExpandedGroups(new Set(list.map((g) => g.group_id)));
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [user, t]);

  const filteredGroups = useMemo(() => {
    if (!q.trim()) return groups;
    const lower = q.toLowerCase();
    return groups
      .map((group) => ({
        ...group,
        products: group.products.filter(
          (product) =>
            product.name.toLowerCase().includes(lower) ||
            product.category.toLowerCase().includes(lower) ||
            product.store_name.toLowerCase().includes(lower) ||
            product.articul.toLowerCase().includes(lower),
        ),
      }))
      .filter((group) => group.products.length > 0);
  }, [groups, q]);

  const sortedGroups = useMemo(() => {
    return filteredGroups.map((group) => {
      const products = [...group.products].sort((a, b) => {
        switch (sortMode) {
          case "name-desc":
            return b.name.localeCompare(a.name);
          case "qty-desc":
            return b.qty - a.qty;
          case "qty-asc":
            return a.qty - b.qty;
          case "price-desc":
            return b.price - a.price;
          case "price-asc":
            return a.price - b.price;
          case "name-asc":
          default:
            return a.name.localeCompare(b.name);
        }
      });
      return { ...group, products };
    });
  }, [filteredGroups, sortMode]);

  const totalProducts = useMemo(
    () => sortedGroups.reduce((sum, group) => sum + group.products.length, 0),
    [sortedGroups],
  );

  const toggleGroup = (id: number) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div>
      <PageHeader title={t("warehouse")} description={`${totalProducts} ${t("product").toLowerCase()}`} />

      <Card className="p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("search")}
              className="pl-9"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <Badge variant="secondary" className="text-xs">
            {totalProducts} {t("sku")}
          </Badge>
          <div className="shrink-0">
            <select
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value as SortMode)}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="name-asc">Nomi: A-Z</option>
              <option value="name-desc">Nomi: Z-A</option>
              <option value="qty-desc">Qoldiq: katta-kichik</option>
              <option value="qty-asc">Qoldiq: kichik-katta</option>
              <option value="price-desc">Narx: katta-kichik</option>
              <option value="price-asc">Narx: kichik-katta</option>
            </select>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button
              type="button"
              variant={viewMode === "cards" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("cards")}
            >
              <LayoutGrid className="h-4 w-4" />
              Kartalar
            </Button>
            <Button
              type="button"
              variant={viewMode === "table" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("table")}
            >
              <Rows3 className="h-4 w-4" />
              Jadval
            </Button>
          </div>
        </div>
      </Card>

      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, idx) => (
            <Card key={idx} className="p-4">
              <div className="flex items-center justify-between mb-3">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-5 w-12 rounded-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-9 w-full" />
              </div>
            </Card>
          ))}
        </div>
      )}

      {error && !loading && (
        <Card className="p-10">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">{t("errorTitle")}</p>
              <p className="text-xs text-muted-foreground">{t("notAvailable")}</p>
            </div>
          </div>
        </Card>
      )}

      {!loading && !error && sortedGroups.length === 0 && (
        <Card className="p-12 text-center text-muted-foreground">{t("notFound")}</Card>
      )}

      {!loading &&
        !error &&
        sortedGroups.map((group) => {
          const isOpen = expandedGroups.has(group.group_id);
          return (
            <Collapsible
              key={group.group_id}
              open={isOpen}
              onOpenChange={() => toggleGroup(group.group_id)}
              className="mb-3"
            >
              <CollapsibleTrigger asChild>
                <button className="w-full">
                  <Card className="px-4 py-3 hover:bg-muted/50 transition-colors cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <Store className="h-4.5 w-4.5 text-primary" />
                        </div>
                        <div className="text-left">
                          <h3 className="text-sm font-semibold">{group.group_name}</h3>
                          <p className="text-xs text-muted-foreground">
                            {group.products.length} {t("product").toLowerCase()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {group.products.length}
                        </Badge>
                        <ChevronDown
                          className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
                            isOpen ? "rotate-180" : ""
                          }`}
                        />
                      </div>
                    </div>
                  </Card>
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                {viewMode === "table" ? (
                  <Card className="mt-2 overflow-hidden">
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>{t("sku")}</TableHead>
                            <TableHead>{t("product")}</TableHead>
                            <TableHead>{t("category")}</TableHead>
                            <TableHead>{t("location")}</TableHead>
                            <TableHead className="text-right">{t("stock")}</TableHead>
                            <TableHead className="text-right">{t("amount")}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {group.products.map((product) => (
                            <TableRow key={product.id}>
                              <TableCell className="font-mono text-xs text-muted-foreground">
                                {product.id}
                              </TableCell>
                              <TableCell>
                                <div className="font-medium">{product.name}</div>
                                {product.articul && (
                                  <div className="text-xs text-muted-foreground">{product.articul}</div>
                                )}
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {product.category || "—"}
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {product.store_name || "—"}
                              </TableCell>
                              <TableCell className="text-right font-medium">
                                {formatNumber(product.qty)} {product.unit}
                              </TableCell>
                              <TableCell className="text-right">
                                <span className="font-medium">{formatNumber(product.price)}</span>{" "}
                                <span className="text-xs text-muted-foreground">{product.cry}</span>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 mt-2 px-1">
                    {group.products.map((product) => (
                      <Card key={product.id} className="overflow-hidden hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="min-w-0">
                              <h4 className="text-sm font-semibold truncate">{product.name}</h4>
                              {product.articul && (
                                <p className="text-xs text-muted-foreground truncate">{product.articul}</p>
                              )}
                            </div>
                            <Badge variant="secondary" className="text-[10px]">
                              {product.id}
                            </Badge>
                          </div>
                          <div className="space-y-1 text-xs text-muted-foreground">
                            <p>Kategoriya: {product.category || "—"}</p>
                            <p>Joylashuv: {product.store_name || "—"}</p>
                          </div>
                          <div className="mt-3 pt-3 border-t flex items-center justify-between text-xs">
                            <span className="font-medium">
                              {formatNumber(product.qty)} {product.unit}
                            </span>
                            <span>
                              <span className="font-medium">{formatNumber(product.price)}</span>{" "}
                              <span className="text-muted-foreground">{product.cry}</span>
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>
          );
        })}
    </div>
  );
}
