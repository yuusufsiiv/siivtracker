import Image from "next/image"
import { cn } from "@/lib/utils"

export function Logo({
  size = 64,
  className,
}: {
  size?: number
  className?: string
}) {
  return (
    <Image
      src="/logo.png"
      alt="Siiv Track logo"
      width={size}
      height={size}
      priority
      className={cn("object-contain", className)}
    />
  )
}
