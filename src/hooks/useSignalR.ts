import { useEffect } from 'react';
import { signalRService } from '../services/signalrService';
import { useTableStore } from '../stores/tableStore';

export const useSignalR = () => {
  const updateTableStatus = useTableStore(state => state.updateTableStatus);

  useEffect(() => {
    signalRService.connect();

    const handleTableStatusChanged = (tableId: number, newStatus: string) => {
      updateTableStatus(tableId, newStatus);
    };

    signalRService.on('TableStatusChanged', handleTableStatusChanged);

    return () => {
      signalRService.off('TableStatusChanged', handleTableStatusChanged);
      // We might not want to disconnect entirely if other components use it, but for single page apps simple unmount cleanups are ok.
      // signalRService.disconnect();
    };
  }, [updateTableStatus]);
};
