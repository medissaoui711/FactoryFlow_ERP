import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, PieChart, Plus, X } from "lucide-react"
import { format } from "date-fns"

export default function Expenses() {
  const [expensesData, setExpensesData] = useState<any[]>([])
  const [expenseAccounts, setExpenseAccounts] = useState<any[]>([])
  const [treasuries, setTreasuries] = useState<any[]>([])
  const [showAddModal, setShowAddModal] = useState(false)

  // Form
  const [accountId, setAccountId] = useState("")
  const [treasuryId, setTreasuryId] = useState("")
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")

  useEffect(() => {
    fetchExpenses()
    fetchAccounts()
  }, [])

  const fetchExpenses = async () => {
    try {
      const res = await fetch("/api/expenses")
      if (res.ok) {
        const data = await res.json()
        setExpensesData(data)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const fetchAccounts = async () => {
    try {
      const expRes = await fetch("/api/accounts?type=expense")
      if (expRes.ok) setExpenseAccounts(await expRes.json())

      const trRes = await fetch("/api/accounts")
      if (trRes.ok) {
        const allAccs = await trRes.json()
        setTreasuries(allAccs.filter((a: any) => a.type === 'treasury' || a.type === 'bank'))
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleCreateExpenseAccount = async () => {
    const name = prompt("أدخل اسم بند المصروف الجديد (مثال: كهرباء، إيجار):")
    if (!name) return
    try {
      await fetch("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, type: "expense" })
      })
      fetchAccounts()
    } catch (error) {
      console.error(error)
    }
  }

  const handleCreateExpense = async () => {
    if (!accountId || !amount) {
      alert("الرجاء تحديد بند المصروف والمبلغ")
      return
    }

    try {
      await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountId,
          amount: parseFloat(amount),
          description,
          treasuryId
        })
      })
      setShowAddModal(false)
      setAccountId("")
      setTreasuryId("")
      setAmount("")
      setDescription("")
      fetchExpenses()
    } catch (error) {
      console.error(error)
    }
  }

  // Calculate totals per category
  const totalsByCategory = expensesData.reduce((acc: any, curr: any) => {
    acc[curr.item] = (acc[curr.item] || 0) + Number(curr.amount)
    return acc
  }, {})

  const sortedCategories = Object.entries(totalsByCategory).sort((a: any, b: any) => b[1] - a[1])
  const totalExpenses = Object.values(totalsByCategory).reduce((acc: any, val: any) => acc + val, 0) as number

  return (
    <div className="space-y-6 relative">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <PieChart className="h-6 w-6 text-blue-600" />
          المصروفات
        </h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
            توزيع المصروفات (الإجمالي: {totalExpenses.toLocaleString()} ج)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
             <div className="flex flex-col md:flex-row items-center gap-12 w-full max-w-4xl mx-auto">
               <div className="relative w-48 h-48 rounded-full bg-slate-100 flex items-center justify-center shadow-inner overflow-hidden">
                 {/* CSS conic-gradient could be used here for dynamic pie chart. For simplicity, just show total */}
                 <div className="absolute inset-0 border-[16px] border-orange-500 rounded-full" style={{ clipPath: 'polygon(50% 50%, 100% 0, 100% 100%, 0 100%, 0 0)' }}></div>
                 <div className="absolute inset-2 bg-white rounded-full flex flex-col items-center justify-center">
                   <span className="text-xs text-slate-500">الإجمالي</span>
                   <span className="font-bold text-lg text-slate-900">{totalExpenses > 1000 ? (totalExpenses/1000).toFixed(1) + 'k' : totalExpenses}</span>
                 </div>
               </div>
               
               <div className="flex-1 space-y-3 w-full">
                 {sortedCategories.map(([category, amount]: any, idx) => (
                   <div key={category} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded ${idx === 0 ? 'bg-orange-500' : idx === 1 ? 'bg-blue-500' : 'bg-emerald-500'}`}></div>
                        <span className="font-bold text-slate-700">{category}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-slate-500">
                          {totalExpenses ? ((amount / totalExpenses) * 100).toFixed(1) : 0}%
                        </span>
                        <span className="font-bold text-slate-900">{amount.toLocaleString()} ج</span>
                      </div>
                   </div>
                 ))}
                 {sortedCategories.length === 0 && (
                   <div className="text-slate-500 text-center text-sm py-4">لا توجد بيانات</div>
                 )}
               </div>
             </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col md:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg">سجل المصروفات</CardTitle>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input placeholder="بحث..." className="pl-4 pr-10 h-9" />
            </div>
            <Button onClick={() => setShowAddModal(true)} className="gap-2 bg-blue-600 hover:bg-blue-700 whitespace-nowrap">
              <Plus className="h-4 w-4" /> تسجيل مصروف
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>التاريخ</TableHead>
                <TableHead>البند</TableHead>
                <TableHead>المبلغ</TableHead>
                <TableHead>البيان</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expensesData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-slate-500 py-8">لا توجد مصروفات مسجلة</TableCell>
                </TableRow>
              ) : (
                expensesData.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell className="text-slate-500 text-sm">{format(new Date(expense.date), 'yyyy-MM-dd HH:mm')}</TableCell>
                    <TableCell className="font-bold text-slate-800">
                      <span className="bg-slate-100 px-2 py-1 rounded text-sm">{expense.item}</span>
                    </TableCell>
                    <TableCell className="font-bold text-red-600">{Number(expense.amount).toLocaleString()} ج</TableCell>
                    <TableCell className="text-slate-600">{expense.statement}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-4 py-3 flex items-center justify-between text-white bg-blue-600">
              <h3 className="font-bold">تسجيل مصروف جديد</h3>
              <button onClick={() => setShowAddModal(false)} className="hover:bg-white/20 p-1 rounded">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <label className="text-xs font-medium text-slate-500 mb-1 block">بند المصروف</label>
                  <select 
                    className="w-full h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                    value={accountId}
                    onChange={e => setAccountId(e.target.value)}
                  >
                    <option value="">-- اختر البند --</option>
                    {expenseAccounts.map(acc => (
                      <option key={acc.id} value={acc.id}>{acc.name}</option>
                    ))}
                  </select>
                </div>
                <Button onClick={handleCreateExpenseAccount} variant="outline" size="icon" className="h-10 w-10 shrink-0 bg-slate-50">
                  <Plus className="h-4 w-4 text-blue-600" />
                </Button>
              </div>
              
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">المبلغ</label>
                <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="المبلغ..." />
              </div>
              
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">البيان (اختياري)</label>
                <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="وصف المصروف..." />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">دفع من (اختياري)</label>
                <select 
                  className="w-full h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                  value={treasuryId}
                  onChange={e => setTreasuryId(e.target.value)}
                >
                  <option value="">-- دفع آجل أو غير محدد --</option>
                  {treasuries.map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.name}</option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400 mt-1">إذا اخترت خزينة، سيتم إنشاء إذن صرف تلقائيًا ويخصم من رصيدها.</p>
              </div>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddModal(false)}>إلغاء</Button>
              <Button onClick={handleCreateExpense} className="bg-blue-600 hover:bg-blue-700 text-white">تسجيل المصروف</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
