import type { ButtonHTMLAttributes } from "preact";
import type { PropsWithChildren } from "preact/compat";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

export function Button({
  children,
  className,
  ...rest
}: PropsWithChildren<ButtonProps>) {
  return (
    <button
      {...rest}
      className={`${className || ""} border px-1 hover:brightness-200 rounded-md border-current`}
    >
      {children}
    </button>
  );
}
