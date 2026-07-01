import { useState, useEffect } from "react"
import { Outlet } from "react-router-dom"
import { Header } from "./Header"
import { Sidebar } from "./Sidebar"
import { cn } from "@/lib/utils"
import { useTranslation } from "react-i18next"

export function MainLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const { i18n } = useTranslation()

  // Auto-close sidebar on small screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false)
      } else {
        setIsSidebarOpen(true)
      }
    }
    window.addEventListener("resize", handleResize)
    handleResize()
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  const isRtl = i18n.language === 'ar';

  return (
    <div className="min-h-screen bg-slate-50">
      <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      <div className="flex">
        <Sidebar isOpen={isSidebarOpen} isRtl={isRtl} />
        <main
          className={cn(
            "flex-1 p-6 transition-all duration-300",
            isSidebarOpen ? (isRtl ? "mr-64" : "ml-64") : (isRtl ? "mr-16" : "ml-16")
          )}
        >
          <div className="mx-auto max-w-7xl pt-16">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
