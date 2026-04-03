'use client'

import { useState, useMemo } from 'react'
import {
  ChevronDown,
  Search,
  Code,
  Cpu,
  Database,
  Shield,
  Zap,
  Rocket,
  Target,
  Users,
  Globe,
  Layers,
  Wrench,
  Settings,
  Package,
  GitBranch,
  Workflow,
  Award,
  Briefcase,
  Smartphone,
  Server,
  Brain,
} from 'lucide-react'

// 20 commonly used icons for skills and hero sections
const ICON_LIST = [
  { name: 'Code', icon: Code },
  { name: 'Cpu', icon: Cpu },
  { name: 'Database', icon: Database },
  { name: 'Shield', icon: Shield },
  { name: 'Zap', icon: Zap },
  { name: 'Rocket', icon: Rocket },
  { name: 'Target', icon: Target },
  { name: 'Users', icon: Users },
  { name: 'Globe', icon: Globe },
  { name: 'Layers', icon: Layers },
  { name: 'Wrench', icon: Wrench },
  { name: 'Settings', icon: Settings },
  { name: 'Package', icon: Package },
  { name: 'GitBranch', icon: GitBranch },
  { name: 'Workflow', icon: Workflow },
  { name: 'Award', icon: Award },
  { name: 'Briefcase', icon: Briefcase },
  { name: 'Smartphone', icon: Smartphone },
  { name: 'Server', icon: Server },
  { name: 'Brain', icon: Brain },
] as const

type IconName = (typeof ICON_LIST)[number]['name']

interface IconSelectorProps {
  value: string
  onChange: (iconName: string) => void
  disabled?: boolean
}

export function IconSelector({ value, onChange, disabled }: IconSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')

  const filteredIcons = useMemo(() => {
    return ICON_LIST.filter((iconObj) => iconObj.name.toLowerCase().includes(search.toLowerCase()))
  }, [search])

  const selectedIconObj = ICON_LIST.find((iconObj) => iconObj.name === value)
  const SelectedIconComponent = selectedIconObj?.icon

  return (
    <div className="relative w-full">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-zinc-500 focus:border-white/20 focus:outline-none flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/8 transition-colors"
      >
        <div className="flex items-center gap-2">
          {SelectedIconComponent ? (
            <>
              <SelectedIconComponent className="w-4 h-4 text-white" />
              <span className="text-sm">{value}</span>
            </>
          ) : (
            <span className="text-sm text-zinc-400">Select an icon</span>
          )}
        </div>
        <ChevronDown
          className={`w-4 h-4 text-zinc-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 rounded-lg border border-white/10 bg-zinc-900 shadow-lg z-50 overflow-hidden">
          {/* Search Input */}
          <div className="p-3 border-b border-white/10">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Search icons..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded bg-white/5 border border-white/10 text-white text-sm placeholder-zinc-500 focus:border-white/20 focus:outline-none"
                autoFocus
              />
            </div>
          </div>

          {/* Icons Grid */}
          <div className="grid grid-cols-5 gap-2 p-4 max-h-64 overflow-y-auto scrollbar-hide">
            {filteredIcons.length > 0 ? (
              filteredIcons.map(({ name, icon: IconComponent }) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => {
                    onChange(name)
                    setIsOpen(false)
                    setSearch('')
                  }}
                  className={`flex flex-col items-center justify-center gap-1 p-3 rounded-lg transition-colors ${
                    value === name
                      ? 'bg-white/15 border border-white/30'
                      : 'bg-white/5 border border-transparent hover:bg-white/10'
                  }`}
                  title={name}
                >
                  <IconComponent className="w-5 h-5 text-white" />
                  <span className="text-xs text-zinc-400 text-center truncate w-full">{name}</span>
                </button>
              ))
            ) : (
              <div className="col-span-5 text-center py-8 text-zinc-500 text-sm">
                No icons found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
