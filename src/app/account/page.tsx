import { redirect } from 'next/navigation'
import { getAuthUser } from '@/lib/jwt'
import AccountClient from '@/components/AccountClient'

export default async function AccountPage() {
  const user = await getAuthUser()
  if (!user) {
    redirect('/landing')
  }
  return <AccountClient />
}
