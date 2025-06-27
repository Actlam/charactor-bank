import { useMutation as useConvexMutation } from 'convex/react';
import { FunctionReference, FunctionReturnType } from 'convex/server';
import { useErrorHandler } from '@/hooks/use-error-handler';
import { ConvexErrorHandler } from '@/lib/errors/api-handler';
import { toast } from 'sonner';

/**
 * エラーハンドリング付きのuseMutationラッパー
 */
export function useMutation<Mutation extends FunctionReference<'mutation'>>(
  mutation: Mutation,
  options?: {
    onSuccess?: (result: FunctionReturnType<Mutation>) => void;
    onError?: (error: Error) => void;
    showToast?: boolean;
    successMessage?: string;
  }
) {
  const { handleError } = useErrorHandler();
  const baseMutation = useConvexMutation(mutation);

  return async (...args: Parameters<typeof baseMutation>) => {
    try {
      const result = await baseMutation(...args);
      
      if (options?.showToast !== false && options?.successMessage) {
        toast.success(options.successMessage);
      }
      
      options?.onSuccess?.(result);
      return result;
    } catch (error) {
      const transformedError = ConvexErrorHandler.transformError(error);
      
      handleError(transformedError);
      options?.onError?.(transformedError);
      
      // エラーを再スローして、呼び出し元でもキャッチできるようにする
      throw transformedError;
    }
  };
}