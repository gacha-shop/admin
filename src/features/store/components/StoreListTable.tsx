import { useState } from 'react';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from '@tanstack/react-table';
import { useStores } from '@/hooks/useStores';
import type { Store, ShopType, VerificationStatus } from '@/types/store';

// Column definitions
const columns: ColumnDef<Store>[] = [
  {
    accessorKey: 'name',
    header: '매장명',
    cell: ({ row }) => (
      <div className='font-medium'>{row.getValue('name')}</div>
    ),
  },
  {
    accessorKey: 'shop_type',
    header: '매장 유형',
    cell: ({ row }) => {
      const type = row.getValue('shop_type') as ShopType;
      const typeLabels: Record<ShopType, string> = {
        gacha: '가챠',
        figure: '피규어',
        both: '가챠+피규어',
      };
      return <span>{typeLabels[type]}</span>;
    },
  },
  {
    accessorKey: 'address_full',
    header: '주소',
    cell: ({ row }) => {
      const addressType = row.original.address_type;
      const address =
        addressType === 'J'
          ? row.original.jibun_address
          : row.original.road_address;
      const totalAddress = `${address} ${row.original.detail_address}`;
      return <div className='max-w-md truncate'>{totalAddress}</div>;
    },
  },
  {
    accessorKey: 'verification_status',
    header: '검증 상태',
    cell: ({ row }) => {
      const status = row.getValue('verification_status') as VerificationStatus;
      const statusStyles: Record<VerificationStatus, string> = {
        pending: 'bg-yellow-100 text-yellow-800',
        verified: 'bg-green-100 text-green-800',
        rejected: 'bg-red-100 text-red-800',
      };
      const statusLabels: Record<VerificationStatus, string> = {
        pending: '대기중',
        verified: '검증완료',
        rejected: '거부됨',
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
    accessorKey: 'gacha_machine_count',
    header: '기기 수',
    cell: ({ row }) => {
      const count = row.getValue('gacha_machine_count') as number | null;
      return <span>{count ?? '-'}</span>;
    },
  },
  {
    accessorKey: 'created_at',
    header: '등록일',
    cell: ({ row }) => {
      const date = new Date(row.getValue('created_at'));
      return <span>{date.toLocaleDateString('ko-KR')}</span>;
    },
  },
];

export function StoreListTable() {
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const { data, isLoading, error } = useStores({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
  });

  console.log('data', data);

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
      <div className='flex items-center justify-center h-64'>
        <div className='text-red-600'>
          에러가 발생했습니다:{' '}
          {error instanceof Error ? error.message : '알 수 없는 에러'}
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='text-gray-500'>로딩 중...</div>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      {/* Table */}
      <div className='border border-gray-300 rounded-lg overflow-hidden'>
        <table className='w-full'>
          <thead className='bg-gray-50'>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className='bg-white divide-y divide-gray-200'>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className='hover:bg-gray-50'>
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className='flex items-center justify-between'>
        <div className='text-sm text-gray-700'>
          전체 {data?.pagination.total ?? 0}개 중{' '}
          {pagination.pageIndex * pagination.pageSize + 1}-
          {Math.min(
            (pagination.pageIndex + 1) * pagination.pageSize,
            data?.pagination.total ?? 0
          )}
          개 표시
        </div>
        <div className='flex gap-2'>
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            이전
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            다음
          </button>
        </div>
      </div>
    </div>
  );
}
