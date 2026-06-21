import { useQuery } from '@tanstack/react-query';
import { userService } from '../services/services';

export const useDashboard = () => {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const { data } = await userService.getDashboard();
      return data.dashboard;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};
