import { createFileRoute } from '@tanstack/react-router'
import { AddiMockPage } from '@/pages/addi-mock/addi-mock-page'

export const Route = createFileRoute('/addi-mock')({
  component: AddiMockPage,
});

export default AddiMockPage;