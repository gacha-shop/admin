'use no memo';

import { useState } from 'react';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from '@tanstack/react-table';
import { useDeleteTag, useTags } from '@/hooks/useTags';
import type { Tag } from '@/types/tag';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { TagRegistrationModal } from '@/components/tag/TagRegistrationModal';

interface ColumnsProps {
  onDeleteClick: (tag: Tag) => void;
  onEditClick: (tag: Tag) => void;
}

// Column definitions
const createColumns = ({
  onDeleteClick,
  onEditClick,
}: ColumnsProps): ColumnDef<Tag>[] => [
  {
    accessorKey: 'name',
    header: '태그명',
    cell: ({ row }) => (
      <button
        onClick={() => onEditClick(row.original)}
        className='font-medium text-blue-600 hover:text-blue-800 hover:underline cursor-pointer'
      >
        {row.getValue('name')}
      </button>
    ),
  },
  {
    accessorKey: 'description',
    header: '설명',
    cell: ({ row }) => {
      const description = row.getValue('description') as string | null;
      return (
        <div className='max-w-md truncate text-gray-600'>
          {description || '-'}
        </div>
      );
    },
  },
  {
    accessorKey: 'shop_tags',
    header: '연결된 매장 수',
    cell: ({ row }) => {
      const shopTags = row.getValue('shop_tags') as { count: number }[];
      const count = shopTags?.[0]?.count ?? 0;
      return <span className='text-gray-900'>{count}</span>;
    },
  },
  {
    accessorKey: 'is_deleted',
    header: '상태',
    cell: ({ row }) => {
      const isDeleted = row.getValue('is_deleted') as boolean;
      return (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            isDeleted
              ? 'bg-red-100 text-red-800'
              : 'bg-green-100 text-green-800'
          }`}
        >
          {isDeleted ? '삭제됨' : '활성'}
        </span>
      );
    },
  },
  {
    accessorKey: 'created_at',
    header: '생성일',
    cell: ({ row }) => {
      const date = new Date(row.getValue('created_at'));
      return (
        <span className='text-gray-900'>
          {date.toLocaleDateString('ko-KR')}
        </span>
      );
    },
  },
  {
    id: 'actions',
    header: '액션',
    cell: ({ row }) => (
      <Button
        variant='ghost'
        size='icon-sm'
        onClick={() => onDeleteClick(row.original)}
        className='text-red-600 hover:text-red-700 hover:bg-red-50'
      >
        <Trash2 className='h-4 w-4' />
      </Button>
    ),
  },
];

export default function Tags() {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tagToDelete, setTagToDelete] = useState<Tag | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<Tag | undefined>(undefined);

  const { data, isLoading, error } = useTags();
  const deleteTag = useDeleteTag();

  const handleEditClick = (tag: Tag) => {
    setSelectedTag(tag);
    setEditModalOpen(true);
  };

  const handleCreateClick = () => {
    setCreateModalOpen(true);
  };

  const handleDeleteClick = (tag: Tag) => {
    setTagToDelete(tag);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!tagToDelete) return;

    try {
      await deleteTag.mutateAsync(tagToDelete.id);
      setDeleteDialogOpen(false);
      setTagToDelete(null);
    } catch (error) {
      console.error('Failed to delete tag:', error);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setTagToDelete(null);
  };

  const columns = createColumns({
    onDeleteClick: handleDeleteClick,
    onEditClick: handleEditClick,
  });

  const table = useReactTable({
    data: data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
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
    <div>
      {/* Create Modal */}
      <TagRegistrationModal
        open={createModalOpen}
        onOpenChange={(open) => {
          setCreateModalOpen(open);
        }}
      />

      {/* Edit Modal */}
      <TagRegistrationModal
        tag={selectedTag}
        open={editModalOpen}
        onOpenChange={(open) => {
          setEditModalOpen(open);
          if (!open) {
            setSelectedTag(undefined);
          }
        }}
      />

      <div className='flex items-center justify-between mb-6'>
        <h1 className='text-2xl font-bold text-gray-800'>태그 관리</h1>
        <Button onClick={handleCreateClick}>
          <Plus className='h-4 w-4 mr-2' />새 태그 등록
        </Button>
      </div>
      <div className='bg-white rounded-lg shadow p-6'>
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
                {table.getRowModel().rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className='px-6 py-8 text-center text-sm text-gray-500'
                    >
                      등록된 태그가 없습니다.
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <tr key={row.id} className='hover:bg-gray-50'>
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Total Count */}
          {data && data.length > 0 && (
            <div className='text-sm text-gray-700'>
              전체 {data.length}개의 태그
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>태그 삭제</DialogTitle>
            <DialogDescription>
              정말로 <strong>{tagToDelete?.name}</strong> 태그를
              삭제하시겠습니까?
              <br />이 작업은 되돌릴 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={handleDeleteCancel}
              disabled={deleteTag.isPending}
            >
              취소
            </Button>
            <Button
              variant='destructive'
              onClick={handleDeleteConfirm}
              disabled={deleteTag.isPending}
            >
              {deleteTag.isPending ? '삭제 중...' : '삭제'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
