'use client'

import { useState, useEffect } from 'react'
import { useFieldArray, useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { contactSettingsSchema, type ContactSettings } from '@/lib/validations/contact.schema'
import { useContactSettings, useUpdateContactSettings } from '@/hooks/use-admin-api'
import { Button } from '@/components/ui/button'
import { FormField } from '@/components/admin/forms/form-field'
import { Plus, X } from 'lucide-react'

export default function SettingsPage() {
  const { data: contactData, isLoading } = useContactSettings()
  const updateMutation = useUpdateContactSettings()
  const [successMessage, setSuccessMessage] = useState('')

  const form = useForm<ContactSettings>({
    resolver: zodResolver(contactSettingsSchema),
    defaultValues: {
      site_name: '',
      site_title: '',
      site_description: '',
      site_logo: '',
      email: '',
      location: '',
      availability: '',
      resume_url: '',
      socials: [],
      callouts: [],
    },
  })

  // Update form when data loads
  useEffect(() => {
    if (contactData) {
      form.reset(contactData)
    }
  }, [contactData, form])

  const socialsField = useFieldArray({
    control: form.control,
    name: 'socials',
  })

  const calloutsField = useFieldArray({
    control: form.control,
    name: 'callouts' as any,
  })

  const onSubmit = async (data: ContactSettings) => {
    try {
      setSuccessMessage('')
      await updateMutation.mutateAsync(data)
      setSuccessMessage('Contact settings saved successfully!')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      console.error('Error saving contact settings:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-zinc-400 mt-1">Manage your site branding and contact information</p>
      </div>

      {successMessage && (
        <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-4">
          <p className="text-sm text-green-400">{successMessage}</p>
        </div>
      )}

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Site Branding Card */}
        <div className="rounded-lg border border-white/[0.06] bg-zinc-950 p-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-white">Site Branding</h3>
            <p className="text-sm text-zinc-400 mt-1">
              Your name, title, and logo shown across the site and in SEO metadata
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Site Name"
              required
              error={form.formState.errors.site_name?.message}
            >
              <input
                type="text"
                {...form.register('site_name')}
                className="w-full rounded-lg border border-white/[0.1] bg-white/[0.05] px-4 py-2.5 text-white placeholder-zinc-500 focus:border-white/[0.2] focus:outline-none"
                placeholder="Jane Doe"
                disabled={updateMutation.isPending}
              />
            </FormField>

            <FormField
              label="Site Title"
              required
              error={form.formState.errors.site_title?.message}
            >
              <input
                type="text"
                {...form.register('site_title')}
                className="w-full rounded-lg border border-white/[0.1] bg-white/[0.05] px-4 py-2.5 text-white placeholder-zinc-500 focus:border-white/[0.2] focus:outline-none"
                placeholder="Full-Stack Developer"
                disabled={updateMutation.isPending}
              />
            </FormField>
          </div>

          <FormField
            label="Site Description"
            required
            error={form.formState.errors.site_description?.message}
          >
            <textarea
              {...form.register('site_description')}
              className="w-full rounded-lg border border-white/[0.1] bg-white/[0.05] px-4 py-2.5 text-white placeholder-zinc-500 focus:border-white/[0.2] focus:outline-none"
              placeholder="SEO meta description for your portfolio"
              rows={2}
              disabled={updateMutation.isPending}
            />
          </FormField>

          <FormField
            label="Site Logo"
            required
            error={form.formState.errors.site_logo?.message}
          >
            <input
              type="text"
              {...form.register('site_logo')}
              className="w-full rounded-lg border border-white/[0.1] bg-white/[0.05] px-4 py-2.5 text-white placeholder-zinc-500 focus:border-white/[0.2] focus:outline-none"
              placeholder="J"
              maxLength={10}
              disabled={updateMutation.isPending}
            />
            <p className="text-xs text-zinc-500 mt-1">
              Initials or short text shown in the header navigation
            </p>
          </FormField>
        </div>

        {/* Contact Information Card */}
        <div className="rounded-lg border border-white/[0.06] bg-zinc-950 p-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-white">Contact Information</h3>
            <p className="text-sm text-zinc-400 mt-1">
              Your contact details that appear on the contact section
            </p>
          </div>

          {/* Email */}
          <FormField
            label="Email"
            required
            error={form.formState.errors.email?.message}
          >
            <input
              type="email"
              {...form.register('email')}
              className="w-full rounded-lg border border-white/[0.1] bg-white/[0.05] px-4 py-2.5 text-white placeholder-zinc-500 focus:border-white/[0.2] focus:outline-none"
              placeholder="your@email.com"
              disabled={updateMutation.isPending}
            />
          </FormField>

          {/* Location */}
          <FormField
            label="Location"
            required
            error={form.formState.errors.location?.message}
          >
            <input
              type="text"
              {...form.register('location')}
              className="w-full rounded-lg border border-white/[0.1] bg-white/[0.05] px-4 py-2.5 text-white placeholder-zinc-500 focus:border-white/[0.2] focus:outline-none"
              placeholder="City, Country"
              disabled={updateMutation.isPending}
            />
          </FormField>

          {/* Availability */}
          <FormField
            label="Availability"
            required
            error={form.formState.errors.availability?.message}
          >
            <textarea
              {...form.register('availability')}
              className="w-full rounded-lg border border-white/[0.1] bg-white/[0.05] px-4 py-2.5 text-white placeholder-zinc-500 focus:border-white/[0.2] focus:outline-none"
              placeholder="What roles/projects are you open to?"
              rows={3}
              disabled={updateMutation.isPending}
            />
          </FormField>

          {/* Resume URL */}
          <FormField
            label="Resume URL"
            error={form.formState.errors.resume_url?.message}
          >
            <input
              type="url"
              {...form.register('resume_url')}
              className="w-full rounded-lg border border-white/[0.1] bg-white/[0.05] px-4 py-2.5 text-white placeholder-zinc-500 focus:border-white/[0.2] focus:outline-none"
              placeholder="https://drive.google.com/file/d/..."
              disabled={updateMutation.isPending}
            />
            <p className="text-xs text-zinc-500 mt-1">
              Leave empty to hide the resume button from the site. Visitors can also access your resume at <code className="text-zinc-400">/resume</code>.
            </p>
          </FormField>
        </div>

        {/* Social Links Card */}
        <div className="rounded-lg border border-white/[0.06] bg-zinc-950 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Social Links</h3>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => socialsField.append({ label: '', href: '' })}
              disabled={updateMutation.isPending}
            >
              <Plus className="h-4 w-4" />
              Add Social
            </Button>
          </div>

          <div className="space-y-3">
            {socialsField.fields.map((field, index) => (
              <div key={field.id} className="space-y-2 p-4 rounded-lg bg-white/[0.02] border border-white/[0.05]">
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Label (e.g. LinkedIn)"
                    {...form.register(`socials.${index}.label`)}
                    className="rounded-lg border border-white/[0.1] bg-white/[0.05] px-4 py-2 text-white placeholder-zinc-500 focus:border-white/[0.2] focus:outline-none text-sm"
                    disabled={updateMutation.isPending}
                  />
                  <input
                    type="url"
                    placeholder="URL"
                    {...form.register(`socials.${index}.href`)}
                    className="rounded-lg border border-white/[0.1] bg-white/[0.05] px-4 py-2 text-white placeholder-zinc-500 focus:border-white/[0.2] focus:outline-none text-sm"
                    disabled={updateMutation.isPending}
                  />
                </div>
                {form.formState.errors.socials?.[index] && (
                  <p className="text-xs text-red-400">
                    {form.formState.errors.socials[index]?.label?.message ||
                      form.formState.errors.socials[index]?.href?.message}
                  </p>
                )}
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => socialsField.remove(index)}
                    className="text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"
                    disabled={updateMutation.isPending}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Callouts Card */}
        <div className="rounded-lg border border-white/[0.06] bg-zinc-950 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Callouts</h3>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => calloutsField.append('')}
              disabled={updateMutation.isPending}
            >
              <Plus className="h-4 w-4" />
              Add Callout
            </Button>
          </div>

          <div className="space-y-2">
            {calloutsField.fields.map((field, index) => (
              <div key={field.id} className="flex gap-3">
                <input
                  type="text"
                  placeholder="Callout text"
                  {...form.register(`callouts.${index}`)}
                  className="flex-1 rounded-lg border border-white/[0.1] bg-white/[0.05] px-4 py-2 text-white placeholder-zinc-500 focus:border-white/[0.2] focus:outline-none text-sm"
                  disabled={updateMutation.isPending}
                />
                <button
                  type="button"
                  onClick={() => calloutsField.remove(index)}
                  className="text-zinc-500 hover:text-red-400 transition-colors h-10 w-10 flex items-center justify-center cursor-pointer"
                  disabled={updateMutation.isPending}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            {form.formState.errors.callouts && (
              <p className="text-xs text-red-400">{form.formState.errors.callouts.message}</p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Button
            type="submit"
            disabled={updateMutation.isPending || isLoading}
          >
            {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  )
}
