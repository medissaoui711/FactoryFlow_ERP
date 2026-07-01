import { Menu, Search, Bell, Globe } from "lucide-react"
import { useTranslation } from "react-i18next"

export function Header({ toggleSidebar }: { toggleSidebar: () => void }) {
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'ar' ? 'en' : 'ar');
  };

  return (
    <header className="fixed top-0 z-30 flex h-14 w-full items-center justify-between border-b border-slate-200 bg-white px-4">
      <div className="flex items-center gap-4">
        <button onClick={toggleSidebar} className="text-slate-400 hover:text-slate-900" aria-label={t("toggleSidebar")}>
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2 text-slate-600">
          <span className="font-semibold text-slate-900">FactoryFlow ERP</span>
          <span className="text-xs text-slate-500 hidden sm:inline-block">{t("factoryName")}</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative hidden md:block">
          <Search className="absolute right-2.5 top-2 h-4 w-4 text-slate-500" style={{ right: i18n.language === 'ar' ? '10px' : 'auto', left: i18n.language === 'en' ? '10px' : 'auto' }} />
          <input
            type="search"
            placeholder={t("search")}
            className="h-8 rounded-md bg-slate-50 border border-slate-200 px-9 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <button onClick={toggleLanguage} className="flex items-center gap-1 text-slate-500 hover:text-slate-900 text-sm font-medium">
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline-block">{t("language")}</span>
        </button>
        <button className="text-slate-400 hover:text-slate-900">
          <Bell className="h-5 w-5" />
        </button>
      </div>
    </header>
  )
}
