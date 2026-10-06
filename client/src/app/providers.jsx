import { QueryClientProvider } from '@tanstack/react-query';
import BrandColor from '@/app/BrandColor';
import queryClient from '@/lib/queryClient';

export default function Providers({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <BrandColor />
      {children}
    </QueryClientProvider>
  );
}
