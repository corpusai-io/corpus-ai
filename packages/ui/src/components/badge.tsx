import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-1 focus:ring-[#171717]/20',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-[#171717] text-white hover:bg-[#171717]/80',
        secondary:
          'border-transparent bg-[#F7F7F7] text-[#171717] hover:bg-[#E8E8E8]',
        destructive:
          'border-transparent bg-red-600 text-white hover:bg-red-700',
        outline: 'text-[#171717] border-[#E8E8E8]',
        success:
          'border-transparent bg-green-600 text-white hover:bg-green-700',
        warning:
          'border-transparent bg-yellow-500 text-[#171717] hover:bg-yellow-600',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
