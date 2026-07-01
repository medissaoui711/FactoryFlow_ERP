import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, FileText, CalendarDays, Plus, X } from "lucide-react"
import { format } from "date-fns"

export default function Checks() {
  const [checksData, setChecksData] = useState<any[]>([])
  const [partners, setPartners] = useState<any[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [filterType, setFilterType] = useState<string>("all")
  
  // Form State
  const [type, setType] = useState<string>("receivable")
  const [checkNumber, setCheckNumber] = useState("")
  const [bankName, setBankName] = useState("")
  const [amount, setAmount] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [partnerId, setPartnerId] = useState("")

  useEffect(() => {
    fetchChecks()
    fetchPartners()
  }, [])

  const fetchChecks = async () => {
    try {
      const res = await fetch("/api/checks")
      if (res.ok) {
        const data = await res.json()
        setChecksData(data)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const fetchPartners = async () => {
    try {
      const res = await fetch("/api/partners")
      if (res.ok) {
        const data = await res.json()
        setPartners(data)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleCreateCheck = async () => {
    if (!checkNumber || !bankName || !amount || !dueDate) {
      alert("الرجاء استكمال بيانات الشيك")
      return
    }

    try {
      await fetch("/api/checks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          checkNumber,
          bankName,
          amount: parseFloat(amount),
          dueDate,
          partnerId,
          status: 'in_drawer'
        })
      })
      setShowAddModal(false)
      fetchChecks()
    } catch (error) {
      console.error(error)
    }
  }

  const handleUpdateStatus = async (id: number, newStatus: string) => {
    try {
      await fetch(`/api/checks/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      })
      fetchChecks()
    } catch (error) {
      console.error(error)
    }
  }

  const filteredChecks = filterType === 'all' 
    ? checksData 
    : checksData.filter(c => c.status === filterType)

  return (
    <div className="space-y-6 relative">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <FileText className="h-6 w-6 text-blue-600" />
          الشيكات (أوراق القبض والدفع)
        </h2>
        <Button onClick={() => setShowAddModal(true)} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="h-4 w-4" /> إضافة شيك
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-col md:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex gap-2 bg-slate-100 p-1 rounded-lg">
             <button onClick={() => setFilterType('all')} className={`px-4 py-1.5 text-sm font-bold rounded-md shadow-sm ${filterType === 'all' ? 'bg-white text-blue-600' : 'text-slate-600'}`}>الكل</button>
             <button onClick={() => setFilterType('in_drawer')} className={`px-4 py-1.5 text-sm font-bold rounded-md shadow-sm ${filterType === 'in_drawer' ? 'bg-white text-blue-600' : 'text-slate-600'}`}>في الدرج</button>
             <button onClick={() => setFilterType('under_collection')} className={`px-4 py-1.5 text-sm font-bold rounded-md shadow-sm ${filterType === 'under_collection' ? 'bg-white text-blue-600' : 'text-slate-600'}`}>تحت التحصيل</button>
             <button onClick={() => setFilterType('collected')} className={`px-4 py-1.5 text-sm font-bold rounded-md shadow-sm ${filterType === 'collected' ? 'bg-white text-blue-600' : 'text-slate-600'}`}>محصل</button>
             <button onClick={() => setFilterType('returned')} className={`px-4 py-1.5 text-sm font-bold rounded-md shadow-sm ${filterType === 'returned' ? 'bg-white text-blue-600' : 'text-slate-600'}`}>مرتد</button>
          </div>
          <div className="relative w-full md:w-64">
            <Search className="absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input placeholder="بحث برقم الشيك أو العميل..." className="pl-4 pr-10 h-9" />
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>رقم الشيك</TableHead>
                <TableHead>الجهة</TableHead>
                <TableHead>البنك</TableHead>
                <TableHead>المبلغ</TableHead>
                <TableHead>تاريخ الاستحقاق</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredChecks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-slate-500 py-8">لا توجد شيكات</TableCell>
                </TableRow>
              ) : (
                filteredChecks.map((item, i) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] border ${item.type === 'receivable' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                          {item.type === 'receivable' ? 'قبض' : 'دفع'}
                        </span>
                        <span className="font-medium text-slate-900">{item.checkNumber}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-700">{item.partnerName || '-'}</TableCell>
                    <TableCell className="text-slate-600">{item.bankName}</TableCell>
                    <TableCell className="font-bold text-slate-900">{Number(item.amount).toLocaleString()} ج</TableCell>
                    <TableCell className="text-slate-500">{format(new Date(item.dueDate), 'yyyy-MM-dd')}</TableCell>
                    <TableCell>
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                        {item.status === 'in_drawer' ? 'في الدرج' : 
                         item.status === 'under_collection' ? 'تحت التحصيل' :
                         item.status === 'collected' ? 'تم التحصيل' : 'مرتد'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {item.status === 'in_drawer' && (
                          <Button size="sm" onClick={() => handleUpdateStatus(item.id, 'under_collection')} className="bg-blue-600 hover:bg-blue-700 text-xs text-white">إرسال للتحصيل</Button>
                        )}
                        {item.status === 'under_collection' && (
                          <>
                            <Button size="sm" onClick={() => handleUpdateStatus(item.id, 'collected')} className="bg-emerald-600 hover:bg-emerald-700 text-xs text-white">تحصيل</Button>
                            <Button size="sm" onClick={() => handleUpdateStatus(item.id, 'returned')} className="bg-red-600 hover:bg-red-700 text-xs text-white">إرتداد</Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Check Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-4 py-3 flex items-center justify-between text-white bg-blue-600">
              <h3 className="font-bold">إضافة شيك جديد</h3>
              <button onClick={() => setShowAddModal(false)} className="hover:bg-white/20 p-1 rounded">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">نوع الشيك</label>
                <select 
                  className="w-full h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                  value={type}
                  onChange={e => setType(e.target.value)}
                >
                  <option value="receivable">ورقة قبض (مستلم من عميل)</option>
                  <option value="payable">ورقة دفع (مصدر لمورد)</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1 block">رقم الشيك</label>
                  <Input value={checkNumber} onChange={e => setCheckNumber(e.target.value)} placeholder="رقم الشيك..." />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1 block">البنك الساحب/المسحوب عليه</label>
                  <Input value={bankName} onChange={e => setBankName(e.target.value)} placeholder="اسم البنك..." />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1 block">المبلغ</label>
                  <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="المبلغ..." />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1 block">تاريخ الاستحقاق</label>
                  <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">
                  {type === 'receivable' ? 'العميل المستلم منه' : 'المورد المستفيد'}
                </label>
                <select 
                  className="w-full h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                  value={partnerId}
                  onChange={e => setPartnerId(e.target.value)}
                >
                  <option value="">-- اختر --</option>
                  {partners.filter(p => type === 'receivable' ? p.type === 'client' : p.type === 'supplier').map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddModal(false)}>إلغاء</Button>
              <Button onClick={handleCreateCheck} className="bg-blue-600 hover:bg-blue-700 text-white">حفظ الشيك</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
