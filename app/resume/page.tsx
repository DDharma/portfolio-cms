import { redirect } from 'next/navigation'
import { getContactSettings } from '@/lib/api/contact'

export const dynamic = 'force-dynamic'

export default async function ResumePage() {
  const contact = await getContactSettings()

  if (contact?.resume_url) {
    redirect(contact.resume_url)
  }

  redirect('/')
}
