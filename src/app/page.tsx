import { redirect } from 'next/navigation'
import { getAuthUser } from '@/lib/jwt'
import LibraryClient from '@/components/LibraryClient'

export default async function HomePage() {
  const user = await getAuthUser()
  if (!user) {
    redirect('/landing')
  }
  return <LibraryClient />
}
