"use client";

import * as React from "react";
import { ArrowUpDown, Search } from "lucide-react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface Column<T> {
  key: string;
  header: string;
  /** Cell renderer. Falls back to `String(row[key])` when omitted. */
  cell?: (row: T) => React.ReactNode;
  /** Value used for sorting and search. Omit to make the column inert. */
  value?: (row: T) => string | number;
  className?: string;
  align?: "left" | "right";
}

interface DataTableProps<T> {
  rows: T[];
  columns: Column<T>[];
  rowKey: (row: T) => string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  toolbar?: React.ReactNode;
  pageSize?: number;
}

/**
 * Client-side table with search, sort and paging. Every admin list uses it, so
 * the dashboard behaves identically whichever screen you are on.
 */
export function DataTable<T>({
  rows,
  columns,
  rowKey,
  searchPlaceholder = "Search",
  emptyMessage = "Nothing here yet.",
  toolbar,
  pageSize = 12,
}: DataTableProps<T>) {
  const [term, setTerm] = React.useState("");
  const [sort, setSort] = React.useState<{ key: string; dir: "asc" | "desc" } | null>(null);
  const [page, setPage] = React.useState(1);

  const searchable = React.useMemo(() => columns.filter((c) => c.value), [columns]);

  const filtered = React.useMemo(() => {
    const q = term.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) =>
      searchable.some((column) => String(column.value!(row)).toLowerCase().includes(q)),
    );
  }, [rows, term, searchable]);

  const sorted = React.useMemo(() => {
    if (!sort) return filtered;
    const column = columns.find((c) => c.key === sort.key);
    if (!column?.value) return filtered;

    return [...filtered].sort((a, b) => {
      const av = column.value!(a);
      const bv = column.value!(b);
      const result =
        typeof av === "number" && typeof bv === "number"
          ? av - bv
          : String(av).localeCompare(String(bv));
      return sort.dir === "asc" ? result : -result;
    });
  }, [filtered, sort, columns]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const current = Math.min(page, pageCount);
  const visible = sorted.slice((current - 1) * pageSize, current * pageSize);

  // Any change to the result set sends you back to the first page. Adjusted
  // during render so page 2 of the old result set is never briefly shown.
  const resultKey = `${term}|${sort?.key ?? ""}|${sort?.dir ?? ""}`;
  const [prevResultKey, setPrevResultKey] = React.useState(resultKey);
  if (resultKey !== prevResultKey) {
    setPrevResultKey(resultKey);
    setPage(1);
  }

  const toggleSort = (key: string) =>
    setSort((prev) =>
      prev?.key === key
        ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "asc" },
    );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative max-w-xs flex-1">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            className="pl-10"
          />
        </div>
        {toolbar}
      </div>

      <div className="overflow-hidden rounded-3xl border border-border bg-card">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                {columns.map((column) => (
                  <TableHead
                    key={column.key}
                    className={cn(column.align === "right" && "text-right", column.className)}
                  >
                    {column.value ? (
                      <button
                        type="button"
                        onClick={() => toggleSort(column.key)}
                        className={cn(
                          "inline-flex items-center gap-1.5 transition-colors hover:text-foreground",
                          sort?.key === column.key && "text-foreground",
                        )}
                      >
                        {column.header}
                        <ArrowUpDown className="h-3 w-3" aria-hidden />
                      </button>
                    ) : (
                      column.header
                    )}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody>
              {visible.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="py-16 text-center text-sm text-muted-foreground"
                  >
                    {term ? `Nothing matches “${term}”.` : emptyMessage}
                  </TableCell>
                </TableRow>
              ) : (
                visible.map((row) => (
                  <TableRow key={rowKey(row)}>
                    {columns.map((column) => (
                      <TableCell
                        key={column.key}
                        className={cn(column.align === "right" && "text-right", column.className)}
                      >
                        {column.cell
                          ? column.cell(row)
                          : column.value
                            ? String(column.value(row))
                            : null}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {pageCount > 1 ? (
        <div className="flex items-center justify-between text-sm">
          <p className="text-muted-foreground">
            Showing {(current - 1) * pageSize + 1}–{Math.min(current * pageSize, sorted.length)} of{" "}
            {sorted.length}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={current === 1}
              className="rounded-full border border-border px-4 py-1.5 transition-colors hover:bg-secondary disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
              disabled={current === pageCount}
              className="rounded-full border border-border px-4 py-1.5 transition-colors hover:bg-secondary disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
