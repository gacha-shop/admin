"use no memo";

import { useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { Trash2 } from "lucide-react";
import { useStores, useDeleteStore } from "@/hooks/useStores";
import type { Store, ShopType, VerificationStatus } from "@/types/store";
import { formatShopTypes } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StoreRegistrationModal } from "./StoreRegistrationModal";

interface ColumnsProps {
  onDeleteClick: (store: Store) => void;
  onEditClick: (store: Store) => void;
}

// Column definitions
const createColumns = ({
  onDeleteClick,
  onEditClick,
}: ColumnsProps): ColumnDef<Store>[] => [
  {
    accessorKey: "name",
    header: "매장명",
    cell: ({ row }) => (
      <button
        onClick={() => onEditClick(row.original)}
        className="font-medium text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
      >
        {row.getValue("name")}
      </button>
    ),
  },
  {
    accessorKey: "shop_type",
    header: "매장 유형",
    cell: ({ row }) => {
      const types = row.getValue("shop_type") as ShopType;
      return <span>{formatShopTypes(types)}</span>;
    },
  },
  {
    accessorKey: "address_full",
    header: "주소",
    cell: ({ row }) => {
      const addressType = row.original.address_type;
      const address =
        (addressType === "J"
          ? row.original.jibun_address
          : row.original.road_address) || row.original.road_address;
      const totalAddress = `${address} ${row.original.detail_address || ""}`;
      return (
        <div className="max-w-xs truncate" title={totalAddress}>
          {totalAddress}
        </div>
      );
    },
  },
  {
    accessorKey: "verification_status",
    header: "검증 상태",
    cell: ({ row }) => {
      const status = row.getValue("verification_status") as VerificationStatus;
      const statusStyles: Record<VerificationStatus, string> = {
        pending: "bg-yellow-100 text-yellow-800",
        verified: "bg-green-100 text-green-800",
        rejected: "bg-red-100 text-red-800",
      };
      const statusLabels: Record<VerificationStatus, string> = {
        pending: "대기중",
        verified: "검증완료",
        rejected: "거부됨",
      };
      return (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[status]}`}
        >
          {statusLabels[status]}
        </span>
      );
    },
  },
  {
    accessorKey: "gacha_machine_count",
    header: "기기 수",
    cell: ({ row }) => {
      const count = row.getValue("gacha_machine_count") as number | null;
      return <span>{count ?? "-"}</span>;
    },
  },
  {
    accessorKey: "created_at",
    header: "등록일",
    cell: ({ row }) => {
      const date = new Date(row.getValue("created_at"));
      return <span>{date.toLocaleDateString("ko-KR")}</span>;
    },
  },
  {
    id: "actions",
    header: "액션",
    cell: ({ row }) => (
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => onDeleteClick(row.original)}
        className="text-red-600 hover:text-red-700 hover:bg-red-50"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    ),
  },
];

export function StoreListTable() {
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [storeToDelete, setStoreToDelete] = useState<Store | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedStoreId, setSelectedStoreId] = useState<string | undefined>(
    undefined
  );

  const { data, isLoading, error } = useStores({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
  });

  const deleteStore = useDeleteStore();

  const handleEditClick = (store: Store) => {
    setSelectedStoreId(store.id);
    setEditModalOpen(true);
  };

  const handleDeleteClick = (store: Store) => {
    setStoreToDelete(store);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!storeToDelete) return;

    try {
      await deleteStore.mutateAsync(storeToDelete.id);
      setDeleteDialogOpen(false);
      setStoreToDelete(null);
    } catch (error) {
      console.error("Failed to delete store:", error);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setStoreToDelete(null);
  };

  const columns = createColumns({
    onDeleteClick: handleDeleteClick,
    onEditClick: handleEditClick,
  });

  const table = useReactTable({
    data: data?.data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: data?.pagination.totalPages ?? 0,
    state: {
      pagination,
    },
    onPaginationChange: setPagination,
  });

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-600">
          에러가 발생했습니다:{" "}
          {error instanceof Error ? error.message : "알 수 없는 에러"}
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  return (
    <>
      {/* Edit Modal */}
      <StoreRegistrationModal
        storeId={selectedStoreId}
        open={editModalOpen}
        onOpenChange={(open) => {
          setEditModalOpen(open);
          if (!open) {
            setSelectedStoreId(undefined);
          }
        }}
      />

      <div className="space-y-4">
        {/* Table with horizontal scroll */}
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  데이터가 없습니다.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            전체 {data?.pagination.total ?? 0}개 중{" "}
            {pagination.pageIndex * pagination.pageSize + 1}-
            {Math.min(
              (pagination.pageIndex + 1) * pagination.pageSize,
              data?.pagination.total ?? 0
            )}
            개 표시
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              이전
            </Button>
            <Button
              variant="outline"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              다음
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>스토어 삭제</DialogTitle>
            <DialogDescription>
              정말로 <strong>{storeToDelete?.name}</strong> 스토어를
              삭제하시겠습니까?
              <br />이 작업은 되돌릴 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleDeleteCancel}
              disabled={deleteStore.isPending}
            >
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteStore.isPending}
            >
              {deleteStore.isPending ? "삭제 중..." : "삭제"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
