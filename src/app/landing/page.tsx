import { redirect } from 'next/navigation'
import { getAuthUser } from '@/lib/jwt'
import LandingClient from '@/components/LandingClient'

export default async function LandingPage() {
  const user = await getAuthUser()
  if (user) {
    redirect('/')
  }
  return <LandingClient />
}
