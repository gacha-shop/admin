import { useEffect, useState } from 'react';
import { OwnerShopService, type Shop, type BusinessHours as ServiceBusinessHours } from '@/services/owner-shop.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { OperatingHoursModal } from '@/features/store/components/OperatingHoursModal';
import { SHOP_TYPE_OPTIONS } from '@/features/store/types/store.types';
import type { ShopTypeValue, BusinessHours } from '@/features/store/types/store.types';
import { Edit, Save, X, Clock } from 'lucide-react';
import { useTags } from '@/hooks/useTags';
import { TagMultiSelect } from '@/components/tag/TagMultiSelect';

export function OwnerStores() {
  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [operatingHoursOpen, setOperatingHoursOpen] = useState(false);

  const { data: tags } = useTags();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    shop_type: [] as ShopTypeValue[],
    description: '',
    phone: '',
    social_urls: {
      website: '',
      instagram: '',
      x: '',
      youtube: '',
    },
    tag_ids: [] as string[],
    sido: '',
    sigungu: '',
    jibun_address: '',
    road_address: '',
    detail_address: '',
    zone_code: '',
    building_name: '',
    is_24_hours: false,
    business_hours: null as BusinessHours | null,
    gacha_machine_count: '',
  });

  useEffect(() => {
    loadMyShop();
  }, []);

  useEffect(() => {
    if (shop) {
      const existingTagIds = shop.shop_tags?.map((st) => st.tag_id) || [];
      setFormData({
        name: shop.name,
        shop_type: shop.shop_type as ShopTypeValue[],
        description: shop.description || '',
        phone: shop.phone || '',
        social_urls: {
          website: shop.social_urls?.website || '',
          instagram: shop.social_urls?.instagram || '',
          x: shop.social_urls?.x || '',
          youtube: shop.social_urls?.youtube || '',
        },
        tag_ids: existingTagIds,
        sido: shop.sido,
        sigungu: shop.sigungu || '',
        jibun_address: shop.jibun_address || '',
        road_address: shop.road_address,
        detail_address: shop.detail_address || '',
        zone_code: shop.zone_code || '',
        building_name: shop.building_name || '',
        is_24_hours: shop.is_24_hours || false,
        business_hours: shop.business_hours,
        gacha_machine_count: shop.gacha_machine_count?.toString() || '',
      });
    }
  }, [shop]);

  const loadMyShop = async () => {
    setLoading(true);
    setError(null);

    try {
      const { ownerships, error: ownershipError } =
        await OwnerShopService.getMyShopOwnership();

      if (ownershipError || !ownerships || ownerships.length === 0) {
        setError(ownershipError?.message || '등록된 매장이 없습니다');
        setLoading(false);
        return;
      }

      const shopId = ownerships[0].shops.id;
      const shopData = await OwnerShopService.getMyShop(shopId);
      setShop(shopData);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : '매장 정보를 불러올 수 없습니다'
      );
    }

    setLoading(false);
  };

  const handleSave = async () => {
    if (!shop) return;

    try {
      const updates = {
        name: formData.name || undefined,
        shop_type: formData.shop_type.length > 0 ? formData.shop_type : undefined,
        tag_ids: formData.tag_ids.length > 0 ? formData.tag_ids : undefined,
        description: formData.description || undefined,
        phone: formData.phone || undefined,
        business_hours: formData.is_24_hours ? undefined : (formData.business_hours as ServiceBusinessHours) || undefined,
        is_24_hours: formData.is_24_hours,
        gacha_machine_count: formData.gacha_machine_count
          ? parseInt(formData.gacha_machine_count)
          : undefined,
        detail_address: formData.detail_address || undefined,
        social_urls: {
          website: formData.social_urls.website || undefined,
          instagram: formData.social_urls.instagram || undefined,
          x: formData.social_urls.x || undefined,
          youtube: formData.social_urls.youtube || undefined,
        },
      };

      const updatedShop = await OwnerShopService.updateMyShop(shop.id, updates);
      setShop(updatedShop);
      setIsEditMode(false);
      alert('매장 정보가 성공적으로 수정되었습니다!');
    } catch (error) {
      console.error('매장 수정 실패:', error);
      alert(
        `매장 수정 실패: ${
          error instanceof Error ? error.message : '알 수 없는 오류'
        }`
      );
    }
  };

  const handleCancel = () => {
    if (shop) {
      const existingTagIds = shop.shop_tags?.map((st) => st.tag_id) || [];
      setFormData({
        name: shop.name,
        shop_type: shop.shop_type as ShopTypeValue[],
        description: shop.description || '',
        phone: shop.phone || '',
        social_urls: {
          website: shop.social_urls?.website || '',
          instagram: shop.social_urls?.instagram || '',
          x: shop.social_urls?.x || '',
          youtube: shop.social_urls?.youtube || '',
        },
        tag_ids: existingTagIds,
        sido: shop.sido,
        sigungu: shop.sigungu || '',
        jibun_address: shop.jibun_address || '',
        road_address: shop.road_address,
        detail_address: shop.detail_address || '',
        zone_code: shop.zone_code || '',
        building_name: shop.building_name || '',
        is_24_hours: shop.is_24_hours || false,
        business_hours: shop.business_hours,
        gacha_machine_count: shop.gacha_machine_count?.toString() || '',
      });
    }
    setIsEditMode(false);
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
          <p className='text-gray-600'>매장 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-center'>
          <div className='rounded-md bg-red-50 p-4 max-w-md'>
            <div className='flex'>
              <div className='shrink-0'>
                <svg
                  className='h-5 w-5 text-red-400'
                  viewBox='0 0 20 20'
                  fill='currentColor'
                >
                  <path
                    fillRule='evenodd'
                    d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
                    clipRule='evenodd'
                  />
                </svg>
              </div>
              <div className='ml-3'>
                <h3 className='text-sm font-medium text-red-800'>
                  오류가 발생했습니다
                </h3>
                <p className='mt-2 text-sm text-red-700'>{error}</p>
                <div className='mt-4'>
                  <Button
                    onClick={loadMyShop}
                    variant='outline'
                    size='sm'
                    className='mr-2'
                  >
                    다시 시도
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-center max-w-md'>
          <svg
            className='mx-auto h-12 w-12 text-gray-400'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'
            />
          </svg>
          <h3 className='mt-2 text-sm font-semibold text-gray-900'>
            등록된 매장이 없습니다
          </h3>
          <p className='mt-1 text-sm text-gray-500'>
            관리자의 승인을 기다리고 있거나 아직 매장이 등록되지 않았습니다.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 py-8'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Header */}
        <div className='mb-8 flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold text-gray-900'>내 매장 관리</h1>
            <p className='mt-2 text-sm text-gray-600'>
              등록된 매장 정보를 확인하고 관리할 수 있습니다
            </p>
          </div>
          <div className='flex gap-2'>
            {isEditMode ? (
              <>
                <Button
                  variant='outline'
                  onClick={handleCancel}
                  className='gap-2'
                >
                  <X className='w-4 h-4' />
                  취소
                </Button>
                <Button onClick={handleSave} className='gap-2'>
                  <Save className='w-4 h-4' />
                  저장
                </Button>
              </>
            ) : (
              <Button
                onClick={() => setIsEditMode(true)}
                className='gap-2'
              >
                <Edit className='w-4 h-4' />
                편집
              </Button>
            )}
          </div>
        </div>

        {/* Form Content */}
        <div className='bg-white shadow rounded-lg p-6'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
            {/* Left Column */}
            <div className='space-y-6'>
              {/* 기본 정보 */}
              <div className='space-y-4'>
                <h3 className='text-sm font-semibold text-gray-900 border-b pb-2'>
                  기본 정보
                </h3>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    스토어 이름 <span className='text-red-500'>*</span>
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder='예: 홍대 가챠샵'
                    disabled={!isEditMode}
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    스토어 타입 <span className='text-red-500'>*</span>
                  </label>
                  <div className='space-y-2'>
                    {SHOP_TYPE_OPTIONS.map((option) => (
                      <div key={option.value} className='flex items-center space-x-2'>
                        <Checkbox
                          id={`shop-type-${option.value}`}
                          checked={formData.shop_type?.includes(option.value)}
                          onCheckedChange={(checked) => {
                            const currentValue = formData.shop_type || [];
                            if (checked) {
                              setFormData({
                                ...formData,
                                shop_type: [...currentValue, option.value],
                              });
                            } else {
                              setFormData({
                                ...formData,
                                shop_type: currentValue.filter((v) => v !== option.value),
                              });
                            }
                          }}
                          disabled={!isEditMode}
                        />
                        <label
                          htmlFor={`shop-type-${option.value}`}
                          className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer'
                        >
                          {option.label}
                        </label>
                      </div>
                    ))}
                  </div>
                  <p className='text-xs text-gray-500 mt-1'>
                    복수 선택 가능
                  </p>
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    태그
                  </label>
                  <TagMultiSelect
                    tags={tags || []}
                    selectedTagIds={formData.tag_ids}
                    onSelectedChange={(tagIds) =>
                      setFormData({ ...formData, tag_ids: tagIds })
                    }
                    disabled={!isEditMode}
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    설명
                  </label>
                  <textarea
                    className='flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                    placeholder='스토어에 대한 설명을 입력하세요'
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    disabled={!isEditMode}
                  />
                </div>
              </div>

              {/* 연락처 정보 */}
              <div className='space-y-4'>
                <h3 className='text-sm font-semibold text-gray-900 border-b pb-2'>
                  연락처
                </h3>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    전화번호
                  </label>
                  <Input
                    type='tel'
                    placeholder='예: 02-1234-5678'
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    disabled={!isEditMode}
                  />
                </div>
              </div>

              {/* SNS 정보 */}
              <div className='space-y-4'>
                <h3 className='text-sm font-semibold text-gray-900 border-b pb-2'>
                  SNS 정보
                </h3>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    웹사이트 URL
                  </label>
                  <Input
                    type='url'
                    placeholder='https://example.com'
                    value={formData.social_urls.website}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        social_urls: {
                          ...formData.social_urls,
                          website: e.target.value,
                        },
                      })
                    }
                    disabled={!isEditMode}
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    인스타그램
                  </label>
                  <Input
                    type='url'
                    placeholder='https://instagram.com/your_account'
                    value={formData.social_urls.instagram}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        social_urls: {
                          ...formData.social_urls,
                          instagram: e.target.value,
                        },
                      })
                    }
                    disabled={!isEditMode}
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    X (Twitter)
                  </label>
                  <Input
                    type='url'
                    placeholder='https://x.com/your_account'
                    value={formData.social_urls.x}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        social_urls: {
                          ...formData.social_urls,
                          x: e.target.value,
                        },
                      })
                    }
                    disabled={!isEditMode}
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    유튜브
                  </label>
                  <Input
                    type='url'
                    placeholder='https://youtube.com/@your_channel'
                    value={formData.social_urls.youtube}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        social_urls: {
                          ...formData.social_urls,
                          youtube: e.target.value,
                        },
                      })
                    }
                    disabled={!isEditMode}
                  />
                </div>
              </div>

              {/* 운영 정보 */}
              <div className='space-y-4'>
                <h3 className='text-sm font-semibold text-gray-900 border-b pb-2'>
                  운영 정보
                </h3>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    영업시간
                  </label>
                  <Button
                    type='button'
                    variant='outline'
                    onClick={() => setOperatingHoursOpen(true)}
                    className='w-full gap-2'
                    disabled={!isEditMode}
                  >
                    <Clock className='w-4 h-4' />
                    {formData.is_24_hours
                      ? '24시간 영업'
                      : formData.business_hours
                      ? '영업시간 설정됨'
                      : '영업시간 설정'}
                  </Button>
                  <p className='text-xs text-gray-500 mt-1'>
                    버튼을 클릭하여 영업시간을 설정하세요
                  </p>
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    가챠 머신 개수
                  </label>
                  <Input
                    type='number'
                    min='0'
                    placeholder='0'
                    value={formData.gacha_machine_count}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        gacha_machine_count: e.target.value,
                      })
                    }
                    disabled={!isEditMode}
                  />
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className='space-y-6'>
              {/* 위치 정보 */}
              <div className='space-y-4'>
                <h3 className='text-sm font-semibold text-gray-900 border-b pb-2'>
                  위치 정보
                </h3>

                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      시/도 <span className='text-red-500'>*</span>
                    </label>
                    <Input
                      placeholder='서울특별시'
                      value={formData.sido}
                      disabled
                      readOnly
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      시/군/구
                    </label>
                    <Input
                      placeholder='강남구'
                      value={formData.sigungu}
                      disabled
                      readOnly
                    />
                  </div>
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    도로명 주소 <span className='text-red-500'>*</span>
                  </label>
                  <Input
                    placeholder='서울 강남구 테헤란로 123'
                    value={formData.road_address}
                    disabled
                    readOnly
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    지번 주소
                  </label>
                  <Input
                    placeholder='서울 강남구 역삼동 123-45'
                    value={formData.jibun_address}
                    disabled
                    readOnly
                  />
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      건물명
                    </label>
                    <Input
                      placeholder='테헤란빌딩'
                      value={formData.building_name}
                      disabled
                      readOnly
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      우편번호
                    </label>
                    <Input
                      placeholder='06234'
                      value={formData.zone_code}
                      disabled
                      readOnly
                    />
                  </div>
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    상세 주소
                  </label>
                  <Input
                    placeholder='101호, 2층 등 상세 주소를 입력하세요'
                    value={formData.detail_address}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        detail_address: e.target.value,
                      })
                    }
                    disabled={!isEditMode}
                  />
                  <p className='text-xs text-gray-500 mt-1'>
                    동/호수 등 추가 주소 정보를 입력하세요
                  </p>
                </div>

                <p className='text-xs text-gray-500'>
                  주소 정보는 관리자만 수정할 수 있습니다
                </p>
              </div>

              {/* 검증 정보 */}
              <div className='space-y-4'>
                <h3 className='text-sm font-semibold text-gray-900 border-b pb-2'>
                  검증 정보
                </h3>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    검증 상태
                  </label>
                  <Select value={shop.verification_status} disabled>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='pending'>검증 대기 (Pending)</SelectItem>
                      <SelectItem value='verified'>검증 완료 (Verified)</SelectItem>
                      <SelectItem value='rejected'>검증 거부 (Rejected)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className='text-xs text-gray-500 mt-1'>
                    검증 상태는 관리자만 변경할 수 있습니다
                  </p>
                </div>
              </div>

              {/* 등록 정보 */}
              <div className='space-y-4'>
                <h3 className='text-sm font-semibold text-gray-900 border-b pb-2'>
                  등록 정보
                </h3>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    등록일
                  </label>
                  <Input
                    value={new Date(shop.created_at).toLocaleString('ko-KR')}
                    disabled
                    readOnly
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    최종 수정일
                  </label>
                  <Input
                    value={new Date(shop.updated_at).toLocaleString('ko-KR')}
                    disabled
                    readOnly
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <OperatingHoursModal
        open={operatingHoursOpen}
        onOpenChange={setOperatingHoursOpen}
        is24Hours={formData.is_24_hours}
        businessHours={formData.business_hours}
        onSave={(is24Hours, businessHours) => {
          setFormData({
            ...formData,
            is_24_hours: is24Hours,
            business_hours: businessHours,
          });
        }}
      />
    </div>
  );
}
