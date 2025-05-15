
import { type ToastActionElement, type ToastProps } from "@/components/ui/toast";
import * as React from "react";

const TOAST_LIMIT = 20;
const TOAST_REMOVE_DELAY = 1000;

export type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  duration?: number; // Added duration property for auto-dismissal
};

export type ToastParameters = Pick<
  ToasterToast,
  "title" | "description" | "action" | "variant" | "duration" | "className"
>;

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const;

let count = 0;

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

type ActionType = typeof actionTypes;

type Action =
  | {
      type: ActionType["ADD_TOAST"];
      toast: ToasterToast;
    }
  | {
      type: ActionType["UPDATE_TOAST"];
      toast: Partial<ToasterToast>;
      id: string;
    }
  | {
      type: ActionType["DISMISS_TOAST"];
      toastId: string;
    }
  | {
      type: ActionType["REMOVE_TOAST"];
      toastId: string;
    };

interface State {
  toasts: ToasterToast[];
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return;
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId);
    dispatch({
      type: actionTypes.REMOVE_TOAST,
      toastId,
    });
  }, TOAST_REMOVE_DELAY);

  toastTimeouts.set(toastId, timeout);
};

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case actionTypes.ADD_TOAST:
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      };

    case actionTypes.UPDATE_TOAST:
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.id ? { ...t, ...action.toast } : t
        ),
      };

    case actionTypes.DISMISS_TOAST: {
      const { toastId } = action;

      // ! Side effects ! - This could be extracted into a dismissToast() action
      if (toastId) {
        addToRemoveQueue(toastId);
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === "all"
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      };
    }

    case actionTypes.REMOVE_TOAST:
      if (action.toastId === "all") {
        return {
          ...state,
          toasts: [],
        };
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      };
    default:
      return state;
  }
};

const listeners: Array<(state: State) => void> = [];

let memoryState: State = { toasts: [] };

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => {
    listener(memoryState);
  });
}

type Toast = Omit<ToasterToast, "id"> & { id?: string };

function toast({ ...props }: ToastParameters) {
  const id = genId();

  const dismiss = () => dispatch({ type: actionTypes.DISMISS_TOAST, toastId: id });

  // Handle toast duration for auto-dismissal
  const { duration, ...restProps } = props;
  
  dispatch({
    type: actionTypes.ADD_TOAST,
    toast: {
      ...restProps,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss();
      },
    },
  });

  // If duration is provided, automatically dismiss the toast after the specified time
  if (duration !== undefined && duration > 0) {
    setTimeout(() => {
      dismiss();
    }, duration);
  }

  return {
    id,
    dismiss,
    update: (props: ToasterToast) =>
      dispatch({
        type: actionTypes.UPDATE_TOAST,
        id,
        toast: props,
      }),
  };
}

// Create variants for different types of toasts
toast.info = (props: Omit<ToastParameters, "variant">) => 
  toast({ ...props, variant: "default" });

toast.error = (props: Omit<ToastParameters, "variant">) => 
  toast({ ...props, variant: "destructive" });

toast.warning = (props: Omit<ToastParameters, "variant">) => 
  toast({ ...props, variant: "default", className: "bg-amber-500 text-white border-amber-600" });

toast.success = (props: Omit<ToastParameters, "variant">) => 
  toast({ ...props, variant: "default", className: "bg-green-500 text-white border-green-600" });

function useToast() {
  const [state, setState] = React.useState<State>(memoryState);

  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, [state]);

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) =>
      dispatch({ type: actionTypes.DISMISS_TOAST, toastId: toastId || "all" }),
  };
}

export { useToast, toast };
