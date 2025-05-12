
import React from 'react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ToneType } from './types/offerTypes';

interface ToneSelectorProps {
  value: ToneType;
  onChange: (value: ToneType) => void;
}

const ToneSelector: React.FC<ToneSelectorProps> = ({ value, onChange }) => {
  return (
    <div className="mb-2">
      <div className="text-xs mb-1 font-medium">Message Tone:</div>
      <RadioGroup className="flex space-x-2" value={value} onValueChange={(value) => onChange(value as ToneType)}>
        <div className="flex items-center space-x-1">
          <RadioGroupItem value="friendly" id="friendly" className="h-3 w-3" />
          <Label htmlFor="friendly" className="text-xs">Friendly</Label>
        </div>
        <div className="flex items-center space-x-1">
          <RadioGroupItem value="firm" id="firm" className="h-3 w-3" />
          <Label htmlFor="firm" className="text-xs">Firm</Label>
        </div>
        <div className="flex items-center space-x-1">
          <RadioGroupItem value="curious" id="curious" className="h-3 w-3" />
          <Label htmlFor="curious" className="text-xs">Curious</Label>
        </div>
      </RadioGroup>
    </div>
  );
};

export default ToneSelector;
