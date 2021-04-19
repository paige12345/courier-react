import { ICourierContext, useCourier } from "@trycourier/react-provider";
import { useCallback, useEffect } from "react";
import { ICourierToastMessage } from "~/components/Toast/types";
import { IToastConfig } from "../types";
import { UseToast, ToastCaller } from "./types";

export const useToast: UseToast = () => {
  const { toast, clientKey } = useCourier<{
    toast: {
      toast: ToastCaller;
      config?: IToastConfig;
    };
  }>();
  const toastCaller = useCallback(
    (message: ICourierToastMessage) => {
      toast?.toast(message);
    },
    [toast]
  );
  return [
    toastCaller,
    {
      config: toast?.config ?? {},
      clientKey,
    },
  ];
};

export const useListenForTransportEvent = (
  clientKey: string,
  transport: ICourierContext["transport"],
  handleToast
) => {
  const { createTrackEvent } = useCourier();

  useEffect(() => {
    if (!transport) {
      return;
    }

    transport.listen({
      id: "toast-listener",
      listener: (courierEvent) => {
        const courierData = courierEvent?.data?.data;

        if (clientKey && courierData?.deliverTrackingId) {
          createTrackEvent({
            trackingId: courierData?.deliverTrackingId,
          });
        }

        handleToast(courierEvent?.data);
      },
    });
  }, [createTrackEvent, clientKey, handleToast, transport]);
};
