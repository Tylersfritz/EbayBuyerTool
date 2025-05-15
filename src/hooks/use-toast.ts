
import * as React from "react"

type ToastProps = {
  title?: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
  variant?: "default" | "destructive"
  id?: string
}

type ToasterToast = ToastProps & {
  id: string
  open: boolean
}

const TOAST_LIMIT = 20
const TOAST_REMOVE_DELAY = 1000

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

type ActionType = typeof actionTypes

type Action =
  | {
      type: ActionType["ADD_TOAST"]
      toast: ToasterToast
    }
  | {
      type: ActionType["UPDATE_TOAST"]
      toast: Partial<ToasterToast>
    }
  | {
      type: ActionType["DISMISS_TOAST"]
      toastId?: string
    }
  | {
      type: ActionType["REMOVE_TOAST"]
      toastId?: string
    }

interface State {
  toasts: ToasterToast[]
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }

    case "DISMISS_TOAST": {
      const { toastId } = action

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      }
    }

    case "REMOVE_TOAST": {
      const { toastId } = action

      if (toastId) {
        return {
          ...state,
          toasts: state.toasts.filter((t) => t.id !== toastId),
        }
      }

      return {
        ...state,
        toasts: [],
      }
    }
  }
}

export function useToast() {
  const [state, dispatch] = React.useReducer(reducer, {
    toasts: [],
  })

  React.useEffect(() => {
    state.toasts.forEach((toast) => {
      if (toast.open) {
        return
      }

      if (toastTimeouts.has(toast.id)) {
        return
      }

      const timeout = setTimeout(() => {
        dispatch({
          type: "REMOVE_TOAST",
          toastId: toast.id,
        })
        toastTimeouts.delete(toast.id)
      }, TOAST_REMOVE_DELAY)

      toastTimeouts.set(toast.id, timeout)
    })
  }, [state.toasts])

  const toast = React.useCallback(
    ({ ...props }: ToastProps) => {
      const id = props.id || genId()
      const update = (props: ToastProps) =>
        dispatch({
          type: "UPDATE_TOAST",
          toast: { ...props, id },
        })
      const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id })

      dispatch({
        type: "ADD_TOAST",
        toast: {
          ...props,
          id,
          open: true,
        },
      })

      return {
        id,
        dismiss,
        update,
      }
    },
    [dispatch]
  )

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
  }
}

export type { ToastProps, ToasterToast }

// Define a standalone toast function for direct use
export const toast = {
  // Default toast function
  default: (props: ToastProps) => {
    const { toast } = useToast()
    return toast({ ...props, variant: "default" })
  },
  
  // Method for success toasts
  success: (props: string | ToastProps) => {
    const { toast } = useToast()
    if (typeof props === 'string') {
      return toast({ title: props, variant: "default" })
    }
    return toast({ ...props, variant: "default" })
  },
  
  // Method for error toasts
  error: (props: string | ToastProps) => {
    const { toast } = useToast()
    if (typeof props === 'string') {
      return toast({ title: props, variant: "destructive" })
    }
    return toast({ ...props, variant: "destructive" })
  },
  
  // Method for warning toasts
  warning: (props: string | ToastProps) => {
    const { toast } = useToast()
    if (typeof props === 'string') {
      return toast({ title: props })
    }
    return toast(props)
  },
  
  // Method for info toasts
  info: (props: string | ToastProps) => {
    const { toast } = useToast()
    if (typeof props === 'string') {
      return toast({ title: props })
    }
    return toast(props)
  }
}
