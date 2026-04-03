import { redirect, notFound } from 'next/navigation'
import { getContactSettings } from '@/lib/api/contact'

export default async function ResumePage() {
  const contact = await getContactSettings()
  const resumeUrl = contact?.resume_url

  if (!resumeUrl) {
    notFound()
  }

  redirect(resumeUrl)
}
