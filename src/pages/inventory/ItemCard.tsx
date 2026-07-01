import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, FileText, Printer, ArrowDownRight, ArrowUpRight, Minus } from "lucide-react"
import { format } from "date-fns"

export default function ItemCard() {
  const [items, setItems] = useState<any[]>([])
  const [selectedItemId, setSelectedItemId] = useState<string>("")
  const [ledger, setLedger] = useState<any>(null)
  const [loading, setLoading] = useState(false)

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
    }
  }

  useEffect(() => {
    if (selectedItemId) {
      fetchLedger(selectedItemId)
    } else {
      setLedger(null)
    }
  }, [selectedItemId])

  const fetchLedger = async (id: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/inventory/items/${id}/ledger`)
      if (res.ok) {
        const data = await res.json()
        setLedger(data)
      }
    } catch (error) {
      console.error("Error fetching ledger:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <FileText className="h-6 w-6 text-blue-600" />
          كارت حركة الصنف
        </h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 gap-2">
            <FileText className="h-4 w-4" /> PDF
          </Button>
          <Button variant="outline" className="gap-2">
            <Printer className="h-4 w-4" /> طباعة
          </Button>
        </div>
      </div>

      <Card className="bg-slate-50 border-slate-200">
        <CardContent className="pt-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">اختر الصنف لعرض حركته:</label>
            <select 
              className="w-full md:w-96 h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
              value={selectedItemId}
              onChange={e => setSelectedItemId(e.target.value)}
            >
              <option value="">-- اختر الصنف --</option>
              {items.map(item => (
                <option key={item.itemId} value={item.itemId}>
                  {item.name} - {item.code}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {ledger && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-blue-100 bg-blue-50/50">
              <CardContent className="p-4">
                <div className="text-xs text-slate-500 mb-1">اسم الصنف</div>
                <div className="font-bold text-lg text-slate-900">{ledger.item.name}</div>
                <div className="text-xs text-slate-500 mt-1">{ledger.item.code}</div>
              </CardContent>
            </Card>
            <Card className="border-slate-200 bg-slate-50/50">
              <CardContent className="p-4">
                <div className="text-xs text-slate-500 mb-1">النوع</div>
                <div className="font-bold text-slate-900">
                  {ledger.item.type === 'raw_material' ? 'خام' : ledger.item.type === 'strip_roll' ? 'شرائح' : 'مواسير'}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {[ledger.item.size, ledger.item.thickness ? ledger.item.thickness + 'مم' : ''].filter(Boolean).join(" / ") || "-"}
                </div>
              </CardContent>
            </Card>
            <Card className="border-emerald-100 bg-emerald-50/50 md:col-span-2">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <div className="text-xs text-emerald-600 mb-1 font-medium">الرصيد الحالي</div>
                  <div className="font-bold text-2xl text-emerald-700">
                    {Number(ledger.item.balance).toLocaleString()} <span className="text-sm font-normal text-emerald-600">{ledger.item.unit}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-col md:flex-row items-center justify-between gap-4 pb-4">
              <div className="relative w-full md:w-96">
                <Search className="absolute right-3 top-2.5 h-4 w-4 text-slate-500" />
                <Input placeholder="بحث في الحركات..." className="pl-4 pr-10" />
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-slate-500">جاري التحميل...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>التاريخ</TableHead>
                      <TableHead>نوع الحركة</TableHead>
                      <TableHead>الملاحظات</TableHead>
                      <TableHead className="text-right">وارد</TableHead>
                      <TableHead className="text-right">منصرف</TableHead>
                      <TableHead className="text-right">الرصيد التراكمي</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(() => {
                      // Calculate running balance from bottom to top
                      let currentBal = 0;
                      const reversed = [...ledger.transactions].reverse();
                      const withBalance = reversed.map(t => {
                        const qChange = parseFloat(t.quantityChange);
                        currentBal += qChange;
                        return { ...t, qChange, currentBal };
                      }).reverse();

                      if (withBalance.length === 0) {
                        return (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8 text-slate-500">لا توجد حركات لهذا الصنف</TableCell>
                          </TableRow>
                        )
                      }

                      return withBalance.map((t: any, i: number) => {
                        const isPositive = t.qChange > 0;
                        const isNegative = t.qChange < 0;
                        return (
                          <TableRow key={t.id}>
                            <TableCell className="text-slate-500 text-sm">
                              {format(new Date(t.createdAt), "yyyy-MM-dd HH:mm")}
                            </TableCell>
                            <TableCell>
                              <span className="px-2 py-1 rounded text-xs bg-slate-100 text-slate-700">
                                {t.referenceType === 'opening_balance' ? 'رصيد افتتاحي' : 
                                 t.referenceType === 'production_order_input' ? 'صرف للتشغيل' :
                                 t.referenceType === 'production_order_output' ? 'إضافة من التشغيل' : t.referenceType}
                              </span>
                              {t.referenceId && <span className="text-xs text-blue-500 ml-2">#{t.referenceId}</span>}
                            </TableCell>
                            <TableCell className="text-slate-600 text-sm">{t.notes}</TableCell>
                            <TableCell className="text-right font-medium text-emerald-600">
                              {isPositive ? (
                                <div className="flex items-center justify-end gap-1">
                                  {t.qChange.toLocaleString()} <ArrowUpRight className="h-3 w-3" />
                                </div>
                              ) : <Minus className="h-3 w-3 text-slate-300 mx-auto" />}
                            </TableCell>
                            <TableCell className="text-right font-medium text-red-500">
                              {isNegative ? (
                                <div className="flex items-center justify-end gap-1">
                                  {Math.abs(t.qChange).toLocaleString()} <ArrowDownRight className="h-3 w-3" />
                                </div>
                              ) : <Minus className="h-3 w-3 text-slate-300 mx-auto" />}
                            </TableCell>
                            <TableCell className="text-right font-bold text-slate-900 bg-slate-50/50">
                              {t.currentBal.toLocaleString()}
                            </TableCell>
                          </TableRow>
                        )
                      })
                    })()}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
