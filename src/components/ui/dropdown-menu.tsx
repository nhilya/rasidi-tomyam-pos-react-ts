import React from 'react';
import { cn } from '@/lib/utils';

interface DropdownContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const DropdownContext = React.createContext<DropdownContextType | undefined>(undefined);

function useDropdown() {
  const context = React.useContext(DropdownContext);
  if (!context) {
    throw new Error('useDropdown must be used within DropdownMenu');
  }
  return context;
}

interface DropdownMenuProps {
  children: React.ReactNode;
}

function DropdownMenu({ children }: DropdownMenuProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <DropdownContext.Provider value={{ isOpen, setIsOpen }}>
      <div className="relative inline-block">
        {children}
      </div>
    </DropdownContext.Provider>
  );
}

const DropdownMenuTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    render?: React.ReactNode;
  }
>(({ className, render, children, ...props }, ref) => {
  const { isOpen, setIsOpen } = useDropdown();
  return (
    <button
      ref={ref}
      onClick={() => setIsOpen(!isOpen)}
      className={cn('', className)}
      {...props}
    >
      {render || children}
    </button>
  );
});
DropdownMenuTrigger.displayName = 'DropdownMenuTrigger';

const DropdownMenuContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    align?: 'start' | 'center' | 'end';
  }
>(({ className, align = 'start', ...props }, ref) => {
  const { isOpen, setIsOpen } = useDropdown();

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40"
        onClick={() => setIsOpen(false)}
      />
      <div
        ref={ref}
        className={cn(
          'absolute top-full z-50 min-w-[200px] mt-1 rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md',
          align === 'end' && 'right-0',
          align === 'center' && 'left-1/2 -translate-x-1/2',
          align === 'start' && 'left-0',
          className
        )}
        {...props}
      />
    </>
  );
});
DropdownMenuContent.displayName = 'DropdownMenuContent';

const DropdownMenuItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, onClick, ...props }, ref) => {
  const { setIsOpen } = useDropdown();
  return (
    <div
      ref={ref}
      className={cn(
        'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground hover:bg-accent hover:text-accent-foreground',
        className
      )}
      onClick={(e) => {
        onClick?.(e);
        setIsOpen(false);
      }}
      {...props}
    />
  );
});
DropdownMenuItem.displayName = 'DropdownMenuItem';

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
};
