import { useCallback, useState } from "react";

/**
 * Thrown when the connected session does not support the Hedera namespace
 * (e.g. wallet is EVM-only or no native signer was provided).
 * The app can catch this and surface it via HederaCapabilityBadge or similar UI.
 */
export class CapabilityError extends Error {
  override readonly name = "CapabilityError";

  constructor(
    message: string = "Native Hedera transactions are not available. Connect a wallet that supports the Hedera namespace (e.g. HashPack, Blade) or ensure the app has set a native transaction signer.",
  ) {
    super(message);
    Object.setPrototypeOf(this, CapabilityError.prototype);
  }
}

/**
 * A Hedera SDK transaction (e.g. TransferTransaction, TokenAssociateTransaction).
 * Typed as unknown so the hooks package does not depend on @hashgraph/sdk;
 * the host app passes SDK transaction instances.
 */
export type NativeTransaction = unknown;

/**
 * Minimal shape of the result of executing a native Hedera transaction.
 * The Hedera SDK's TransactionResponse includes more (getReceipt, getRecord, etc.);
 * the host app can cast to the full type if needed.
 */
export type NativeTransactionResponse = {
  /** Hedera transaction ID (e.g. "0.0.12345@1234567890.123456789"). */
  transactionId: string;
  [key: string]: unknown;
};

/**
 * Signer that executes a native Hedera transaction (HTS, HCS, CryptoTransfer, etc.)
 * via the Hedera namespace. The host app injects this (e.g. from Reown AppKit's
 * Hedera adapter, or from HashPack/Blade via window.hedera).
 */
export type NativeTransactionSigner = (tx: NativeTransaction) => Promise<NativeTransactionResponse>;

let nativeSigner: NativeTransactionSigner | undefined;

/**
 * Set the signer used by useNativeTransaction to submit native Hedera transactions.
 * When not set, sendTransaction throws CapabilityError.
 */
export function setNativeTransactionSigner(signer: NativeTransactionSigner | undefined): void {
  nativeSigner = signer;
}

/**
 * Get the currently set native transaction signer, if any.
 */
export function getNativeTransactionSigner(): NativeTransactionSigner | undefined {
  return nativeSigner;
}

export type UseNativeTransactionResult = {
  /** Submit a native Hedera transaction. Throws CapabilityError if no signer is set. */
  sendTransaction: (tx: NativeTransaction) => Promise<NativeTransactionResponse | undefined>;
  /** True while a transaction is being signed and submitted. */
  isSending: boolean;
  /** Last error from sendTransaction (e.g. user rejection, network failure). */
  error: Error | null;
  /** Clear the last error. */
  clearError: () => void;
};

/**
 * Hook to send native Hedera transactions (HTS, HCS, CryptoTransfer, etc.) through
 * the Hedera namespace. The EVM equivalent is useScaffoldWriteContract.
 *
 * The host app must call setNativeTransactionSigner(signer) with a function that
 * executes the transaction (e.g. using Reown AppKit's Hedera adapter or HashPack/Blade).
 * If no signer is set, sendTransaction throws CapabilityError so the UI can prompt
 * the user to connect a Hedera-capable wallet.
 *
 * @example
 * // In app setup (e.g. after wallet connect with hedera namespace):
 * setNativeTransactionSigner(async (tx) => {
 *   const response = await hederaClient.execute(tx); // or wallet.signAndExecute(tx)
 *   return { transactionId: response.transactionId.toString() };
 * });
 *
 * // In component:
 * const { sendTransaction, isSending, error } = useNativeTransaction();
 * await sendTransaction(
 *   new TransferTransaction()
 *     .addHbarTransfer(senderId, new Hbar(-10))
 *     .addHbarTransfer(receiverId, new Hbar(10))
 * );
 */
export function useNativeTransaction(): UseNativeTransactionResult {
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const sendTransaction = useCallback(async (tx: NativeTransaction): Promise<NativeTransactionResponse | undefined> => {
    const signer = getNativeTransactionSigner();
    if (!signer) {
      const err = new CapabilityError();
      setError(err);
      throw err;
    }

    setIsSending(true);
    setError(null);

    try {
      const response = await signer(tx);
      return response;
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e));
      setError(err);
      throw e;
    } finally {
      setIsSending(false);
    }
  }, []);

  return { sendTransaction, isSending, error, clearError };
}
