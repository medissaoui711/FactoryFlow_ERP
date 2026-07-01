import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, BookOpen, Plus, X } from "lucide-react"
import { format } from "date-fns"

export default function Journal() {
  const [entries, setEntries] = useState<any[]>([])
  const [accounts, setAccounts] = useState<any[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [search, setSearch] = useState("")

  // Form
  const [description, setDescription] = useState("")
  const [lines, setLines] = useState([{ accountId: "", debit: "", credit: "" }, { accountId: "", debit: "", credit: "" }])

  useEffect(() => {
    fetchEntries()
    fetchAccounts()
  }, [])

  const fetchEntries = async () => {
    try {
      const res = await fetch("/api/journal")
      if (res.ok) setEntries(await res.json())
    } catch (error) {
      console.error(error)
    }
  }

  const fetchAccounts = async () => {
    try {
      const res = await fetch("/api/accounts")
      if (res.ok) setAccounts(await res.json())
    } catch (error) {
      console.error(error)
    }
  }

  const handleAddLine = () => {
    setLines([...lines, { accountId: "", debit: "", credit: "" }])
  }

  const handleUpdateLine = (index: number, field: string, value: string) => {
    const newLines = [...lines]
    newLines[index] = { ...newLines[index], [field]: value }
    
    // Auto-clear opposite field if one is entered
    if (field === 'debit' && value !== "") newLines[index].credit = ""
    if (field === 'credit' && value !== "") newLines[index].debit = ""
    
    setLines(newLines)
  }

  const handleRemoveLine = (index: number) => {
    if (lines.length <= 2) return
    const newLines = lines.filter((_, i) => i !== index)
    setLines(newLines)
  }

  const handleCreateEntry = async () => {
    // Validate
    const totalDebit = lines.reduce((sum, line) => sum + (parseFloat(line.debit) || 0), 0)
    const totalCredit = lines.reduce((sum, line) => sum + (parseFloat(line.credit) || 0), 0)

    if (totalDebit !== totalCredit || totalDebit === 0) {
      alert("يجب أن يتساوى إجمالي المدين مع إجمالي الدائن")
      return
    }

    const validLines = lines.filter(l => l.accountId && (l.debit || l.credit))
    if (validLines.length < 2) {
      alert("الرجاء إدخال طرفي القيد (حسابين على الأقل)")
      return
    }

    try {
      await fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description,
          lines: validLines.map(l => ({
            accountId: l.accountId,
            debit: l.debit || "0",
            credit: l.credit || "0"
          }))
        })
      })
      setShowAddModal(false)
      setDescription("")
      setLines([{ accountId: "", debit: "", credit: "" }, { accountId: "", debit: "", credit: "" }])
      fetchEntries()
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="space-y-6 relative">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-blue-600" />
          دفتر اليومية (قيود التسوية)
        </h2>
        <Button onClick={() => setShowAddModal(true)} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="h-4 w-4" /> قيد يومية جديد
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-col md:flex-row items-center justify-between gap-4 pb-4">
          <CardTitle className="text-lg">سجل القيود</CardTitle>
          <div className="relative w-full md:w-64">
            <Search className="absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="بحث بالبيان أو المرجع..." 
              className="pl-4 pr-10 h-9" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {entries.filter(e => !search || e.description?.includes(search) || e.id.toString().includes(search)).map((entry) => (
              <div key={entry.id} className="border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                <div className="bg-slate-50 px-4 py-3 flex items-center justify-between border-b border-slate-200">
                   <div className="flex items-center gap-4">
                     <span className="font-bold text-slate-800">قيد رقم: #{entry.id}</span>
                     <span className="text-sm text-slate-500">{format(new Date(entry.date), 'yyyy-MM-dd HH:mm')}</span>
                     {entry.referenceType && (
                       <span className="px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-700 font-medium">
                         منشأ آلياً ({entry.referenceType})
                       </span>
                     )}
                   </div>
                   <div className="text-slate-700 text-sm font-medium">{entry.description}</div>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/50">
                      <TableHead className="w-1/2">الحساب</TableHead>
                      <TableHead className="w-1/4 text-right">مدين (ج)</TableHead>
                      <TableHead className="w-1/4 text-right">دائن (ج)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {entry.lines.map((line: any, idx: number) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium text-slate-700">{line.accountName}</TableCell>
                        <TableCell className="text-right text-emerald-600 font-bold">{Number(line.debit) > 0 ? Number(line.debit).toLocaleString() : '-'}</TableCell>
                        <TableCell className="text-right text-red-600 font-bold">{Number(line.credit) > 0 ? Number(line.credit).toLocaleString() : '-'}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-slate-50 font-bold">
                       <TableCell className="text-left text-slate-700">الإجمالي</TableCell>
                       <TableCell className="text-right text-slate-900">
                         {entry.lines.reduce((s: number, l: any) => s + Number(l.debit), 0).toLocaleString()}
                       </TableCell>
                       <TableCell className="text-right text-slate-900">
                         {entry.lines.reduce((s: number, l: any) => s + Number(l.credit), 0).toLocaleString()}
                       </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            ))}
            {entries.length === 0 && (
              <div className="text-center text-slate-500 py-12">لا توجد قيود يومية</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add Journal Entry Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-4 py-3 flex items-center justify-between text-white bg-blue-600 shrink-0">
              <h3 className="font-bold">إنشاء قيد يومية يدوي (تسوية)</h3>
              <button onClick={() => setShowAddModal(false)} className="hover:bg-white/20 p-1 rounded">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">بيان القيد</label>
                <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="شرح مبسط لسبب القيد..." />
              </div>
              
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead>الحساب</TableHead>
                      <TableHead>مدين</TableHead>
                      <TableHead>دائن</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lines.map((line, idx) => (
                      <TableRow key={idx}>
                        <TableCell>
                          <select 
                            className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-sm"
                            value={line.accountId}
                            onChange={e => handleUpdateLine(idx, 'accountId', e.target.value)}
                          >
                            <option value="">-- اختر الحساب --</option>
                            {accounts.map(acc => (
                              <option key={acc.id} value={acc.id}>{acc.name} ({acc.type})</option>
                            ))}
                          </select>
                        </TableCell>
                        <TableCell>
                          <Input 
                            type="number" 
                            className="h-9 font-mono" 
                            value={line.debit} 
                            onChange={e => handleUpdateLine(idx, 'debit', e.target.value)} 
                            disabled={Number(line.credit) > 0}
                          />
                        </TableCell>
                        <TableCell>
                          <Input 
                            type="number" 
                            className="h-9 font-mono" 
                            value={line.credit} 
                            onChange={e => handleUpdateLine(idx, 'credit', e.target.value)} 
                            disabled={Number(line.debit) > 0}
                          />
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" onClick={() => handleRemoveLine(idx)} disabled={lines.length <= 2} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                            <X className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="p-2 border-t border-slate-200 bg-slate-50">
                  <Button variant="outline" size="sm" onClick={handleAddLine} className="w-full border-dashed">
                    <Plus className="h-4 w-4 ml-2" /> إضافة سطر
                  </Button>
                </div>
                <div className="p-3 bg-slate-100 border-t border-slate-200 flex justify-between items-center font-bold">
                  <span>الإجمالي</span>
                  <div className="flex gap-8 px-4">
                     <span className={`w-32 text-right ${lines.reduce((s, l) => s + (parseFloat(l.debit)||0), 0) === lines.reduce((s, l) => s + (parseFloat(l.credit)||0), 0) ? 'text-emerald-600' : 'text-red-600'}`}>
                       مدين: {lines.reduce((s, l) => s + (parseFloat(l.debit)||0), 0).toLocaleString()}
                     </span>
                     <span className={`w-32 text-right ${lines.reduce((s, l) => s + (parseFloat(l.debit)||0), 0) === lines.reduce((s, l) => s + (parseFloat(l.credit)||0), 0) ? 'text-emerald-600' : 'text-red-600'}`}>
                       دائن: {lines.reduce((s, l) => s + (parseFloat(l.credit)||0), 0).toLocaleString()}
                     </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2 shrink-0">
              <Button variant="outline" onClick={() => setShowAddModal(false)}>إلغاء</Button>
              <Button onClick={handleCreateEntry} className="bg-blue-600 hover:bg-blue-700 text-white">حفظ القيد</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
