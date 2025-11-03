import { useState } from 'react';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import type { Tag } from '@/types/tag';

interface TagMultiSelectProps {
  tags: Tag[];
  selectedTagIds: string[];
  onSelectedChange: (tagIds: string[]) => void;
  disabled?: boolean;
}

export function TagMultiSelect({
  tags,
  selectedTagIds,
  onSelectedChange,
  disabled = false,
}: TagMultiSelectProps) {
  const [open, setOpen] = useState(false);

  const selectedTags = tags.filter((tag) => selectedTagIds.includes(tag.id));

  const toggleTag = (tagId: string) => {
    const newSelection = selectedTagIds.includes(tagId)
      ? selectedTagIds.filter((id) => id !== tagId)
      : [...selectedTagIds, tagId];
    onSelectedChange(newSelection);
  };

  const removeTag = (tagId: string) => {
    onSelectedChange(selectedTagIds.filter((id) => id !== tagId));
  };

  return (
    <div className='space-y-2'>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant='outline'
            role='combobox'
            aria-expanded={open}
            className='w-full justify-between'
            disabled={disabled}
          >
            <span className='text-muted-foreground'>
              {selectedTagIds.length === 0
                ? '태그를 선택하세요'
                : `${selectedTagIds.length}개 선택됨`}
            </span>
            <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-full p-0' align='start'>
          <Command>
            <CommandInput placeholder='태그 검색...' />
            <CommandList>
              <CommandEmpty>태그를 찾을 수 없습니다.</CommandEmpty>
              <CommandGroup>
                {tags.map((tag) => {
                  const isSelected = selectedTagIds.includes(tag.id);
                  return (
                    <CommandItem
                      key={tag.id}
                      value={tag.name}
                      onSelect={() => toggleTag(tag.id)}
                    >
                      <div
                        className={cn(
                          'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
                          isSelected
                            ? 'bg-primary text-primary-foreground'
                            : 'opacity-50 [&_svg]:invisible'
                        )}
                      >
                        <Check className='h-4 w-4' />
                      </div>
                      <div className='flex flex-col'>
                        <span>{tag.name}</span>
                        {tag.description && (
                          <span className='text-xs text-muted-foreground'>
                            {tag.description}
                          </span>
                        )}
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Selected tags as badges */}
      {selectedTags.length > 0 && (
        <div className='flex flex-wrap gap-2'>
          {selectedTags.map((tag) => (
            <Badge
              key={tag.id}
              variant='outline'
              className='gap-1 pr-1'
            >
              <span>{tag.name}</span>
              <button
                type='button'
                onClick={() => removeTag(tag.id)}
                disabled={disabled}
                className='ml-1 rounded-full hover:bg-muted p-0.5'
              >
                <X className='h-3 w-3' />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
