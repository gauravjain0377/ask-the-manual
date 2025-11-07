import React from 'react';
import { FiTruck, FiUploadCloud, FiTrash, FiSend, FiRefreshCw } from 'react-icons/fi';
import { GiWashingMachine } from 'react-icons/gi';

type IconName = 'truck' | 'washing' | 'upload' | 'trash' | 'send' | 'refresh';

interface IconProps {
  name: IconName;
  className?: string;
  size?: number;
}

const Icon: React.FC<IconProps> = ({ name, className = '', size = 18 }) => {
  const map: Record<IconName, any> = {
    truck: FiTruck,
    washing: GiWashingMachine,
    upload: FiUploadCloud,
    trash: FiTrash,
    send: FiSend,
    refresh: FiRefreshCw,
  };

  const Comp = map[name] as any;
  if (!Comp) return null;
  return <Comp className={className} size={size} />;
};

export default Icon;
