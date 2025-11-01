interface ShopCount {
  count: number;
}

export interface Tag {
  id: string;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  deleted_at: string | null;
  name: string;
  description: string | null;
  created_by: string | null;
  updated_by: string | null;
  shop_tags: ShopCount[];
}
