import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BarChart3, TrendingUp, TrendingDown, DollarSign, RefreshCcw } from "lucide-react"

export default function Reports() {
  const [trialBalance, setTrialBalance] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const fetchTrialBalance = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/reports/trial-balance")
      if (res.ok) setTrialBalance(await res.json())
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTrialBalance()
  }, [])

  const totalDebit = trialBalance.reduce((sum, item) => sum + Number(item.totalDebit), 0)
  const totalCredit = trialBalance.reduce((sum, item) => sum + Number(item.totalCredit), 0)
  
  // Calculate balances correctly
  const trialBalanceWithFinal = trialBalance.map(item => {
    const debit = Number(item.totalDebit)
    const credit = Number(item.totalCredit)
    const bal = debit - credit
    return {
      ...item,
      finalDebit: bal > 0 ? bal : 0,
      finalCredit: bal < 0 ? Math.abs(bal) : 0
    }
  })

  const totalFinalDebit = trialBalanceWithFinal.reduce((sum, item) => sum + item.finalDebit, 0)
  const totalFinalCredit = trialBalanceWithFinal.reduce((sum, item) => sum + item.finalCredit, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-blue-600" />
          التقارير المالية والحسابات الختامية
        </h2>
        <button onClick={fetchTrialBalance} className="p-2 bg-white border border-slate-200 rounded-md hover:bg-slate-50 text-slate-600">
          <RefreshCcw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-800 flex justify-between items-center">
              إجمالي الحركات المدينة
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{totalDebit.toLocaleString()} ج</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-red-50 to-red-100/50 border-red-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-800 flex justify-between items-center">
              إجمالي الحركات الدائنة
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-900">{totalCredit.toLocaleString()} ج</div>
          </CardContent>
        </Card>

        <Card className={`bg-gradient-to-br border ${totalFinalDebit === totalFinalCredit ? 'from-emerald-50 to-emerald-100/50 border-emerald-200' : 'from-orange-50 to-orange-100/50 border-orange-200'}`}>
          <CardHeader className="pb-2">
            <CardTitle className={`text-sm font-medium flex justify-between items-center ${totalFinalDebit === totalFinalCredit ? 'text-emerald-800' : 'text-orange-800'}`}>
              حالة التوازن
              <DollarSign className={`h-4 w-4 ${totalFinalDebit === totalFinalCredit ? 'text-emerald-600' : 'text-orange-600'}`} />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalFinalDebit === totalFinalCredit ? 'text-emerald-900' : 'text-orange-900'}`}>
              {totalFinalDebit === totalFinalCredit ? 'متزن' : 'غير متزن'}
            </div>
            {totalFinalDebit !== totalFinalCredit && (
              <div className="text-xs text-orange-700 mt-1">الفرق: {Math.abs(totalFinalDebit - totalFinalCredit).toLocaleString()} ج</div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>ميزان المراجعة (Trial Balance)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead rowSpan={2} className="border-b align-middle font-bold text-slate-700">الحساب</TableHead>
                <TableHead rowSpan={2} className="border-b align-middle font-bold text-slate-700">النوع</TableHead>
                <TableHead colSpan={2} className="text-center border-b font-bold text-slate-700">بالمجاميع</TableHead>
                <TableHead colSpan={2} className="text-center border-b font-bold text-slate-700">بالأرصدة</TableHead>
              </TableRow>
              <TableRow className="bg-slate-50/50">
                <TableHead className="text-right text-xs">مدين</TableHead>
                <TableHead className="text-right text-xs">دائن</TableHead>
                <TableHead className="text-right text-xs">مدين</TableHead>
                <TableHead className="text-right text-xs">دائن</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trialBalanceWithFinal.map((row, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-medium text-slate-800">{row.accountName}</TableCell>
                  <TableCell className="text-slate-500 text-sm">
                    {row.accountType === 'treasury' ? 'خزينة' :
                     row.accountType === 'bank' ? 'بنك' :
                     row.accountType === 'expense' ? 'مصروف' :
                     row.accountType === 'revenue' ? 'إيراد' : 
                     row.accountType === 'asset' ? 'أصل' :
                     row.accountType === 'liability' ? 'خصوم' : row.accountType}
                  </TableCell>
                  <TableCell className="text-right text-emerald-600/80">{Number(row.totalDebit) > 0 ? Number(row.totalDebit).toLocaleString() : '-'}</TableCell>
                  <TableCell className="text-right text-red-600/80">{Number(row.totalCredit) > 0 ? Number(row.totalCredit).toLocaleString() : '-'}</TableCell>
                  <TableCell className="text-right font-bold text-emerald-600 bg-emerald-50/30">{row.finalDebit > 0 ? row.finalDebit.toLocaleString() : '-'}</TableCell>
                  <TableCell className="text-right font-bold text-red-600 bg-red-50/30">{row.finalCredit > 0 ? row.finalCredit.toLocaleString() : '-'}</TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-slate-100 font-bold border-t-2 border-slate-300">
                <TableCell colSpan={2} className="text-left">الإجمالي</TableCell>
                <TableCell className="text-right text-slate-900">{totalDebit.toLocaleString()}</TableCell>
                <TableCell className="text-right text-slate-900">{totalCredit.toLocaleString()}</TableCell>
                <TableCell className="text-right text-slate-900">{totalFinalDebit.toLocaleString()}</TableCell>
                <TableCell className="text-right text-slate-900">{totalFinalCredit.toLocaleString()}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
