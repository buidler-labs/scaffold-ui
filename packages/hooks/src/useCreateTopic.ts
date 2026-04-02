import { TopicCreateTransaction } from "@hiero-ledger/sdk";
import { useMutation } from "@tanstack/react-query";
import { useNativeTransaction } from "./useNativeTransaction";

export type CreateTopicParams = { memo?: string };

export type UseCreateTopicOptions = {
  /** Run at the start of each mutation; throw if the wallet/session is not ready. */
  ensureReady?: () => void;
};

export function useCreateTopic(options?: UseCreateTopicOptions) {
  const { sendTransaction } = useNativeTransaction();
  const ensureReady = options?.ensureReady;

  return useMutation({
    mutationFn: async (params: CreateTopicParams = {}) => {
      ensureReady?.();

      const tx = new TopicCreateTransaction();
      const normalizedMemo = params.memo?.trim();
      if (normalizedMemo) tx.setTopicMemo(normalizedMemo);

      const result = await sendTransaction(tx);
      if (!result?.transactionId) throw new Error("No transactionId returned from wallet");
      return { transactionId: result.transactionId };
    },
  });
}
