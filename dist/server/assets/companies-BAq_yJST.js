import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useState, useEffect, useMemo } from "react";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { A as AdminGuard, a as AdminLayout } from "./admin-layout-CdVUn-mj.js";
import { w as fetchCompanies, A as fetchSecurityKeys, d as createCompany, Q as updateCompany, l as deleteCompany, f as createSecurityKey, n as deleteSecurityKey, b as createBranch, P as updateBranch, k as deleteBranch } from "./admin-api-CSnccBQ8.js";
import { w as useSettings, v as useIsMobile, I as Input, a as Button, T as Table, n as TableHeader, o as TableRow, m as TableHead, k as TableBody, l as TableCell, q as cn } from "./router-BlxmWyUK.js";
import { L as Label } from "./label-CSMUgFuN.js";
import { D as Dialog, a as DialogContent, d as DialogHeader, e as DialogTitle, b as DialogDescription, c as DialogFooter } from "./dialog-pksaGXR7.js";
import { A as AlertDialog, c as AlertDialogContent, f as AlertDialogHeader, g as AlertDialogTitle, d as AlertDialogDescription, e as AlertDialogFooter, b as AlertDialogCancel, a as AlertDialogAction } from "./alert-dialog-6RIcmwuu.js";
import { D as DropdownMenu, e as DropdownMenuTrigger, a as DropdownMenuContent, b as DropdownMenuItem, d as DropdownMenuSeparator } from "./tooltip-DE7sqXiM.js";
import { toast } from "sonner";
import { Search, List, LayoutGrid, Plus, Building2, MoreVertical, Eye, Edit, Key, Trash2, Copy, GitBranch, Pencil, ArrowUp, ArrowDown, ArrowUpDown, Hash, Globe } from "lucide-react";
import { T as ToggleGroup, a as ToggleGroupItem } from "./toggle-group-D-XYPMlk.js";
import "@tanstack/react-router";
import "./auth-ZlFwEN-P.js";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-select";
import "@radix-ui/react-label";
import "@radix-ui/react-dialog";
import "@radix-ui/react-alert-dialog";
import "@radix-ui/react-dropdown-menu";
import "@radix-ui/react-tooltip";
import "@radix-ui/react-toggle-group";
import "@radix-ui/react-toggle";
const emptyForm = {
  name: "",
  inn: "",
  base_url: "",
  asl_belgi_token: ""
};
function SortableHeader({
  label,
  field,
  sortField,
  sortDir,
  onSort
}) {
  return /* @__PURE__ */ jsxs("button", { onClick: () => onSort(field), className: "inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors group", children: [
    label,
    sortField === field ? sortDir === "asc" ? /* @__PURE__ */ jsx(ArrowUp, { className: "h-3 w-3" }) : /* @__PURE__ */ jsx(ArrowDown, { className: "h-3 w-3" }) : /* @__PURE__ */ jsx(ArrowUpDown, { className: "h-3 w-3 opacity-0 group-hover:opacity-50 transition-opacity" })
  ] });
}
function CompanyCard({
  company,
  onEdit,
  onDelete,
  onView,
  onKeys,
  t
}) {
  return /* @__PURE__ */ jsxs("div", { className: "group relative rounded-xl border bg-card p-5 transition-all hover:shadow-md hover:border-primary/20", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 min-w-0", children: [
        /* @__PURE__ */ jsx("div", { className: "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/8 text-primary", children: /* @__PURE__ */ jsx(Building2, { className: "h-5 w-5" }) }),
        /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsx("h3", { className: "font-semibold text-sm truncate", children: company.name }),
          /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground font-mono", children: [
            "ID: ",
            company.id
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(DropdownMenu, { children: [
        /* @__PURE__ */ jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "icon", className: "h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity", children: /* @__PURE__ */ jsx(MoreVertical, { className: "h-4 w-4" }) }) }),
        /* @__PURE__ */ jsxs(DropdownMenuContent, { align: "end", className: "w-44", children: [
          /* @__PURE__ */ jsxs(DropdownMenuItem, { onClick: () => onView(company), children: [
            /* @__PURE__ */ jsx(Eye, { className: "h-4 w-4 mr-2" }),
            t("adminCompanyView")
          ] }),
          /* @__PURE__ */ jsxs(DropdownMenuItem, { onClick: () => onEdit(company), children: [
            /* @__PURE__ */ jsx(Edit, { className: "h-4 w-4 mr-2" }),
            t("edit")
          ] }),
          /* @__PURE__ */ jsxs(DropdownMenuItem, { onClick: () => onKeys(company), children: [
            /* @__PURE__ */ jsx(Key, { className: "h-4 w-4 mr-2" }),
            t("adminCompanyKeys")
          ] }),
          /* @__PURE__ */ jsx(DropdownMenuSeparator, {}),
          /* @__PURE__ */ jsxs(DropdownMenuItem, { onClick: () => onDelete(company), className: "text-red-600 focus:text-red-600", children: [
            /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4 mr-2" }),
            t("adminCompanyDelete")
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-4 space-y-2", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm", children: [
        /* @__PURE__ */ jsx(Hash, { className: "h-3.5 w-3.5 text-muted-foreground shrink-0" }),
        /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "INN:" }),
        /* @__PURE__ */ jsx("span", { className: cn("font-mono text-xs", !company.inn && "text-muted-foreground/50 italic"), children: company.inn || t("adminCompanyNotSet") })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm", children: [
        /* @__PURE__ */ jsx(Globe, { className: "h-3.5 w-3.5 text-muted-foreground shrink-0" }),
        /* @__PURE__ */ jsx("span", { className: cn("truncate text-xs", !company.base_url && "text-muted-foreground/50 italic"), children: company.base_url || t("notAvailable") })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "pt-2", children: [
        /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground font-medium mb-1.5 flex items-center gap-1", children: [
          /* @__PURE__ */ jsx(GitBranch, { className: "h-3 w-3" }),
          t("adminCompanyBranches")
        ] }),
        company.branches && company.branches.length > 0 ? /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-1.5", children: company.branches.map((branch) => /* @__PURE__ */ jsx("span", { className: "inline-flex items-center gap-1 text-xs bg-secondary/50 px-2 py-0.5 rounded-full", children: branch.name }, branch.id)) }) : /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground/50 italic", children: t("notAvailable") })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-4 flex items-center gap-2 pt-3 border-t", children: [
      /* @__PURE__ */ jsxs(Button, { variant: "ghost", size: "sm", className: "h-7 text-xs flex-1", onClick: () => onView(company), children: [
        /* @__PURE__ */ jsx(Eye, { className: "h-3.5 w-3.5 mr-1.5" }),
        t("adminCompanyView")
      ] }),
      /* @__PURE__ */ jsxs(Button, { variant: "ghost", size: "sm", className: "h-7 text-xs flex-1", onClick: () => onEdit(company), children: [
        /* @__PURE__ */ jsx(Edit, { className: "h-3.5 w-3.5 mr-1.5" }),
        t("edit")
      ] })
    ] })
  ] });
}
function AdminCompaniesPage() {
  const {
    t
  } = useSettings();
  const queryClient = useQueryClient();
  const {
    data: companies = [],
    isLoading
  } = useQuery({
    queryKey: ["admin-companies"],
    queryFn: () => fetchCompanies()
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const isMobile = useIsMobile();
  useEffect(() => {
    if (isMobile) setViewMode("grid");
  }, [isMobile]);
  const [sortField, setSortField] = useState("id");
  const [sortDir, setSortDir] = useState("asc");
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isKeysDialogOpen, setIsKeysDialogOpen] = useState(false);
  const [isAddKeyDialogOpen, setIsAddKeyDialogOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [formData, setFormData] = useState(emptyForm);
  const [isAddBranchDialogOpen, setIsAddBranchDialogOpen] = useState(false);
  const [isEditBranchDialogOpen, setIsEditBranchDialogOpen] = useState(false);
  const [isDeleteBranchDialogOpen, setIsDeleteBranchDialogOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [branchName, setBranchName] = useState("");
  const {
    data: securityKeys = []
  } = useQuery({
    queryKey: ["admin-security-keys", selectedCompany?.id],
    queryFn: () => fetchSecurityKeys(selectedCompany.id),
    enabled: !!selectedCompany && isKeysDialogOpen
  });
  const filteredCompanies = useMemo(() => {
    let result = companies.filter((c) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return c.name.toLowerCase().includes(q) || c.inn && c.inn.toLowerCase().includes(q) || c.base_url && c.base_url.toLowerCase().includes(q) || c.branches && c.branches.some((b) => b.name.toLowerCase().includes(q));
    });
    result.sort((a, b) => {
      let cmp = 0;
      const aVal = a[sortField] || "";
      const bVal = b[sortField] || "";
      if (sortField === "id") {
        cmp = a.id - b.id;
      } else {
        cmp = String(aVal).localeCompare(String(bVal), "uz");
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return result;
  }, [companies, searchQuery, sortField, sortDir]);
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir((d) => d === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };
  const createMutation = useMutation({
    mutationFn: createCompany,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-companies"]
      });
      toast.success(t("adminCompanyCreated"));
      setIsAddDialogOpen(false);
      setFormData(emptyForm);
    },
    onError: (err) => toast.error(err.message || t("adminErrorOccurred"))
  });
  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data
    }) => updateCompany(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-companies"]
      });
      toast.success(t("adminCompanyUpdated"));
      setIsEditDialogOpen(false);
      setSelectedCompany(null);
      setFormData(emptyForm);
    },
    onError: (err) => toast.error(err.message || t("adminErrorOccurred"))
  });
  const deleteMutation = useMutation({
    mutationFn: deleteCompany,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-companies"]
      });
      toast.success(t("adminCompanyDeleted"));
      setIsDeleteDialogOpen(false);
      setSelectedCompany(null);
    },
    onError: (err) => toast.error(err.message || t("adminErrorOccurred"))
  });
  const createKeyMutation = useMutation({
    mutationFn: ({
      companyId,
      data
    }) => createSecurityKey(companyId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-security-keys", selectedCompany?.id]
      });
      toast.success(t("adminKeyAdded"));
      setIsAddKeyDialogOpen(false);
      setNewKeyName("");
    },
    onError: (err) => toast.error(err.message || t("adminErrorOccurred"))
  });
  const deleteKeyMutation = useMutation({
    mutationFn: deleteSecurityKey,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-security-keys", selectedCompany?.id]
      });
      toast.success(t("adminKeyDeleted"));
    },
    onError: (err) => toast.error(err.message || t("adminErrorOccurred"))
  });
  const createBranchMutation = useMutation({
    mutationFn: createBranch,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-companies"]
      });
      toast.success(t("adminBranchAdded"));
      setIsAddBranchDialogOpen(false);
      setBranchName("");
    },
    onError: (err) => toast.error(err.message || t("adminErrorOccurred"))
  });
  const updateBranchMutation = useMutation({
    mutationFn: ({
      id,
      data
    }) => updateBranch(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-companies"]
      });
      toast.success(t("adminBranchUpdated"));
      setIsEditBranchDialogOpen(false);
      setSelectedBranch(null);
      setBranchName("");
    },
    onError: (err) => toast.error(err.message || t("adminErrorOccurred"))
  });
  const deleteBranchMutation = useMutation({
    mutationFn: deleteBranch,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-companies"]
      });
      toast.success(t("adminBranchDeleted"));
      setIsDeleteBranchDialogOpen(false);
      setSelectedBranch(null);
    },
    onError: (err) => toast.error(err.message || t("adminErrorOccurred"))
  });
  const handleAdd = () => {
    setFormData(emptyForm);
    setIsAddDialogOpen(true);
  };
  const handleEdit = (company) => {
    setSelectedCompany(company);
    setFormData({
      name: company.name,
      inn: company.inn || "",
      base_url: company.base_url || "",
      asl_belgi_token: company.asl_belgi_token || ""
    });
    setIsEditDialogOpen(true);
  };
  const handleView = (company) => {
    setSelectedCompany(company);
    setIsViewDialogOpen(true);
  };
  const handleDelete = (company) => {
    setSelectedCompany(company);
    setIsDeleteDialogOpen(true);
  };
  const handleKeys = (company) => {
    setSelectedCompany(company);
    setIsKeysDialogOpen(true);
  };
  const handleAddBranch = () => {
    setBranchName("");
    setIsAddBranchDialogOpen(true);
  };
  const handleEditBranch = (branch) => {
    setSelectedBranch(branch);
    setBranchName(branch.name);
    setIsEditBranchDialogOpen(true);
  };
  const handleDeleteBranch = (branch) => {
    setSelectedBranch(branch);
    setIsDeleteBranchDialogOpen(true);
  };
  const confirmAddBranch = () => {
    if (!branchName.trim() || !selectedCompany) {
      toast.error(t("adminBranchNameRequired") || "Filial nomi majburiy");
      return;
    }
    createBranchMutation.mutate({
      name: branchName,
      company_id: selectedCompany.id
    });
  };
  const confirmEditBranch = () => {
    if (!branchName.trim() || !selectedBranch) {
      toast.error(t("adminBranchNameRequired") || "Filial nomi majburiy");
      return;
    }
    updateBranchMutation.mutate({
      id: selectedBranch.id,
      data: {
        name: branchName,
        company_id: selectedBranch.company_id
      }
    });
  };
  const confirmDeleteBranch = () => {
    if (selectedBranch) {
      deleteBranchMutation.mutate(selectedBranch.id);
    }
  };
  const handleSaveCreate = () => {
    if (!formData.name.trim()) {
      toast.error(t("adminCompanyNameRequired"));
      return;
    }
    const payload = {
      name: formData.name
    };
    if (formData.inn) payload.inn = formData.inn;
    if (formData.base_url) payload.base_url = formData.base_url;
    if (formData.asl_belgi_token) payload.asl_belgi_token = formData.asl_belgi_token;
    createMutation.mutate(payload);
  };
  const handleSaveEdit = () => {
    if (!selectedCompany) return;
    const payload = {};
    if (formData.name) payload.name = formData.name;
    if (formData.inn) payload.inn = formData.inn;
    if (formData.base_url) payload.base_url = formData.base_url;
    if (formData.asl_belgi_token) payload.asl_belgi_token = formData.asl_belgi_token;
    updateMutation.mutate({
      id: selectedCompany.id,
      data: payload
    });
  };
  const handleAddKey = () => {
    if (!selectedCompany || !newKeyName.trim()) {
      toast.error(t("adminEnterKeyName"));
      return;
    }
    createKeyMutation.mutate({
      companyId: selectedCompany.id,
      data: {
        key: newKeyName,
        company_id: selectedCompany.id
      }
    });
  };
  const confirmDelete = () => {
    if (selectedCompany) {
      deleteMutation.mutate(selectedCompany.id);
    }
  };
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success(t("adminCopied"));
  };
  return /* @__PURE__ */ jsx(AdminGuard, { children: /* @__PURE__ */ jsxs(AdminLayout, { title: t("adminCompanies"), subtitle: t("adminCompaniesSubtitle"), children: [
    isLoading && /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center p-12", children: /* @__PURE__ */ jsx("div", { className: "h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" }) }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "relative flex-1 max-w-sm", children: [
        /* @__PURE__ */ jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
        /* @__PURE__ */ jsx(Input, { placeholder: t("adminSearchCompanies"), value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), className: "pl-9 h-9 bg-card" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground tabular-nums", children: t("adminItemsCount").replace("{n}", String(filteredCompanies.length)) }),
        /* @__PURE__ */ jsx("div", { className: "h-4 w-px bg-border" }),
        /* @__PURE__ */ jsxs(ToggleGroup, { type: "single", value: viewMode, onValueChange: (v) => {
          if (v) setViewMode(v);
        }, variant: "outline", size: "sm", children: [
          /* @__PURE__ */ jsx(ToggleGroupItem, { value: "table", "aria-label": t("adminTableView"), children: /* @__PURE__ */ jsx(List, { className: "h-4 w-4" }) }),
          /* @__PURE__ */ jsx(ToggleGroupItem, { value: "grid", "aria-label": t("adminGridView"), children: /* @__PURE__ */ jsx(LayoutGrid, { className: "h-4 w-4" }) })
        ] }),
        /* @__PURE__ */ jsxs(Button, { size: "sm", onClick: handleAdd, className: "h-8", children: [
          /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4 mr-1.5" }),
          t("add")
        ] })
      ] })
    ] }),
    viewMode === "table" ? /* @__PURE__ */ jsxs("div", { className: "rounded-xl border bg-card overflow-hidden", children: [
      /* @__PURE__ */ jsxs(Table, { children: [
        /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { className: "hover:bg-transparent border-b", children: [
          /* @__PURE__ */ jsx(TableHead, { className: "py-3", children: /* @__PURE__ */ jsx(SortableHeader, { label: t("id"), field: "id", sortField, sortDir, onSort: handleSort }) }),
          /* @__PURE__ */ jsx(TableHead, { className: "py-3", children: /* @__PURE__ */ jsx(SortableHeader, { label: t("adminCompanyName"), field: "name", sortField, sortDir, onSort: handleSort }) }),
          /* @__PURE__ */ jsx(TableHead, { className: "py-3", children: /* @__PURE__ */ jsx(SortableHeader, { label: "INN", field: "inn", sortField, sortDir, onSort: handleSort }) }),
          /* @__PURE__ */ jsx(TableHead, { className: "py-3", children: /* @__PURE__ */ jsx(SortableHeader, { label: t("adminBaseUrl"), field: "base_url", sortField, sortDir, onSort: handleSort }) }),
          /* @__PURE__ */ jsx(TableHead, { className: "py-3 hidden lg:table-cell", children: t("adminToken") }),
          /* @__PURE__ */ jsx(TableHead, { className: "py-3 hidden md:table-cell w-[160px]", children: t("adminCompanyBranches") }),
          /* @__PURE__ */ jsx(TableHead, { className: "w-[60px] py-3" })
        ] }) }),
        /* @__PURE__ */ jsx(TableBody, { children: filteredCompanies.map((company) => /* @__PURE__ */ jsxs(TableRow, { className: "group cursor-pointer transition-colors", onClick: () => handleView(company), children: [
          /* @__PURE__ */ jsx(TableCell, { className: "font-mono text-xs text-muted-foreground", children: company.id }),
          /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2.5", children: [
            /* @__PURE__ */ jsx("div", { className: "flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/8 text-primary", children: /* @__PURE__ */ jsx(Building2, { className: "h-4 w-4" }) }),
            /* @__PURE__ */ jsx("span", { className: "font-medium text-sm", children: company.name })
          ] }) }),
          /* @__PURE__ */ jsx(TableCell, { className: "font-mono text-sm", children: company.inn || "—" }),
          /* @__PURE__ */ jsx(TableCell, { className: "text-sm max-w-[200px] truncate text-muted-foreground", children: company.base_url || "—" }),
          /* @__PURE__ */ jsx(TableCell, { className: "hidden lg:table-cell", children: company.asl_belgi_token ? /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 text-xs font-mono text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-md max-w-[160px] truncate", children: [
            company.asl_belgi_token.slice(0, 12),
            "…"
          ] }) : /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "—" }) }),
          /* @__PURE__ */ jsx(TableCell, { className: "hidden md:table-cell", children: company.branches && company.branches.length > 0 ? /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-1", children: company.branches.map((branch) => /* @__PURE__ */ jsx("span", { className: "inline-flex items-center text-xs bg-secondary/50 px-1.5 py-0.5 rounded-full", children: branch.name }, branch.id)) }) : /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "—" }) }),
          /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsxs(DropdownMenu, { children: [
            /* @__PURE__ */ jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "icon", className: "h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity", onClick: (e) => e.stopPropagation(), children: /* @__PURE__ */ jsx(MoreVertical, { className: "h-4 w-4" }) }) }),
            /* @__PURE__ */ jsxs(DropdownMenuContent, { align: "end", className: "w-44", children: [
              /* @__PURE__ */ jsxs(DropdownMenuItem, { onClick: (e) => {
                e.stopPropagation();
                handleView(company);
              }, children: [
                /* @__PURE__ */ jsx(Eye, { className: "h-4 w-4 mr-2" }),
                t("adminCompanyView")
              ] }),
              /* @__PURE__ */ jsxs(DropdownMenuItem, { onClick: (e) => {
                e.stopPropagation();
                handleEdit(company);
              }, children: [
                /* @__PURE__ */ jsx(Edit, { className: "h-4 w-4 mr-2" }),
                t("edit")
              ] }),
              /* @__PURE__ */ jsxs(DropdownMenuItem, { onClick: (e) => {
                e.stopPropagation();
                handleKeys(company);
              }, children: [
                /* @__PURE__ */ jsx(Key, { className: "h-4 w-4 mr-2" }),
                t("securityKeys")
              ] }),
              /* @__PURE__ */ jsx(DropdownMenuSeparator, {}),
              /* @__PURE__ */ jsxs(DropdownMenuItem, { onClick: (e) => {
                e.stopPropagation();
                handleDelete(company);
              }, className: "text-red-600 focus:text-red-600", children: [
                /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4 mr-2" }),
                t("adminCompanyDelete")
              ] })
            ] })
          ] }) })
        ] }, company.id)) })
      ] }),
      filteredCompanies.length === 0 && !isLoading && /* @__PURE__ */ jsxs("div", { className: "text-center py-16 text-muted-foreground", children: [
        /* @__PURE__ */ jsx(Building2, { className: "h-12 w-12 mx-auto mb-3 opacity-30" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm", children: t("adminCompaniesNotFound") })
      ] })
    ] }) : /* @__PURE__ */ jsx(Fragment, { children: filteredCompanies.length === 0 && !isLoading ? /* @__PURE__ */ jsxs("div", { className: "text-center py-16 text-muted-foreground", children: [
      /* @__PURE__ */ jsx(Building2, { className: "h-12 w-12 mx-auto mb-3 opacity-30" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm", children: t("adminCompaniesNotFound") })
    ] }) : /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4", children: filteredCompanies.map((company) => /* @__PURE__ */ jsx(CompanyCard, { company, onEdit: handleEdit, onDelete: handleDelete, onView: handleView, onKeys: handleKeys, t }, company.id)) }) }),
    /* @__PURE__ */ jsx(Dialog, { open: isViewDialogOpen, onOpenChange: setIsViewDialogOpen, children: /* @__PURE__ */ jsxs(DialogContent, { className: "max-w-lg", children: [
      /* @__PURE__ */ jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx("div", { className: "flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary", children: /* @__PURE__ */ jsx(Building2, { className: "h-4 w-4" }) }),
          t("adminCompanyDetails")
        ] }),
        /* @__PURE__ */ jsx(DialogDescription, { children: t("adminCompanyDetailsDesc") })
      ] }),
      selectedCompany && /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "rounded-lg bg-muted/50 p-3", children: [
            /* @__PURE__ */ jsx("p", { className: "text-[11px] uppercase tracking-wider text-muted-foreground mb-1", children: t("id") }),
            /* @__PURE__ */ jsx("p", { className: "font-mono text-sm font-medium", children: selectedCompany.id })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "rounded-lg bg-muted/50 p-3", children: [
            /* @__PURE__ */ jsx("p", { className: "text-[11px] uppercase tracking-wider text-muted-foreground mb-1", children: t("adminCompanyName") }),
            /* @__PURE__ */ jsx("p", { className: "text-sm font-medium", children: selectedCompany.name })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "rounded-lg bg-muted/50 p-3", children: [
            /* @__PURE__ */ jsx("p", { className: "text-[11px] uppercase tracking-wider text-muted-foreground mb-1", children: "INN" }),
            /* @__PURE__ */ jsx("p", { className: "font-mono text-sm font-medium", children: selectedCompany.inn || "—" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "rounded-lg bg-muted/50 p-3", children: [
            /* @__PURE__ */ jsx("p", { className: "text-[11px] uppercase tracking-wider text-muted-foreground mb-1", children: t("adminBaseUrl") }),
            /* @__PURE__ */ jsx("p", { className: "text-sm font-medium break-all", children: selectedCompany.base_url || "—" })
          ] })
        ] }),
        selectedCompany.asl_belgi_token && /* @__PURE__ */ jsxs("div", { className: "rounded-lg bg-muted/50 p-3", children: [
          /* @__PURE__ */ jsx("p", { className: "text-[11px] uppercase tracking-wider text-muted-foreground mb-1", children: t("adminAslBelgiToken") }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2", children: [
            /* @__PURE__ */ jsx("p", { className: "font-mono text-sm break-all flex-1", children: selectedCompany.asl_belgi_token }),
            /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7 shrink-0", onClick: () => copyToClipboard(selectedCompany.asl_belgi_token), children: /* @__PURE__ */ jsx(Copy, { className: "h-3.5 w-3.5" }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "rounded-lg bg-muted/50 p-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-1", children: [
            /* @__PURE__ */ jsxs("p", { className: "text-[11px] uppercase tracking-wider text-muted-foreground flex items-center gap-1", children: [
              /* @__PURE__ */ jsx(GitBranch, { className: "h-3 w-3" }),
              t("adminCompanyBranches")
            ] }),
            /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "icon", className: "h-5 w-5", onClick: handleAddBranch, children: /* @__PURE__ */ jsx(Plus, { className: "h-3.5 w-3.5" }) })
          ] }),
          selectedCompany.branches && selectedCompany.branches.length > 0 ? /* @__PURE__ */ jsx("div", { className: "space-y-1.5 mt-1", children: selectedCompany.branches.map((branch) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between rounded-md bg-background/50 px-2.5 py-1.5", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xs font-medium", children: branch.name }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-0.5", children: [
              /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "icon", className: "h-6 w-6", onClick: () => handleEditBranch(branch), children: /* @__PURE__ */ jsx(Pencil, { className: "h-3 w-3" }) }),
              /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "icon", className: "h-6 w-6 text-red-500 hover:text-red-600", onClick: () => handleDeleteBranch(branch), children: /* @__PURE__ */ jsx(Trash2, { className: "h-3 w-3" }) })
            ] })
          ] }, branch.id)) }) : /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground/60 italic", children: t("notAvailable") })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => setIsViewDialogOpen(false), children: t("adminClose") }),
        /* @__PURE__ */ jsx(Button, { onClick: () => {
          setIsViewDialogOpen(false);
          handleEdit(selectedCompany);
        }, children: t("edit") })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(Dialog, { open: isAddBranchDialogOpen, onOpenChange: (open) => {
      if (!open) {
        setIsAddBranchDialogOpen(false);
        setBranchName("");
      }
    }, children: /* @__PURE__ */ jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsx(DialogHeader, { children: /* @__PURE__ */ jsx(DialogTitle, { children: t("adminAddBranch") }) }),
      /* @__PURE__ */ jsx("div", { className: "space-y-4 py-2", children: /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "branch-name", children: t("adminBranchName") }),
        /* @__PURE__ */ jsx(Input, { id: "branch-name", value: branchName, onChange: (e) => setBranchName(e.target.value), placeholder: t("adminBranchNamePlaceholder"), onKeyDown: (e) => {
          if (e.key === "Enter") confirmAddBranch();
        } })
      ] }) }),
      /* @__PURE__ */ jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => {
          setIsAddBranchDialogOpen(false);
          setBranchName("");
        }, children: t("cancel") }),
        /* @__PURE__ */ jsx(Button, { onClick: confirmAddBranch, children: t("add") })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(Dialog, { open: isEditBranchDialogOpen, onOpenChange: (open) => {
      if (!open) {
        setIsEditBranchDialogOpen(false);
        setSelectedBranch(null);
        setBranchName("");
      }
    }, children: /* @__PURE__ */ jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsx(DialogHeader, { children: /* @__PURE__ */ jsx(DialogTitle, { children: t("adminEditBranch") }) }),
      /* @__PURE__ */ jsx("div", { className: "space-y-4 py-2", children: /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "edit-branch-name", children: t("adminBranchName") }),
        /* @__PURE__ */ jsx(Input, { id: "edit-branch-name", value: branchName, onChange: (e) => setBranchName(e.target.value), placeholder: t("adminBranchNamePlaceholder"), onKeyDown: (e) => {
          if (e.key === "Enter") confirmEditBranch();
        } })
      ] }) }),
      /* @__PURE__ */ jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => {
          setIsEditBranchDialogOpen(false);
          setSelectedBranch(null);
          setBranchName("");
        }, children: t("cancel") }),
        /* @__PURE__ */ jsx(Button, { onClick: confirmEditBranch, children: t("save") })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(AlertDialog, { open: isDeleteBranchDialogOpen, onOpenChange: (open) => {
      if (!open) {
        setIsDeleteBranchDialogOpen(false);
        setSelectedBranch(null);
      }
    }, children: /* @__PURE__ */ jsxs(AlertDialogContent, { children: [
      /* @__PURE__ */ jsxs(AlertDialogHeader, { children: [
        /* @__PURE__ */ jsx(AlertDialogTitle, { children: t("adminDeleteBranch") }),
        /* @__PURE__ */ jsx(AlertDialogDescription, { children: t("adminBranchDeleteConfirm").replace("{name}", selectedBranch?.name || "") })
      ] }),
      /* @__PURE__ */ jsxs(AlertDialogFooter, { children: [
        /* @__PURE__ */ jsx(AlertDialogCancel, { children: t("cancel") }),
        /* @__PURE__ */ jsx(AlertDialogAction, { onClick: confirmDeleteBranch, className: "bg-red-600 hover:bg-red-700", children: t("adminCompanyDelete") })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(Dialog, { open: isAddDialogOpen || isEditDialogOpen, onOpenChange: (open) => {
      if (!open) {
        setIsAddDialogOpen(false);
        setIsEditDialogOpen(false);
        setFormData(emptyForm);
      }
    }, children: /* @__PURE__ */ jsxs(DialogContent, { className: "max-w-lg", children: [
      /* @__PURE__ */ jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsx(DialogTitle, { children: isEditDialogOpen ? t("adminCompanyEdit") : t("adminCompanyAdd") }),
        /* @__PURE__ */ jsx(DialogDescription, { children: isEditDialogOpen ? t("adminCompanyEditDesc") : t("adminCompanyAddDesc") })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4 py-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "company-name", children: t("adminCompanyNameLabel") }),
          /* @__PURE__ */ jsx(Input, { id: "company-name", value: formData.name, onChange: (e) => setFormData({
            ...formData,
            name: e.target.value
          }), placeholder: t("adminCompanyNamePlaceholder") })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "company-inn", children: "INN" }),
          /* @__PURE__ */ jsx(Input, { id: "company-inn", value: formData.inn, onChange: (e) => setFormData({
            ...formData,
            inn: e.target.value
          }), placeholder: t("adminInnNumber") })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "company-url", children: t("adminBaseUrl") }),
          /* @__PURE__ */ jsx(Input, { id: "company-url", value: formData.base_url, onChange: (e) => setFormData({
            ...formData,
            base_url: e.target.value
          }), placeholder: "https://api.example.com" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "company-token", children: t("adminAslBelgiToken") }),
          /* @__PURE__ */ jsx(Input, { id: "company-token", value: formData.asl_belgi_token, onChange: (e) => setFormData({
            ...formData,
            asl_belgi_token: e.target.value
          }), placeholder: t("adminToken") })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => {
          setIsAddDialogOpen(false);
          setIsEditDialogOpen(false);
          setFormData(emptyForm);
        }, children: t("cancel") }),
        /* @__PURE__ */ jsx(Button, { onClick: isEditDialogOpen ? handleSaveEdit : handleSaveCreate, children: t("save") })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(AlertDialog, { open: isDeleteDialogOpen, onOpenChange: setIsDeleteDialogOpen, children: /* @__PURE__ */ jsxs(AlertDialogContent, { children: [
      /* @__PURE__ */ jsxs(AlertDialogHeader, { children: [
        /* @__PURE__ */ jsx(AlertDialogTitle, { children: t("adminDeleteCompany") }),
        /* @__PURE__ */ jsxs(AlertDialogDescription, { children: [
          t("adminDeleteConfirm").replace("{name}", selectedCompany?.name || ""),
          /* @__PURE__ */ jsx("br", {}),
          /* @__PURE__ */ jsx("span", { className: "text-red-600", children: t("adminIrreversible") })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(AlertDialogFooter, { children: [
        /* @__PURE__ */ jsx(AlertDialogCancel, { children: t("cancel") }),
        /* @__PURE__ */ jsx(AlertDialogAction, { onClick: confirmDelete, className: "bg-red-600 hover:bg-red-700", children: t("adminCompanyDelete") })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs(Dialog, { open: isKeysDialogOpen, onOpenChange: (open) => {
      setIsKeysDialogOpen(open);
      if (!open) setSelectedCompany(null);
    }, children: [
      /* @__PURE__ */ jsxs(DialogContent, { className: "max-w-2xl", children: [
        /* @__PURE__ */ jsxs(DialogHeader, { children: [
          /* @__PURE__ */ jsxs(DialogTitle, { children: [
            t("securityKeys"),
            " — ",
            selectedCompany?.name
          ] }),
          /* @__PURE__ */ jsx(DialogDescription, { children: t("adminManageKeys") })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxs(Button, { size: "sm", onClick: () => setIsAddKeyDialogOpen(true), children: [
            /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4 mr-2" }),
            t("addKey")
          ] }) }),
          securityKeys.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "text-center py-8 text-muted-foreground", children: [
            /* @__PURE__ */ jsx(Key, { className: "h-10 w-10 mx-auto mb-2 opacity-50" }),
            /* @__PURE__ */ jsx("p", { children: t("adminKeysNotFound") })
          ] }) : /* @__PURE__ */ jsxs(Table, { children: [
            /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
              /* @__PURE__ */ jsx(TableHead, { children: t("id") }),
              /* @__PURE__ */ jsx(TableHead, { children: t("keyName") }),
              /* @__PURE__ */ jsx(TableHead, { children: t("actions") })
            ] }) }),
            /* @__PURE__ */ jsx(TableBody, { children: securityKeys.map((sk) => /* @__PURE__ */ jsxs(TableRow, { children: [
              /* @__PURE__ */ jsx(TableCell, { className: "font-mono text-sm", children: sk.id }),
              /* @__PURE__ */ jsx(TableCell, { className: "font-mono text-sm max-w-[300px] truncate", children: sk.key }),
              /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", className: "text-red-600 hover:text-red-700", onClick: () => deleteKeyMutation.mutate(sk.id), children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" }) }) })
            ] }, sk.id)) })
          ] })
        ] }),
        /* @__PURE__ */ jsx(DialogFooter, { children: /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => setIsKeysDialogOpen(false), children: t("adminClose") }) })
      ] }),
      /* @__PURE__ */ jsx(Dialog, { open: isAddKeyDialogOpen, onOpenChange: (open) => {
        setIsAddKeyDialogOpen(open);
        if (!open) setNewKeyName("");
      }, children: /* @__PURE__ */ jsxs(DialogContent, { children: [
        /* @__PURE__ */ jsxs(DialogHeader, { children: [
          /* @__PURE__ */ jsx(DialogTitle, { children: t("adminNewKey") }),
          /* @__PURE__ */ jsx(DialogDescription, { children: t("adminNewKeyDesc") })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "space-y-4", children: /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "key-value", children: t("adminKeyDetails") }),
          /* @__PURE__ */ jsx(Input, { id: "key-value", value: newKeyName, onChange: (e) => setNewKeyName(e.target.value), placeholder: t("adminKeyDetailsPlaceholder") })
        ] }) }),
        /* @__PURE__ */ jsxs(DialogFooter, { children: [
          /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => setIsAddKeyDialogOpen(false), children: t("cancel") }),
          /* @__PURE__ */ jsx(Button, { onClick: handleAddKey, children: t("create") })
        ] })
      ] }) })
    ] })
  ] }) });
}
export {
  AdminCompaniesPage as component
};
