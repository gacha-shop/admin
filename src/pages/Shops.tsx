import { StoreRegistrationModal } from '@/features/store/components/StoreRegistrationModal';
import { StoreListTable } from '@/features/store/components/StoreListTable';

export default function Shops() {
  return (
    <div>
      <div className='flex items-center justify-between mb-6'>
        <h1 className='text-2xl font-bold text-gray-800'>샵 관리</h1>
        <StoreRegistrationModal />
      </div>
      <div className='bg-white rounded-lg shadow p-6'>
        <StoreListTable />
      </div>
    </div>
  );
}
