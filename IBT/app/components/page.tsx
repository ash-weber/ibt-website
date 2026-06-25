'use client'

import { useEffect, useState } from 'react'
import { ActionButton, Badge, Checkbox, Input, Loader, Modal, Textarea, Toast } from '@/src/shared/ui'

export default function ComponentsShowcase() {
  const [toastOpen, setToastOpen] = useState(false)
  const [toastVariant, setToastVariant] = useState<'success' | 'error'>('success')
  const [modalOpen, setModalOpen] = useState(false)
  const [showLoader, setShowLoader] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    message: '',
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  // Auto-dismiss fullscreen loader after 3 seconds
  useEffect(() => {
    if (!showLoader) return
    const timer = setTimeout(() => setShowLoader(false), 3000)
    return () => clearTimeout(timer)
  }, [showLoader])

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const handleFormSubmit = async () => {
    const errors: Record<string, string> = {}
    if (!formData.username) errors.username = 'Username is required'
    if (!formData.email) errors.email = 'Email is required'
    if (!formData.password) errors.password = 'Password is required'

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    setIsLoading(true)
    await new Promise((r) => setTimeout(r, 2000))
    setIsLoading(false)
    setToastVariant('success')
    setToastOpen(true)
  }

  return (
    <div className="min-h-full bg-(--ui-surface)">
      {/* Toast Demo */}
      <Toast
        open={toastOpen}
        onClose={() => setToastOpen(false)}
        variant={toastVariant}
        title={toastVariant === 'success' ? 'Success!' : 'Error'}
        message={toastVariant === 'success' ? 'Operation completed successfully' : 'Something went wrong'}
      />

      {/* Modal Demo */}
      <Modal isOpen={modalOpen} title="Example Modal" onClose={() => setModalOpen(false)}>
        <p className="text-sm text-(--ui-text) mb-4">
          This is a modal component. It supports custom sizing, closing on overlay click, and ESC key.
        </p>
        <div className="flex gap-2 justify-end">
          <ActionButton intent="cancel" onClick={() => setModalOpen(false)}>
            Cancel
          </ActionButton>
          <ActionButton
            intent="save"
            onClick={() => {
              setModalOpen(false)
              setToastVariant('success')
              setToastOpen(true)
            }}
          >
            Confirm
          </ActionButton>
        </div>
      </Modal>

      {/* Loader Fullscreen Demo */}
      {showLoader && <Loader fullscreen label="Loading Data..." />}

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Header */}
        <section className="mb-12">
          <h1 className="text-3xl font-bold text-(--ui-text) mb-2">
            Component Library Showcase
          </h1>
          <p className="text-(--ui-muted)">
            Red-themed, optimized components matching admin design patterns
          </p>
        </section>

        {/* Button Variants */}
        <section className="mb-12">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-(--ui-text) mb-4">Buttons</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-(--ui-muted) mb-2">Intent Variants</p>
                <div className="flex flex-wrap gap-2">
                  <ActionButton intent="primary">Primary</ActionButton>
                  <ActionButton intent="save">Save</ActionButton>
                  <ActionButton intent="update">Update</ActionButton>
                  <ActionButton intent="delete">Delete</ActionButton>
                  <ActionButton intent="cancel">Cancel</ActionButton>
                  <ActionButton intent="secondary">Secondary</ActionButton>
                  <ActionButton intent="ghost">Ghost</ActionButton>
                </div>
              </div>

              <div>
                <p className="text-sm text-(--ui-muted) mb-2">Sizes</p>
                <div className="flex flex-wrap gap-2 items-center">
                  <ActionButton intent="primary" size="sm">
                    Small
                  </ActionButton>
                  <ActionButton intent="primary" size="md">
                    Medium
                  </ActionButton>
                  <ActionButton intent="primary" size="lg">
                    Large
                  </ActionButton>
                </div>
              </div>

              <div>
                <p className="text-sm text-(--ui-muted) mb-2">States</p>
                <div className="flex flex-wrap gap-2">
                  <ActionButton intent="primary" disabled>
                    Disabled
                  </ActionButton>
                  <ActionButton intent="primary" loading>
                    Loading
                  </ActionButton>
                  <ActionButton intent="primary" fullWidth>
                    Full Width
                  </ActionButton>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Button Demos */}
          <div className="bg-(--ui-surface-muted) rounded-lg p-6 space-y-2 border border-(--ui-border)">
            <p className="text-sm text-(--ui-muted) mb-4">Interactive Demos</p>
            <ActionButton intent="primary" onClick={() => setModalOpen(true)}>
              Open Modal
            </ActionButton>
            <ActionButton intent="primary" onClick={() => setToastOpen(true)}>
              Show Toast
            </ActionButton>
            <ActionButton intent="primary" onClick={() => setShowLoader(true)}>
              Show Fullscreen Loader
            </ActionButton>
          </div>
        </section>

        {/* Form Components */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-(--ui-text) mb-4">Form Components</h2>

          <div className="bg-(--ui-surface-muted) rounded-lg p-6 space-y-4 border border-(--ui-border)">
            <Input
              label="Username"
              name="username"
              placeholder="Enter your username"
              value={formData.username}
              onChange={handleFormChange}
              error={formErrors.username}
              helperText="Min 3 characters"
            />

            <Input
              label="Email"
              name="email"
              type="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={handleFormChange}
              error={formErrors.email}
            />

            <Input
              label="Password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleFormChange}
              error={formErrors.password}
              showPasswordToggle
            />

            <Textarea
              label="Message"
              name="message"
              placeholder="Your message here..."
              value={formData.message}
              onChange={handleFormChange}
              rows={4}
              helperText="Optional"
            />

            <Checkbox label="I agree to terms and conditions" />

            <div className="flex gap-2 pt-2">
              <ActionButton
                intent="save"
                loading={isLoading}
                onClick={handleFormSubmit}
              >
                Submit
              </ActionButton>
              <ActionButton
                intent="cancel"
                onClick={() => {
                  setFormData({ username: '', email: '', password: '', message: '' })
                  setFormErrors({})
                }}
              >
                Reset
              </ActionButton>
            </div>
          </div>
        </section>

        {/* Badges */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-(--ui-text) mb-4">Badges</h2>
          <div className="bg-(--ui-surface-muted) rounded-lg p-6 space-y-3 border border-(--ui-border)">
            <div className="space-y-2">
              <p className="text-sm text-(--ui-muted)">Variants</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="primary">Primary</Badge>
                <Badge variant="danger">Danger</Badge>
                <Badge variant="neutral">Neutral</Badge>
                <Badge variant="success">Success</Badge>
                <Badge variant="warning">Warning</Badge>
              </div>
            </div>
          </div>
        </section>

        {/* Loader */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-(--ui-text) mb-4">Loader</h2>
          <div className="bg-(--ui-surface-muted) rounded-lg p-6 space-y-4 border border-(--ui-border)">
            <div className="space-y-2">
              <p className="text-sm text-(--ui-muted)">Inline Loader Sizes</p>
              <div className="flex gap-8 items-center">
                <div className="flex items-center gap-2">
                  <Loader size="sm" label="small" />
                  <span className="text-xs text-(--ui-muted)">small</span>
                </div>
                <div className="flex items-center gap-2">
                  <Loader size="md" label="medium" />
                  <span className="text-xs text-(--ui-muted)">medium</span>
                </div>
                <div className="flex items-center gap-2">
                  <Loader size="lg" label="large" />
                  <span className="text-xs text-(--ui-muted)">large</span>
                </div>
              </div>
            </div>
            <div>
              <p className="text-sm text-(--ui-muted) mb-2">Fullscreen Loader</p>
              <ActionButton intent="secondary" onClick={() => setShowLoader(true)}>
                Show Fullscreen Loader
              </ActionButton>
            </div>
          </div>
        </section>

        {/* Theme Info */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-(--ui-text) mb-4">Theme Colors</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div
                className="h-12 rounded-lg border border-(--ui-border)"
                style={{ backgroundColor: '#e02525' }}
              />
              <p className="text-xs font-medium text-(--ui-text)">Primary</p>
              <p className="text-xs text-(--ui-muted)">#e02525</p>
            </div>
            <div className="space-y-2">
              <div
                className="h-12 rounded-lg border border-(--ui-border)"
                style={{ backgroundColor: '#c51d1d' }}
              />
              <p className="text-xs font-medium text-(--ui-text)">Primary Strong</p>
              <p className="text-xs text-(--ui-muted)">#c51d1d</p>
            </div>
            <div className="space-y-2">
              <div
                className="h-12 rounded-lg border border-(--ui-border)"
                style={{ backgroundColor: '#fee2e2' }}
              />
              <p className="text-xs font-medium text-(--ui-text)">Primary Soft</p>
              <p className="text-xs text-(--ui-muted)">#fee2e2</p>
            </div>
            <div className="space-y-2">
              <div
                className="h-12 rounded-lg border border-(--ui-border)"
                style={{ backgroundColor: '#dc2626' }}
              />
              <p className="text-xs font-medium text-(--ui-text)">Danger</p>
              <p className="text-xs text-(--ui-muted)">#dc2626</p>
            </div>
            <div className="space-y-2">
              <div
                className="h-12 rounded-lg border border-(--ui-border)"
                style={{ backgroundColor: '#374151' }}
              />
              <p className="text-xs font-medium text-(--ui-text)">Neutral</p>
              <p className="text-xs text-(--ui-muted)">#374151</p>
            </div>
            <div className="space-y-2">
              <div
                className="h-12 rounded-lg border border-(--ui-border)"
                style={{ backgroundColor: '#f8fafc' }}
              />
              <p className="text-xs font-medium text-(--ui-text)">Surface Muted</p>
              <p className="text-xs text-(--ui-muted)">#f8fafc</p>
            </div>
          </div>
        </section>

        {/* Typography */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-(--ui-text) mb-4">Typography</h2>
          <div className="space-y-4">
            <h1 className="text-3xl font-bold text-(--ui-text)">Heading 1 (3xl bold)</h1>
            <h2 className="text-2xl font-bold text-(--ui-text)">Heading 2 (2xl bold)</h2>
            <h3 className="text-xl font-bold text-(--ui-text)">Heading 3 (xl bold)</h3>
            <p className="text-base text-(--ui-text)">Body text (base)</p>
            <p className="text-sm text-(--ui-text)">Small text (sm)</p>
            <p className="text-xs text-(--ui-muted)">Extra small text (xs)</p>
          </div>
        </section>
      </div>
    </div>
  )
}
