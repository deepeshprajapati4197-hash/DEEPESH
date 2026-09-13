import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface Transaction {
  id: string;
  customerId: string;
  amount: number;
  type: "YOU_GAVE" | "YOU_GOT";
  description: string;
  balanceSnapshot: number;
  createdAt: string;
}

const API_URL = "http://localhost:5000";

export function useTransactions(customerId: string) {
  const queryClient = useQueryClient();

  const transactionsQuery = useQuery<Transaction[]>({
    queryKey: ["transactions", customerId],
    queryFn: async () => {
      if (!customerId) return [];
      const response = await fetch(`${API_URL}/transactions/customer/${customerId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch transactions");
      return response.json();
    },
    enabled: !!customerId,
  });

  const createTransactionMutation = useMutation({
    mutationFn: async (newTx: { customerId: string; amount: number; type: "YOU_GAVE" | "YOU_GOT"; description: string }) => {
      const response = await fetch(`${API_URL}/transactions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(newTx),
      });
      if (!response.ok) throw new Error("Failed to process transaction");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions", customerId] });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });

  return {
    transactions: transactionsQuery.data || [],
    createTransaction: createTransactionMutation.mutateAsync,
  };
}
