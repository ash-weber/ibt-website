import { useCallback, useMemo, useState } from 'react'
import {
  FiArrowRight,
  FiInfo,
  FiMail,
  FiPlus,
  FiTrash2,
  FiUser,
} from 'react-icons/fi'
import {
  ActionButton,
  DeleteConfirmationModal,
  Dropdown,
  Input,
  Loader,
  Modal,
  Pagination,
  RichTextEditor,
  SearchBox,
  Toast,
  Tooltip,
} from '../../component'

export function ComponentsPage() {
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [toastOpen, setToastOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastVariant, setToastVariant] = useState<'success' | 'error'>('success')

  // Loading and interaction states
  const [loadingAction, setLoadingAction] = useState<string | null>(null)
  const [dropdownValue, setDropdownValue] = useState('profile')
  const [searchCount, setSearchCount] = useState(0)
  const [richTextContent, setRichTextContent] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const buttonConfigs = useMemo(
    () => [
      { key: 'save', label: 'Save', intent: 'save' as const },
      { key: 'update', label: 'Update', intent: 'update' as const },
      { key: 'delete', label: 'Delete', intent: 'delete' as const },
      { key: 'cancel', label: 'Cancel', intent: 'cancel' as const },
    ],
    [],
  )

  const dropdownOptions = useMemo(
    () => [
      { label: 'Profile', value: 'profile', icon: <FiUser /> },
      { label: 'Support', value: 'support', icon: <FiInfo /> },
      { label: 'Contact', value: 'contact', icon: <FiMail /> },
    ],
    [],
  )

  const searchableItems = useMemo(
    () => ['Clients', 'Projects', 'Services', 'Testimonials', 'Blogs', 'Settings', 'Terms'],
    [],
  )

  const simulateRequest = (action: string) => {
    setLoadingAction(action)
    window.setTimeout(() => setLoadingAction(null), 1200)
  }

  const handleSearch = useCallback(
    async (query: string) => {
      await new Promise((resolve) => window.setTimeout(resolve, 420))
      if (!query) {
        setSearchCount(0)
        return
      }

      const normalized = query.toLowerCase()
      const count = searchableItems.filter((item) => item.toLowerCase().includes(normalized)).length
      setSearchCount(count)
    },
    [searchableItems],
  )

  const showToast = (message: string, variant: 'success' | 'error') => {
    setToastMessage(message)
    setToastVariant(variant)
    setToastOpen(true)
  }

  return (
    <div className="flex w-full flex-col gap-6 p-4 md:p-6">
      {/* Toast Component */}
      <Toast
        open={toastOpen}
        message={toastMessage}
        variant={toastVariant}
        title={toastVariant === 'success' ? 'Success' : 'Error'}
        onClose={() => setToastOpen(false)}
      />

      {/* Title */}
      <div className="mb-2">
        <h1 className="text-3xl font-bold text-[var(--ui-text)]">Component Library</h1>
        <p className="mt-1 text-[var(--ui-muted)]">Explore all available UI components with interactive examples.</p>
      </div>

      {/* Action Buttons Section */}
      <section className="rounded-[var(--ui-radius-lg)] border border-[var(--ui-border)] bg-white p-6 shadow-[var(--ui-shadow-md)] md:p-8">
        <h2 className="mb-6 text-2xl font-bold">Action Buttons</h2>
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <h3 className="mb-4 text-lg font-semibold text-[var(--ui-text)]">Button Intents</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {buttonConfigs.map((item) => (
                <ActionButton
                  key={item.key}
                  intent={item.intent}
                  loading={loadingAction === item.key}
                  onClick={() => {
                    simulateRequest(item.key)
                    showToast(`${item.label} button clicked`, 'success')
                  }}
                  rightIcon={<FiArrowRight />}
                >
                  {item.label}
                </ActionButton>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold text-[var(--ui-text)]">Button Sizes & Variants</h3>
            <div className="grid gap-3">
              <ActionButton intent="primary" size="sm" leftIcon={<FiPlus />} fullWidth>
                Small Primary
              </ActionButton>
              <ActionButton intent="secondary" size="md">
                Medium Secondary
              </ActionButton>
              <ActionButton intent="ghost" size="lg" leftIcon={<FiArrowRight />}>
                Large Ghost
              </ActionButton>
              <ActionButton intent="primary" disabled>
                Disabled Button
              </ActionButton>
            </div>
          </div>
        </div>
      </section>

      {/* Loader Section */}
      <section className="rounded-[var(--ui-radius-lg)] border border-[var(--ui-border)] bg-white p-6 shadow-[var(--ui-shadow-md)] md:p-8">
        <h2 className="mb-6 text-2xl font-bold">Loader</h2>
        <div className="flex flex-wrap items-center gap-8 rounded-[var(--ui-radius-md)] border border-[var(--ui-border)] bg-[var(--ui-surface-muted)] p-8">
          <div className="flex flex-col items-center gap-2">
            <Loader size="sm" label="Small" />
            <span className="text-xs text-[var(--ui-muted)]">Small</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Loader size="md" label="Medium" />
            <span className="text-xs text-[var(--ui-muted)]">Medium</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Loader size="lg" label="Large" />
            <span className="text-xs text-[var(--ui-muted)]">Large</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Loader size={56} label="Custom" />
            <span className="text-xs text-[var(--ui-muted)]">48px Custom</span>
          </div>
        </div>
      </section>

      {/* Input Section */}
      <section className="rounded-[var(--ui-radius-lg)] border border-[var(--ui-border)] bg-white p-6 shadow-[var(--ui-shadow-md)] md:p-8">
        <h2 className="mb-6 text-2xl font-bold">Input Fields</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[var(--ui-text)]">Text Inputs</h3>
            <Input label="Full Name" placeholder="John Doe" startIcon={<FiUser />} helperText="Enter your full name" />
            <Input
              label="Email Address"
              type="email"
              placeholder="hello@company.com"
              startIcon={<FiMail />}
              helperText="We'll never share your email"
            />
            <Input label="Password" type="password" placeholder="Enter secure password" helperText="Min 8 characters required" />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[var(--ui-text)]">Input Variants</h3>
            <Input label="Phone Number" placeholder="+1 (555) 000-0000" helperText="Include country code" />
            <Input label="Disabled Input" placeholder="Disabled" disabled />
            <Input label="With Error" placeholder="Error state" error="This field contains an error" />
          </div>
        </div>
      </section>

      {/* Search Box Section */}
      <section className="rounded-[var(--ui-radius-lg)] border border-[var(--ui-border)] bg-white p-6 shadow-[var(--ui-shadow-md)] md:p-8">
        <h2 className="mb-6 text-2xl font-bold">Search Box</h2>
        <div className="space-y-4">
          <SearchBox
            placeholder="Search sections (Clients, Projects, Services, etc.)..."
            debounceMs={300}
            onSearch={handleSearch}
            className="w-full"
          />
          <p className="text-sm text-[var(--ui-muted)]">
            {searchCount > 0 ? `Found ${searchCount} matching result(s)` : 'Try searching for: Clients, Projects, Services, Testimonials, Blogs, Settings, or Terms'}
          </p>
        </div>
      </section>

      {/* Dropdown Section */}
      <section className="rounded-[var(--ui-radius-lg)] border border-[var(--ui-border)] bg-white p-6 shadow-[var(--ui-shadow-md)] md:p-8">
        <h2 className="mb-6 text-2xl font-bold">Dropdown</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="mb-4 text-lg font-semibold text-[var(--ui-text)]">With Icons</h3>
            <Dropdown options={dropdownOptions} value={dropdownValue} onChange={setDropdownValue} />
            <p className="mt-3 text-sm text-[var(--ui-muted)]">Selected: <span className="font-medium">{dropdownValue}</span></p>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold text-[var(--ui-text)]">Simple Options</h3>
            <Dropdown
              options={[
                { label: 'Option 1', value: 'opt1' },
                { label: 'Option 2', value: 'opt2' },
                { label: 'Option 3', value: 'opt3' },
              ]}
              value="opt1"
              onChange={() => {}}
              placeholder="Choose an option"
            />
          </div>
        </div>
      </section>

      {/* Tooltip Section */}
      <section className="rounded-[var(--ui-radius-lg)] border border-[var(--ui-border)] bg-white p-6 shadow-[var(--ui-shadow-md)] md:p-8">
        <h2 className="mb-6 text-2xl font-bold">Tooltip</h2>
        <div className="flex flex-wrap gap-6">
          <Tooltip content="Hover to see tooltip message">
            <button type="button" className="rounded-md border border-[var(--ui-border)] bg-white px-4 py-2 text-sm hover:bg-[var(--ui-surface-muted)]">
              <FiInfo className="inline mr-2" /> Hover me
            </button>
          </Tooltip>

          <Tooltip content="Another tooltip example with longer text to show word wrapping">
            <button type="button" className="rounded-md border border-[var(--ui-border)] bg-white px-4 py-2 text-sm hover:bg-[var(--ui-surface-muted)]">
              <FiUser className="inline mr-2" /> User Info
            </button>
          </Tooltip>

          <Tooltip content="This tooltip tests edge positioning">
            <button type="button" className="rounded-md border border-[var(--ui-border)] bg-white px-4 py-2 text-sm hover:bg-[var(--ui-surface-muted)]">
              <FiMail className="inline mr-2" /> Contact
            </button>
          </Tooltip>
        </div>
      </section>

      {/* Pagination Section */}
      <section className="rounded-[var(--ui-radius-lg)] border border-[var(--ui-border)] bg-white p-6 shadow-[var(--ui-shadow-md)] md:p-8">
        <h2 className="mb-6 text-2xl font-bold">Pagination</h2>
        <div className="flex flex-col items-center gap-6">
          <div className="w-full">
            <p className="mb-4 text-sm text-[var(--ui-muted)]">Current Page: {currentPage} of 12</p>
            <Pagination
              page={currentPage}
              totalPages={12}
              hasPrev={currentPage > 1}
              hasNext={currentPage < 12}
              onPageChange={(page) => {
                setCurrentPage(page)
                showToast(`Navigated to page ${page}`, 'success')
              }}
            />
          </div>
        </div>
      </section>

      {/* Rich Text Editor Section */}
      <section className="rounded-[var(--ui-radius-lg)] border border-[var(--ui-border)] bg-white p-6 shadow-[var(--ui-shadow-md)] md:p-8">
        <h2 className="mb-6 text-2xl font-bold">Rich Text Editor</h2>
        <div>
          <h3 className="mb-4 text-lg font-semibold text-[var(--ui-text)]">Content Editor</h3>
          <RichTextEditor value={richTextContent} onChange={setRichTextContent} placeholder="Write your content here..." />
          {richTextContent && (
            <div className="mt-4 rounded-[var(--ui-radius-md)] border border-[var(--ui-border)] bg-[var(--ui-surface-muted)] p-4">
              <p className="mb-2 text-sm font-semibold text-[var(--ui-text)]">Preview:</p>
              <div className="text-sm text-[var(--ui-muted)]" dangerouslySetInnerHTML={{ __html: richTextContent }} />
            </div>
          )}
        </div>
      </section>

      {/* Modal Section */}
      <section className="rounded-[var(--ui-radius-lg)] border border-[var(--ui-border)] bg-white p-6 shadow-[var(--ui-shadow-md)] md:p-8">
        <h2 className="mb-6 text-2xl font-bold">Modal</h2>
        <div className="flex flex-wrap gap-4">
          <ActionButton intent="primary" onClick={() => setIsModalOpen(true)}>
            Open Standard Modal
          </ActionButton>
          <ActionButton intent="delete" leftIcon={<FiTrash2 />} confirmDestructive={false} onClick={() => setIsDeleteModalOpen(true)}>
            Open Delete Modal
          </ActionButton>
        </div>
      </section>

      {/* Standard Modal */}
      <Modal
        isOpen={isModalOpen}
        title="Edit Client Details"
        onClose={() => setIsModalOpen(false)}
        footer={
          <>
            <ActionButton intent="cancel" onClick={() => setIsModalOpen(false)}>
              Cancel
            </ActionButton>
            <ActionButton
              intent="save"
              loading={loadingAction === 'modal-save'}
              onClick={() => {
                simulateRequest('modal-save')
                setTimeout(() => {
                  setIsModalOpen(false)
                  showToast('Client details saved successfully', 'success')
                }, 1200)
              }}
            >
              Save Changes
            </ActionButton>
          </>
        }
      >
        <div className="grid gap-4">
          <p className="text-[var(--ui-muted)]">Edit the client information in the form below. This modal demonstrates the standard layout with scrollable content.</p>
          <Input label="Client Name" placeholder="Acme Labs" defaultValue="Acme Labs" />
          <Input label="Contact Email" type="email" placeholder="team@acme.io" defaultValue="team@acme.io" />
          <Input label="Phone Number" placeholder="+1 (555) 123-4567" />
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        itemType="client"
        itemLabel="Acme Labs"
        loading={loadingAction === 'delete-confirm'}
        onCancel={() => setIsDeleteModalOpen(false)}
        onConfirm={() => {
          simulateRequest('delete-confirm')
          setTimeout(() => {
            setIsDeleteModalOpen(false)
            showToast('Client deleted successfully', 'success')
          }, 1200)
        }}
      />
    </div>
  )
}
