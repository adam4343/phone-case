import Steps from "@/components/custom/steps";
import Container from "@/components/shared/container";
import type { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <Container className='flex-1 flex flex-col'>
        <Steps />
      {children}
    </Container>
  )
}
