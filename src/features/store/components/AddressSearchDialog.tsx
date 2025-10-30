import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import DaumPostcodeEmbed from 'react-daum-postcode';
import type { Address } from 'react-daum-postcode';

export interface AddressData {
  sido: string;
  sigungu: string;
  jibunAddress: string;
  roadAddress: string;
  zoneCode: string;
  buildingName: string;
  addressType: 'R' | 'J';
}

interface AddressSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (addressData: AddressData) => void;
}

export function AddressSearchDialog({
  open,
  onOpenChange,
  onComplete,
}: AddressSearchDialogProps) {
  const handleComplete = (data: Address) => {
    console.log('Daum Postcode data:', data);

    // Extract sido (시/도)
    const sido = data.sido || '';

    // Extract sigungu (시/군/구)
    const sigungu = data.sigungu || '';

    // Jibun address (지번 주소)
    const jibunAddress = data.jibunAddress || data.autoJibunAddress || '';

    // Road address (도로명 주소)
    const roadAddress = data.roadAddress || data.autoRoadAddress || data.address;

    // Zone code (우편번호)
    const zoneCode = data.zonecode || '';

    // Building name
    const buildingName = data.buildingName || '';

    // Address type: R (도로명), J (지번)
    const addressType = data.addressType === 'R' ? 'R' : 'J';

    const addressData: AddressData = {
      sido,
      sigungu,
      jibunAddress,
      roadAddress,
      zoneCode,
      buildingName,
      addressType,
    };

    console.log('Processed address data:', addressData);

    onComplete(addressData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-[600px]'>
        <DialogHeader>
          <DialogTitle>주소 검색</DialogTitle>
        </DialogHeader>
        <div className='mt-4'>
          <DaumPostcodeEmbed onComplete={handleComplete} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
