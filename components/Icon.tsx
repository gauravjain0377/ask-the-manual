import React from 'react';
import {
  LuLoader2,
  LuRefreshCcw,
  LuSend,
  LuTrash2,
  LuTruck,
  LuUploadCloud,
  LuWaves
} from 'react-icons/lu';

type IconName = 'truck' | 'washing' | 'upload' | 'trash' | 'send' | 'refresh' | 'loader';

interface IconProps {
  name: IconName;
  className?: string;
  size?: number;
}

const Icon: React.FC<IconProps> = ({ name, className = '', size = 18 }) => {
  const map: Record<IconName, React.ComponentType<{ className?: string; size?: number }> > = {
    truck: LuTruck,
    washing: LuWaves,
    upload: LuUploadCloud,
    trash: LuTrash2,
    send: LuSend,
    refresh: LuRefreshCcw,
    loader: LuLoader2
  };

  const Comp = map[name];
  if (!Comp) return null;

  return <Comp className={className} size={size} />;
};

export default Icon;
