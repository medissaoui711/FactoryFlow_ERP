import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Wallet, Search, ArrowDownToLine, ArrowUpFromLine, RefreshCcw, Landmark, Plus, X } from "lucide-react"
import { format } from "date-fns"

export default function Treasury() {
  const [accounts, setAccounts] = useState<any[]>([])
  const [transactions, setTransactions] = useState<any[]>([])
  const [showTransactionModal, setShowTransactionModal] = useState(false)
  const [transactionType, setTransactionType] = useState<'in' | 'out'>('in')

  // Form
  const [selectedAccountId, setSelectedAccountId] = useState("")
  const [amount, setAmount] = useState("")
  const [notes, setNotes] = useState("")

  useEffect(() => {
    fetchBalances()
    fetchTransactions()
  }, [])

  const fetchBalances = async () => {
    try {
      const res = await fetch("/api/treasury/balances")
      if (res.ok) {
        const data = await res.json()
        setAccounts(data)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const fetchTransactions = async () => {
    try {
      const res = await fetch("/api/treasury/transactions")
      if (res.ok) {
        const data = await res.json()
        setTransactions(data)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleCreateAccount = async () => {
    const name = prompt("أدخل اسم الخزينة الجديدة:")
    if (!name) return
    try {
      await fetch("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, type: "treasury" })
      })
      fetchBalances()
    } catch (error) {
      console.error(error)
    }
  }

  const handleSubmitTransaction = async () => {
    if (!selectedAccountId || !amount) return
    try {
      await fetch("/api/treasury/transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountId: parseInt(selectedAccountId),
          type: transactionType,
          amount: parseFloat(amount),
          notes
        })
      })
      setShowTransactionModal(false)
      setSelectedAccountId("")
      setAmount("")
      setNotes("")
      fetchBalances()
      fetchTransactions()
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="space-y-6 relative">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Landmark className="h-6 w-6 text-blue-600" />
          الخزينة والبنوك
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleCreateAccount} className="gap-2 text-slate-700 bg-white hover:bg-slate-50 border-slate-200">
            <Plus className="h-4 w-4" /> إضافة خزينة
          </Button>
          <Button onClick={() => { setTransactionType('in'); setShowTransactionModal(true); }} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
            <ArrowDownToLine className="h-4 w-4" /> إذن استلام
          </Button>
          <Button onClick={() => { setTransactionType('out'); setShowTransactionModal(true); }} className="gap-2 bg-red-600 hover:bg-red-700 text-white">
            <ArrowUpFromLine className="h-4 w-4" /> إذن صرف نقدية
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {accounts.map((acc, idx) => (
          <Card key={acc.accountId} className="bg-gradient-to-br from-slate-800 to-slate-900 text-white border-slate-700">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-slate-400 text-sm mb-1">{acc.name}</p>
                  <div className={`text-4xl font-bold ${Number(acc.balance) < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                    {Number(acc.balance).toLocaleString()} <span className="text-lg font-normal text-slate-300">ج</span>
                  </div>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  {acc.type === 'bank' ? <Landmark className="h-6 w-6 text-slate-300" /> : <Wallet className="h-6 w-6 text-slate-300" />}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {accounts.length === 0 && (
          <div className="col-span-2 text-center text-slate-500 py-8 bg-slate-50 rounded-lg border border-slate-200 border-dashed">
            لا توجد خزائن. قم بإضافة خزينة أولاً.
          </div>
        )}
      </div>

      <Card>
        <CardHeader className="flex flex-col md:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <CardTitle className="flex items-center gap-2 text-lg">
            <RefreshCcw className="h-5 w-5 text-slate-500" />
            حركة الخزينة
          </CardTitle>
          <div className="relative w-full md:w-64">
            <Search className="absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input placeholder="بحث في الحركات..." className="pl-4 pr-10 h-9" />
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>التاريخ</TableHead>
                <TableHead>النوع</TableHead>
                <TableHead>الخزينة</TableHead>
                <TableHead>المبلغ</TableHead>
                <TableHead>البيان</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-slate-500 py-8">
                    لا توجد حركات مسجلة
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((t) => {
                  const isDebit = Number(t.debit) > 0;
                  const displayAmount = isDebit ? Number(t.debit) : Number(t.credit);
                  const typeLabel = isDebit ? "استلام" : "صرف";
                  const amountColor = isDebit ? "text-emerald-600" : "text-red-600";
                  const typeColor = isDebit ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-red-50 text-red-600 border-red-200";

                  return (
                    <TableRow key={t.id}>
                      <TableCell className="text-slate-500 text-sm">
                        {format(new Date(t.date), "yyyy-MM-dd HH:mm")}
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-md text-xs border ${typeColor}`}>
                          {typeLabel}
                        </span>
                      </TableCell>
                      <TableCell className="text-slate-600">{t.accountName}</TableCell>
                      <TableCell className={`font-bold ${amountColor}`} dir="ltr">
                        {displayAmount.toLocaleString()} ج {isDebit ? '+' : '-'}
                      </TableCell>
                      <TableCell className="text-slate-700 text-sm">{t.statement}</TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Transaction Modal */}
      {showTransactionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className={`px-4 py-3 flex items-center justify-between text-white ${transactionType === 'in' ? 'bg-emerald-600' : 'bg-red-600'}`}>
              <h3 className="font-bold">
                {transactionType === 'in' ? 'إذن استلام نقدية' : 'إذن صرف نقدية'}
              </h3>
              <button onClick={() => setShowTransactionModal(false)} className="hover:bg-white/20 p-1 rounded">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">الخزينة</label>
                <select 
                  className="w-full h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                  value={selectedAccountId}
                  onChange={e => setSelectedAccountId(e.target.value)}
                >
                  <option value="">-- اختر الخزينة --</option>
                  {accounts.map(acc => (
                    <option key={acc.accountId} value={acc.accountId}>{acc.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">المبلغ</label>
                <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="المبلغ بالجنيه..." />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">البيان / ملاحظات</label>
                <Input value={notes} onChange={e => setNotes(e.target.value)} placeholder="وصف الحركة..." />
              </div>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowTransactionModal(false)}>إلغاء</Button>
              <Button onClick={handleSubmitTransaction} className={transactionType === 'in' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-red-600 hover:bg-red-700 text-white'}>
                تأكيد العملية
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
