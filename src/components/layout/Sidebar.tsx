import { Link, useLocation } from "react-router-dom"
import { useState, useRef, useEffect } from "react"
import {
  LayoutDashboard,
  Factory,
  Package,
  ShoppingCart,
  Users,
  Wallet,
  Settings,
  ShieldCheck,
  FileText,
  User,
  Shield,
  HelpCircle,
  LogOut,
  ChevronUp,
  ChevronDown
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useTranslation } from "react-i18next"

const navItems = [
  { titleKey: "dashboard", icon: LayoutDashboard, href: "/" },
  { titleKey: "liveProduction", icon: Factory, href: "/production" },
  { titleKey: "itemsMaster", icon: Package, href: "/inventory/items-master" },
  { titleKey: "inventory", icon: Package, href: "/inventory" },
  { titleKey: "sales", icon: ShoppingCart, href: "/sales" },
  { titleKey: "purchaseOrders", icon: ShoppingCart, href: "/purchases" },
  { titleKey: "treasury", icon: Wallet, href: "/finance/treasury" },
  { titleKey: "checks", icon: FileText, href: "/finance/checks" },
  { titleKey: "expenses", icon: FileText, href: "/finance/expenses" },
  { titleKey: "journal", icon: FileText, href: "/finance/journal" },
  { titleKey: "partners", icon: Users, href: "/partners" },
  { titleKey: "hr", icon: Users, href: "/hr" },
  { titleKey: "gates", icon: ShieldCheck, href: "/gates" },
  { titleKey: "reports", icon: FileText, href: "/reports" },
]

export function Sidebar({ isOpen, isRtl }: { isOpen: boolean; isRtl: boolean }) {
  const location = useLocation()
  const { t } = useTranslation()
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const settingsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setIsSettingsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  return (
    <aside
      className={cn(
        "fixed inset-y-0 z-20 flex flex-col border-slate-200 bg-white transition-all duration-300 pt-14",
        isRtl ? "right-0 border-l" : "left-0 border-r",
        isOpen ? "w-64" : "w-16"
      )}
    >
      <div className="flex-1 overflow-y-auto py-4 overflow-x-hidden">
        <nav className="space-y-1 px-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href || (item.href !== "/" && location.pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                to={item.href}
                title={!isOpen ? t(item.titleKey) : undefined}
                className={cn(
                  "flex items-center rounded-md transition-colors",
                  isOpen ? "gap-3 px-3 py-2" : "justify-center p-2",
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                <item.icon className={cn("h-5 w-5 shrink-0", isActive ? "text-blue-600" : "text-slate-400")} />
                {isOpen && <span className="text-sm font-medium whitespace-nowrap overflow-hidden">{t(item.titleKey)}</span>}
              </Link>
            )
          })}
        </nav>
      </div>
      <div className={cn("border-t border-slate-200", isOpen ? "p-4" : "p-2")} ref={settingsRef}>
        <div className="relative flex justify-center">
          {isSettingsOpen && (
            <div className={cn(
              "absolute bottom-full mb-2 rounded-md border border-slate-200 bg-white shadow-lg overflow-hidden z-50",
              isOpen ? "w-full left-0 right-0" : "w-48",
              !isOpen && (isRtl ? "right-full mr-2" : "left-full ml-2")
            )}>
              <div className="px-3 py-3 border-b border-slate-100">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{t('currentAccount')}</div>
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <User className="h-4 w-4 shrink-0 text-slate-400" />
                  <span className="truncate">admin@factory.com</span>
                </div>
              </div>
              <div className="py-1">
                <Link
                  to="/settings"
                  onClick={() => setIsSettingsOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                >
                  <Settings className="h-4 w-4 shrink-0" />
                  {t("settings")}
                </Link>
                <Link
                  to="/privacy"
                  onClick={() => setIsSettingsOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                >
                  <Shield className="h-4 w-4 shrink-0" />
                  {t("privacy")}
                </Link>
                <Link
                  to="/terms"
                  onClick={() => setIsSettingsOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                >
                  <FileText className="h-4 w-4 shrink-0" />
                  {t("terms")}
                </Link>
                <Link
                  to="/faq"
                  onClick={() => setIsSettingsOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                >
                  <HelpCircle className="h-4 w-4 shrink-0" />
                  {t("faq")}
                </Link>
              </div>
              <div className="border-t border-slate-100 py-1">
                <button
                  onClick={() => {
                    setIsSettingsOpen(false);
                    // Add logout logic here
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                >
                  <LogOut className="h-4 w-4 shrink-0" />
                  {t("logout")}
                </button>
              </div>
            </div>
          )}
          <button
            title={!isOpen ? t("settings") : undefined}
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className={cn(
              "flex items-center rounded-md transition-colors",
              isOpen ? "w-full justify-between gap-3 px-3 py-2" : "justify-center p-2 w-full",
              isSettingsOpen ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            )}
          >
            <div className={cn("flex items-center", isOpen ? "gap-3" : "justify-center w-full")}>
              <Settings className="h-5 w-5 shrink-0 text-slate-400" />
              {isOpen && <span className="text-sm font-medium whitespace-nowrap overflow-hidden">{t("settings")}</span>}
            </div>
            {isOpen && (
              isSettingsOpen ? (
                <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
              ) : (
                <ChevronUp className="h-4 w-4 shrink-0 text-slate-400" />
              )
            )}
          </button>
        </div>
      </div>
    </aside>
  )
}
