import React from 'react';
import { useTheme } from '@/components/theme-provider';
import CleanIcon from '@/images/clear-icon.png';
import CleanIconLight from '@/images/clear-icon-white.png';

const IconComponent: React.FC = () => {
  const { theme } = useTheme();

  return (
    <>
      {theme === 'dark' ? <CleanIconLight /> : <CleanIcon />}
    </>
  );
};

export default IconComponent;