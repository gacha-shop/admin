import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search } from 'lucide-react';
import type { CreateStoreFormData, CreateStoreDto } from '../types/store.types';
import { supabase } from '@/lib/supabase';
import { AddressSearchDialog, type AddressData } from './AddressSearchDialog';

export function StoreRegistrationModal() {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addressSearchOpen, setAddressSearchOpen] = useState(false);

  const form = useForm<CreateStoreFormData>({
    defaultValues: {
      name: '',
      shop_type: '',
      description: '',
      phone: '',
      website_url: '',
      sido: '',
      sigungu: '',
      jibun_address: '',
      road_address: '',
      detail_address: '',
      zone_code: '',
      building_name: '',
      address_type: '',
      latitude: '',
      longitude: '',
      is_24_hours: false,
      gacha_machine_count: '',
      verification_status: 'pending',
      data_source: 'admin_input',
      thumbnail_url: '',
      cover_image_url: '',
      admin_notes: '',
    },
  });

  const onSubmit = async (data: CreateStoreFormData) => {
    setIsSubmitting(true);

    try {
      // Transform form data to DTO
      const dto: CreateStoreDto = {
        name: data.name,
        shop_type: data.shop_type as 'gacha' | 'figure' | 'both',
        description: data.description || undefined,
        phone: data.phone || undefined,
        website_url: data.website_url || undefined,
        sido: data.sido,
        sigungu: data.sigungu || undefined,
        jibun_address: data.jibun_address || undefined,
        road_address: data.road_address,
        detail_address: data.detail_address || undefined,
        zone_code: data.zone_code || undefined,
        building_name: data.building_name || undefined,
        address_type: data.address_type || undefined,
        latitude: parseFloat(data.latitude),
        longitude: parseFloat(data.longitude),
        is_24_hours: data.is_24_hours,
        gacha_machine_count: data.gacha_machine_count
          ? parseInt(data.gacha_machine_count)
          : undefined,
        verification_status: data.verification_status,
        data_source: data.data_source,
        thumbnail_url: data.thumbnail_url || undefined,
        cover_image_url: data.cover_image_url || undefined,
        admin_notes: data.admin_notes || undefined,
      };

      // Get session for authentication
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
      console.log('session', session);

      if (sessionError || !session) {
        throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
      }

      // Call Edge Function
      const { data: result, error } = await supabase.functions.invoke(
        'admin-create-shop',
        {
          body: dto,
        }
      );

      if (error) {
        throw error;
      }

      console.log('스토어 생성 성공:', result);
      alert('스토어가 성공적으로 등록되었습니다!');

      setOpen(false);
      form.reset();
    } catch (error) {
      console.error('스토어 등록 실패:', error);
      alert(
        `스토어 등록 실패: ${
          error instanceof Error ? error.message : '알 수 없는 오류'
        }`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className='gap-2'>
          <Plus className='w-4 h-4' />
          스토어 등록
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[700px] max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>스토어 등록</DialogTitle>
          <DialogDescription>
            새로운 스토어 정보를 입력해주세요. (*) 표시는 필수 항목입니다.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            {/* 기본 정보 */}
            <div className='space-y-4'>
              <h3 className='text-sm font-semibold text-gray-900'>기본 정보</h3>

              <FormField
                control={form.control}
                name='name'
                rules={{ required: '스토어 이름은 필수입니다' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      스토어 이름 <span className='text-red-500'>*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder='예: 홍대 가챠샵' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='shop_type'
                rules={{ required: '스토어 타입은 필수입니다' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      스토어 타입 <span className='text-red-500'>*</span>
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='선택하세요' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='gacha'>가챠</SelectItem>
                        <SelectItem value='figure'>피규어</SelectItem>
                        <SelectItem value='both'>가챠 + 피규어</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='description'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>설명</FormLabel>
                    <FormControl>
                      <textarea
                        className='flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                        placeholder='스토어에 대한 설명을 입력하세요'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* 연락처 정보 */}
            <div className='space-y-4'>
              <h3 className='text-sm font-semibold text-gray-900'>연락처</h3>

              <FormField
                control={form.control}
                name='phone'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>전화번호</FormLabel>
                    <FormControl>
                      <Input
                        type='tel'
                        placeholder='예: 02-1234-5678'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='website_url'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>웹사이트 URL</FormLabel>
                    <FormControl>
                      <Input
                        type='url'
                        placeholder='https://example.com'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* 위치 정보 */}
            <div className='space-y-4'>
              <h3 className='text-sm font-semibold text-gray-900'>위치 정보</h3>

              <Button
                type='button'
                variant='default'
                onClick={() => setAddressSearchOpen(true)}
                className='w-full gap-2'
              >
                <Search className='w-4 h-4' />
                주소 검색
              </Button>

              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='sido'
                  rules={{ required: '시/도는 필수입니다' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        시/도 <span className='text-red-500'>*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder='서울특별시' {...field} readOnly />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='sigungu'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>시/군/구</FormLabel>
                      <FormControl>
                        <Input placeholder='강남구' {...field} readOnly />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name='road_address'
                rules={{ required: '도로명 주소는 필수입니다' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      도로명 주소 <span className='text-red-500'>*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='서울 강남구 테헤란로 123'
                        {...field}
                        readOnly
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='jibun_address'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>지번 주소</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='서울 강남구 역삼동 123-45'
                        {...field}
                        readOnly
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='building_name'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>건물명</FormLabel>
                      <FormControl>
                        <Input placeholder='테헤란빌딩' {...field} readOnly />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='zone_code'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>우편번호</FormLabel>
                      <FormControl>
                        <Input placeholder='06234' {...field} readOnly />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name='detail_address'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>상세 주소</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='101호, 2층 등 상세 주소를 입력하세요'
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className='text-xs'>
                      동/호수 등 추가 주소 정보를 입력하세요
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='latitude'
                  rules={{
                    required: '위도는 필수입니다',
                    pattern: {
                      value: /^-?([0-8]?[0-9]|90)(\.[0-9]+)?$/,
                      message: '올바른 위도 형식이 아닙니다 (-90 ~ 90)',
                    },
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        위도 <span className='text-red-500'>*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          step='any'
                          placeholder='37.5665'
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className='text-xs'>
                        -90 ~ 90 사이의 값
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='longitude'
                  rules={{
                    required: '경도는 필수입니다',
                    pattern: {
                      value: /^-?((1[0-7][0-9])|([0-9]?[0-9]))(\.[0-9]+)?$/,
                      message: '올바른 경도 형식이 아닙니다 (-180 ~ 180)',
                    },
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        경도 <span className='text-red-500'>*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          step='any'
                          placeholder='126.9780'
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className='text-xs'>
                        -180 ~ 180 사이의 값
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* 운영 정보 */}
            <div className='space-y-4'>
              <h3 className='text-sm font-semibold text-gray-900'>운영 정보</h3>

              <FormField
                control={form.control}
                name='is_24_hours'
                render={({ field }) => (
                  <FormItem className='flex flex-row items-start space-x-3 space-y-0'>
                    <FormControl>
                      <input
                        type='checkbox'
                        checked={field.value}
                        onChange={field.onChange}
                        className='h-4 w-4 rounded border-gray-300 text-primary focus:ring-2 focus:ring-primary'
                      />
                    </FormControl>
                    <div className='space-y-1 leading-none'>
                      <FormLabel>24시간 운영</FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='gacha_machine_count'
                rules={{
                  pattern: {
                    value: /^\d+$/,
                    message: '숫자만 입력 가능합니다',
                  },
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>가챠 머신 개수</FormLabel>
                    <FormControl>
                      <Input type='number' min='0' placeholder='0' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* 검증 정보 */}
            <div className='space-y-4'>
              <h3 className='text-sm font-semibold text-gray-900'>검증 정보</h3>

              <FormField
                control={form.control}
                name='verification_status'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>검증 상태</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='pending'>
                          검증 대기 (Pending)
                        </SelectItem>
                        <SelectItem value='verified'>
                          검증 완료 (Verified)
                        </SelectItem>
                        <SelectItem value='rejected'>
                          검증 거부 (Rejected)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription className='text-xs'>
                      관리자가 직접 등록하는 경우 "검증 완료"를 선택할 수
                      있습니다
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='data_source'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      데이터 출처 <span className='text-red-500'>*</span>
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='admin_input'>
                          관리자 직접 입력
                        </SelectItem>
                        <SelectItem value='user_submit'>사용자 제보</SelectItem>
                        <SelectItem value='crawling'>크롤링</SelectItem>
                        <SelectItem value='partner_api'>파트너 API</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* 이미지 URL */}
            <div className='space-y-4'>
              <h3 className='text-sm font-semibold text-gray-900'>이미지</h3>

              <FormField
                control={form.control}
                name='thumbnail_url'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>썸네일 URL</FormLabel>
                    <FormControl>
                      <Input
                        type='url'
                        placeholder='https://example.com/thumbnail.jpg'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='cover_image_url'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>커버 이미지 URL</FormLabel>
                    <FormControl>
                      <Input
                        type='url'
                        placeholder='https://example.com/cover.jpg'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* 관리자 메모 */}
            <div className='space-y-4'>
              <h3 className='text-sm font-semibold text-gray-900'>
                관리자 메모
              </h3>

              <FormField
                control={form.control}
                name='admin_notes'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>메모</FormLabel>
                    <FormControl>
                      <textarea
                        className='flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                        placeholder='내부용 메모 (사용자에게 노출되지 않음)'
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className='text-xs'>
                      관리자 전용 메모입니다. 사용자에게 노출되지 않습니다.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className='sticky bottom-0  pt-4 '>
              <Button
                type='button'
                variant='outline'
                onClick={() => {
                  setOpen(false);
                  form.reset();
                }}
                disabled={isSubmitting}
              >
                취소
              </Button>
              <Button type='submit' disabled={isSubmitting}>
                {isSubmitting ? '등록 중...' : '등록'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>

      <AddressSearchDialog
        open={addressSearchOpen}
        onOpenChange={setAddressSearchOpen}
        onComplete={(addressData: AddressData) => {
          form.setValue('sido', addressData.sido);
          form.setValue('sigungu', addressData.sigungu);
          form.setValue('road_address', addressData.roadAddress);
          form.setValue('jibun_address', addressData.jibunAddress);
          form.setValue('zone_code', addressData.zoneCode);
          form.setValue('building_name', addressData.buildingName);
          form.setValue('address_type', addressData.addressType);
        }}
      />
    </Dialog>
  );
}
