
// Re-export the toast hooks from shadcn/ui
import { useToast as useShadcnToast } from "@/components/ui/toast";

export const useToast = useShadcnToast;

// Re-export the toast function for direct use
import { toast as shadcnToast } from "@/components/ui/toast";

export const toast = shadcnToast;
