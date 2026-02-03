/**
 * @corpusai/ui - Shared UI Component Library
 * Based on shadcn/ui with Radix UI primitives
 */

// Core utilities
export { cn } from './lib/utils';

// Components
export { Button, buttonVariants, type ButtonProps } from './components/button';
export { Input, type InputProps } from './components/input';
export { Label } from './components/label';

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from './components/dialog';

export {
  Toast,
  ToastAction,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  type ToastActionElement,
  type ToastProps,
} from './components/toast';

// Card components
export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from './components/card';

// Badge
export { Badge, badgeVariants } from './components/badge';

// Form components
export { Textarea, type TextareaProps } from './components/textarea';
export { Checkbox } from './components/checkbox';
export { RadioGroup, RadioGroupItem } from './components/radio-group';
export { Switch } from './components/switch';
export { Slider } from './components/slider';
export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
} from './components/select';

// Feedback components
export { Alert, AlertTitle, AlertDescription } from './components/alert';
export { Progress } from './components/progress';
export { Skeleton } from './components/skeleton';
export { Spinner } from './components/spinner';

// Layout components
export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
} from './components/sheet';

export {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from './components/collapsible';

// Data display
export { Avatar, AvatarImage, AvatarFallback } from './components/avatar';
export {
  DataTable,
  type Column,
  type DataTableProps,
} from './components/data-table';
export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from './components/pagination';
