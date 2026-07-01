import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, Box, Settings, CheckCircle, Wallet, FileText, LayoutDashboard, Search, FileClock } from "lucide-react"
import { useTranslation } from "react-i18next"

interface DashboardData {
  role: string
  totalTreasury?: string | number
  openChecks?: string | number
  totalItems?: string | number
  activeProduction?: string | number
  totalSales?: string | number
}

interface AuditLog {
  id: number
  reference_id: string
  reference_type: string
  description: string
  created_at: string
}

export default function Dashboard() {
  const { t } = useTranslation()
  const [data, setData] = useState<DashboardData | null>(null)
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch("/api/dashboard")
        if (res.ok) {
          const d = await res.json()
          setData(d)
          if (d.role === 'admin') {
            const auditRes = await fetch("/api/audit")
            if (auditRes.ok) {
              const audit = await auditRes.json()
              setAuditLogs(audit.auditLogs)
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch dashboard", err)
      } finally {
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [])

  if (loading) return <div className="p-6 text-center text-slate-500">Loading...</div>
  if (!data) return <div className="p-6 text-center text-red-500">Failed to load dashboard.</div>

  const getDashboardTitle = () => {
    switch (data.role) {
      case 'admin': return t('adminDashboard');
      case 'accountant': return t('accountantDashboard');
      case 'warehouse': return t('warehouseDashboard');
      case 'production': return t('productionDashboard');
      case 'sales': return t('salesDashboard');
      default: return t('dashboard');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{getDashboardTitle()}</h2>
          <p className="text-slate-500 mt-1 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-emerald-500" />
            {t("role")}: <span className="font-semibold uppercase tracking-wider">{data.role}</span>
          </p>
        </div>
      </div>

      {/* Dynamic KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {['admin', 'accountant'].includes(data.role) && (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">{t("totalTreasury")}</CardTitle>
                <Wallet className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">{Number(data.totalTreasury || 0).toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">{t("openChecks")}</CardTitle>
                <FileText className="h-4 w-4 text-emerald-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">{data.openChecks || 0}</div>
              </CardContent>
            </Card>
          </>
        )}

        {['admin', 'warehouse', 'production'].includes(data.role) && (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">{t("totalItems")}</CardTitle>
                <Box className="h-4 w-4 text-amber-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">{data.totalItems || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">{t("activeProduction")}</CardTitle>
                <Settings className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">{data.activeProduction || 0}</div>
              </CardContent>
            </Card>
          </>
        )}

        {['admin', 'sales'].includes(data.role) && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">{t("totalSales")}</CardTitle>
              <Activity className="h-4 w-4 text-pink-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{data.totalSales || 0}</div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Admin Audit Logs */}
      {data.role === 'admin' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileClock className="h-5 w-5 text-slate-500" />
              {t("auditLogs")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                  <tr>
                    <th className="px-4 py-3">{t("date")}</th>
                    <th className="px-4 py-3">{t("type")}</th>
                    <th className="px-4 py-3">{t("reference")}</th>
                    <th className="px-4 py-3">{t("description")}</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {log.reference_type}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {log.reference_id}
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {log.description}
                      </td>
                    </tr>
                  ))}
                  {auditLogs.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                        {t("noData")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
