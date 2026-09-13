import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface Customer {
  id: string;
  name: string;
  phone: string;
  currentBalance: number;
  lastTransactionAt: string | null;
}

export interface CreateCustomerInput {
  name: string;
  phone: string;
}

// 🛠️ Strict TypeScript interface for your NestJS API paginated response
export interface PaginatedCustomerResponse {
  data: Customer[];
  meta?: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}

const API_URL = "http://localhost:5000";

export function useCustomers(search: string = "") {
  const queryClient = useQueryClient();

  const customersQuery = useQuery<PaginatedCustomerResponse | Customer[], Error>({
    queryKey: ["customers", search],
    queryFn: async (): Promise<PaginatedCustomerResponse | Customer[]> => {
      const response = await fetch(`${API_URL}/customers?search=${encodeURIComponent(search)}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch customers");
      return response.json();
    },
  });

  const createCustomerMutation = useMutation<Customer, Error, CreateCustomerInput>({
    mutationFn: async (newCustomer: CreateCustomerInput): Promise<Customer> => {
      const response = await fetch(`${API_URL}/customers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(newCustomer),
      });
      if (!response.ok) throw new Error("Failed to create customer");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });

  // 🛠️ Fully typed extraction logic without using the forbidden 'any' keyword
  const rawData = customersQuery.data;
  let extractedCustomers: Customer[] = [];

  if (Array.isArray(rawData)) {
    extractedCustomers = rawData;
  } else if (rawData && typeof rawData === "object" && Array.isArray(rawData.data)) {
    extractedCustomers = rawData.data;
  }

  return {
    customers: extractedCustomers,
    isLoading: customersQuery.isLoading,
    isError: customersQuery.isError,
    createCustomer: createCustomerMutation.mutateAsync,
  };
}
