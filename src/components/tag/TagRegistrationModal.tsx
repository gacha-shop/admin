'use no memo';

import { useEffect, useState } from 'react';
import { useCreateTag, useUpdateTag } from '@/hooks/useTags';
import type { Tag } from '@/types/tag';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface TagRegistrationModalProps {
  tag?: Tag;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TagRegistrationModal({
  tag,
  open,
  onOpenChange,
}: TagRegistrationModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const isEditMode = !!tag;
  const createTag = useCreateTag();
  const updateTag = useUpdateTag();

  // Reset form when modal opens/closes or tag changes
  useEffect(() => {
    if (open && isEditMode && tag) {
      setName(tag.name);
      setDescription(tag.description || '');
    } else if (open && !isEditMode) {
      setName('');
      setDescription('');
    }
  }, [open, isEditMode, tag]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isEditMode && tag) {
        await updateTag.mutateAsync({
          id: tag.id,
          name,
          description: description || undefined,
        });
      } else {
        await createTag.mutateAsync({
          name,
          description: description || undefined,
        });
      }
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to save tag:', error);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  const isLoading = createTag.isPending || updateTag.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>{isEditMode ? '태그 수정' : '새 태그 등록'}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? '태그 정보를 수정하세요.'
              : '새로운 태그를 등록하세요.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className='space-y-4 py-4'>
            {/* Tag Name */}
            <div className='space-y-2'>
              <Label htmlFor='name' className='required'>
                태그명
              </Label>
              <Input
                id='name'
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder='태그명을 입력하세요'
                required
              />
            </div>

            {/* Description */}
            <div className='space-y-2'>
              <Label htmlFor='description'>설명</Label>
              <Textarea
                id='description'
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder='태그에 대한 설명을 입력하세요 (선택사항)'
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={handleCancel}
              disabled={isLoading}
            >
              취소
            </Button>
            <Button type='submit' disabled={isLoading || !name.trim()}>
              {isLoading
                ? isEditMode
                  ? '수정 중...'
                  : '등록 중...'
                : isEditMode
                  ? '수정'
                  : '등록'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
