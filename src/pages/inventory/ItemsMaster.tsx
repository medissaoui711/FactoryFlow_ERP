import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Plus, Save, Package } from "lucide-react"

export default function ItemsMaster() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // New Item State
  const [code, setCode] = useState("")
  const [name, setName] = useState("")
  const [type, setType] = useState("raw_material") // raw_material, strip_roll, pipe
  const [thickness, setThickness] = useState("")
  const [size, setSize] = useState("")
  
  // Opening Balance State
  const [openingBalances, setOpeningBalances] = useState<Record<number, string>>({})
  const [openingBalanceUnits, setOpeningBalanceUnits] = useState<Record<number, string>>({})

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    try {
      const res = await fetch("/api/inventory/balance")
      if (res.ok) {
        const data = await res.json()
        setItems(data)
      }
    } catch (error) {
      console.error("Error fetching items:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateItem = async () => {
    if (!code || !name) return;
    try {
      const res = await fetch("/api/items", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ code, name, type, thickness: thickness || null, size: size || null })
      })
      if (res.ok) {
        setCode("")
        setName("")
        setThickness("")
        setSize("")
        fetchItems()
      }
    } catch (error) {
      console.error("Error creating item:", error)
    }
  }

  const handleSaveOpeningBalance = async (itemId: number) => {
    const qty = openingBalances[itemId]
    const unit = openingBalanceUnits[itemId] || (items.find(i => i.itemId === itemId)?.type === 'pipe' ? 'pipes' : 'tons')
    if (!qty || isNaN(Number(qty))) return;

    try {
      const res = await fetch("/api/inventory/opening-balance", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ 
          itemId, 
          quantity: Number(qty),
          unit,
          notes: "رصيد افتتاحي"
        })
      })
      if (res.ok) {
        setOpeningBalances(prev => ({ ...prev, [itemId]: "" }))
        fetchItems()
      }
    } catch (error) {
      console.error("Error saving opening balance:", error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Package className="h-6 w-6 text-blue-600" />
          تكويد الأصناف والرصيد الافتتاحي
        </h2>
      </div>

      <Card className="bg-slate-50 border-slate-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold text-slate-700">إضافة صنف جديد</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">الكود *</label>
              <Input value={code} onChange={e => setCode(e.target.value)} placeholder="مثال: RM-001" className="bg-white" />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-medium text-slate-500 mb-1 block">الاسم *</label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="مثال: صاج مجلفن" className="bg-white" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">النوع</label>
              <select 
                value={type} 
                onChange={e => setType(e.target.value)}
                className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-600"
              >
                <option value="raw_material">خام (لفائف)</option>
                <option value="strip_roll">شرائح مقطعة</option>
                <option value="pipe">مواسير (منتج تام)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">المقاس</label>
              <Input value={size} onChange={e => setSize(e.target.value)} placeholder="25mm" className="bg-white" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">السمك</label>
              <div className="flex gap-2">
                <Input value={thickness} onChange={e => setThickness(e.target.value)} placeholder="1.2" className="bg-white" />
                <Button onClick={handleCreateItem} className="bg-blue-600 hover:bg-blue-700 shrink-0">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="relative w-full md:w-64">
            <Search className="absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input placeholder="بحث برقم أو اسم الصنف..." className="pl-4 pr-10 h-9" />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-slate-500">جاري التحميل...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الكود</TableHead>
                  <TableHead>الاسم</TableHead>
                  <TableHead>النوع</TableHead>
                  <TableHead>المقاس / السمك</TableHead>
                  <TableHead>الرصيد الحالي</TableHead>
                  <TableHead>إضافة رصيد افتتاحي</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-slate-500">لا توجد أصناف مسجلة بعد</TableCell>
                  </TableRow>
                ) : items.map((item, i) => (
                  <TableRow key={item.itemId || i}>
                    <TableCell className="font-medium text-slate-900">{item.code}</TableCell>
                    <TableCell className="font-bold">{item.name}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded-full text-xs bg-slate-100 text-slate-700">
                        {item.type === 'raw_material' ? 'خام' : item.type === 'strip_roll' ? 'شرائح' : 'مواسير'}
                      </span>
                    </TableCell>
                    <TableCell className="text-slate-500 text-sm">
                      {[item.size, item.thickness ? item.thickness + 'مم' : ''].filter(Boolean).join(" / ") || "-"}
                    </TableCell>
                    <TableCell>
                      <div className="font-bold text-blue-600">
                        {Number(item.balance || 0).toLocaleString()} <span className="text-xs font-normal text-slate-500">{item.unit || (item.type === 'pipe' ? 'مواسير' : 'طن')}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 max-w-[200px]">
                        <Input 
                          placeholder="الكمية" 
                          className="h-8 w-20" 
                          value={openingBalances[item.itemId] || ""}
                          onChange={e => setOpeningBalances(prev => ({...prev, [item.itemId]: e.target.value}))}
                        />
                        <select 
                          className="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs"
                          value={openingBalanceUnits[item.itemId] || (item.type === 'pipe' ? 'pipes' : 'tons')}
                          onChange={e => setOpeningBalanceUnits(prev => ({...prev, [item.itemId]: e.target.value}))}
                        >
                          <option value="tons">طن</option>
                          <option value="pipes">مواسير</option>
                          <option value="kg">كجم</option>
                        </select>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-8 bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100 hover:text-emerald-700"
                          onClick={() => handleSaveOpeningBalance(item.itemId)}
                          disabled={!openingBalances[item.itemId]}
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
