'use client';
import React from 'react';
import { SWRConfig } from 'swr';
import { ActiveThemeProvider } from '../active-theme';

// SWR 全局配置
const swrConfig = {
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  shouldRetryOnError: false,
  errorRetryCount: 2,
  dedupingInterval: 2000
};

export default function Providers({
  activeThemeValue,
  children
}: {
  activeThemeValue: string;
  children: React.ReactNode;
}) {
  return (
    <ActiveThemeProvider initialTheme={activeThemeValue}>
      <SWRConfig value={swrConfig}>{children}</SWRConfig>
    </ActiveThemeProvider>
  );
}
