// Minimal cn helper compatible with shadcn/ui imports
export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}



