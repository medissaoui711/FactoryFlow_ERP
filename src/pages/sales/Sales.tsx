import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Plus, Save, FileText, ShoppingCart, X } from "lucide-react"

export default function Sales() {
  const [clients, setClients] = useState<any[]>([])
  const [items, setItems] = useState<any[]>([])

  // Form State
  const [selectedClient, setSelectedClient] = useState("")
  const [invoiceNumber, setInvoiceNumber] = useState("")
  const [notes, setNotes] = useState("")
  const [invoiceItems, setInvoiceItems] = useState<any[]>([{ itemId: "", quantity: 0, unitPrice: 0 }])

  useEffect(() => {
    fetchClients()
    fetchItems()
  }, [])

  const fetchClients = async () => {
    try {
      const res = await fetch("/api/partners?type=client")
      if (res.ok) {
        const data = await res.json()
        setClients(data)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const fetchItems = async () => {
    try {
      const res = await fetch("/api/inventory/balance")
      if (res.ok) {
        const data = await res.json()
        setItems(data.filter((i: any) => i.type !== 'raw_material')) // Selling finished goods or strips
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleAddItem = () => {
    setInvoiceItems([...invoiceItems, { itemId: "", quantity: 0, unitPrice: 0 }])
  }

  const handleRemoveItem = (index: number) => {
    const newItems = [...invoiceItems]
    newItems.splice(index, 1)
    setInvoiceItems(newItems)
  }

  const handleItemChange = (index: number, field: string, value: string) => {
    const newItems = [...invoiceItems]
    newItems[index][field] = value
    
    // Check available balance if changing itemId or quantity
    if (field === 'itemId' || field === 'quantity') {
        const selectedItem = items.find(i => i.itemId === parseInt(newItems[index].itemId))
        if (selectedItem && field === 'quantity') {
            if (Number(value) > selectedItem.balance) {
                alert(`تحذير: الكمية المطلوبة (${value}) أكبر من الرصيد المتاح (${selectedItem.balance})`)
            }
        }
    }
    
    setInvoiceItems(newItems)
  }

  const totalAmount = invoiceItems.reduce((acc, curr) => acc + (Number(curr.quantity) * Number(curr.unitPrice) || 0), 0)

  const handleSaveInvoice = async () => {
    if (!selectedClient || invoiceItems.some(i => !i.itemId || !i.quantity || !i.unitPrice)) {
      alert("يرجى استكمال بيانات الفاتورة (العميل، والأصناف، والكميات، والأسعار).")
      return
    }

    try {
      const res = await fetch("/api/invoices/sale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          partnerId: parseInt(selectedClient),
          invoiceNumber,
          notes,
          items: invoiceItems.map(i => ({
            itemId: parseInt(i.itemId),
            quantity: Number(i.quantity),
            unitPrice: Number(i.unitPrice)
          })),
          totalAmount
        })
      })

      if (res.ok) {
        alert("تم حفظ فاتورة المبيعات بنجاح!")
        setSelectedClient("")
        setInvoiceNumber("")
        setNotes("")
        setInvoiceItems([{ itemId: "", quantity: 0, unitPrice: 0 }])
      } else {
        const error = await res.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <ShoppingCart className="h-6 w-6 text-emerald-600" />
          فاتورة مبيعات
        </h2>
      </div>

      <Card className="bg-slate-50 border-slate-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold text-slate-700">بيانات الفاتورة الأساسية</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">العميل *</label>
              <select 
                className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-600"
                value={selectedClient}
                onChange={e => setSelectedClient(e.target.value)}
              >
                <option value="">-- اختر العميل --</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">رقم الفاتورة (اختياري)</label>
              <Input value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)} placeholder="مثال: INV-2023-001" className="bg-white" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">ملاحظات</label>
              <Input value={notes} onChange={e => setNotes(e.target.value)} placeholder="ملاحظات..." className="bg-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold text-slate-700">أصناف الفاتورة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {invoiceItems.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-4 items-end">
                <div className="col-span-5 md:col-span-4 space-y-1">
                  <label className="text-xs font-medium text-slate-500">الصنف (الرصيد المتاح)</label>
                  <select 
                    className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-600"
                    value={item.itemId}
                    onChange={e => handleItemChange(index, 'itemId', e.target.value)}
                  >
                    <option value="">-- اختر الصنف --</option>
                    {items.map(i => (
                      <option key={i.itemId} value={i.itemId}>
                        {i.name} - {i.code} ({i.balance} متاح)
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-3 md:col-span-2 space-y-1">
                  <label className="text-xs font-medium text-slate-500">الكمية</label>
                  <Input 
                    type="number" 
                    value={item.quantity || ""} 
                    onChange={e => handleItemChange(index, 'quantity', e.target.value)} 
                    className="bg-white" 
                    placeholder="الكمية" 
                  />
                </div>
                <div className="col-span-3 md:col-span-2 space-y-1">
                  <label className="text-xs font-medium text-slate-500">سعر الوحدة</label>
                  <Input 
                    type="number" 
                    value={item.unitPrice || ""} 
                    onChange={e => handleItemChange(index, 'unitPrice', e.target.value)} 
                    className="bg-white" 
                    placeholder="السعر" 
                  />
                </div>
                <div className="col-span-12 md:col-span-3 space-y-1">
                  <label className="text-xs font-medium text-slate-500">الإجمالي</label>
                  <div className="h-9 flex items-center px-3 bg-slate-50 border border-slate-200 rounded-md font-bold text-slate-900">
                    {((Number(item.quantity) * Number(item.unitPrice)) || 0).toLocaleString()} ج.م
                  </div>
                </div>
                <div className="col-span-1 pb-1">
                   <Button onClick={() => handleRemoveItem(index)} variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                     <X className="h-5 w-5" />
                   </Button>
                </div>
              </div>
            ))}
            <div>
              <Button onClick={handleAddItem} variant="outline" size="sm" className="gap-1 text-emerald-600 border-emerald-200 hover:bg-emerald-50">
                <Plus className="h-4 w-4" /> إضافة صنف
              </Button>
            </div>
          </div>
          
          <div className="mt-8 flex items-center justify-between p-4 bg-slate-900 rounded-lg text-white shadow-md">
            <div className="text-lg font-bold">
              إجمالي الفاتورة: <span className="text-emerald-400 ml-2">{totalAmount.toLocaleString()} ج.م</span>
            </div>
            <Button onClick={handleSaveInvoice} className="px-8 bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md">
              حفظ وتأكيد الفاتورة
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
