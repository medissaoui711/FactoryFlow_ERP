import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Plus, Save, ShoppingCart, X, Check, FileText, PackageCheck } from "lucide-react"
import { useTranslation } from "react-i18next"

export default function PurchaseOrders() {
  const { t } = useTranslation()
  const [orders, setOrders] = useState<any[]>([])
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [items, setItems] = useState<any[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const [user, setUser] = useState<any>(null)
  
  // New PO State
  const [selectedSupplier, setSelectedSupplier] = useState("")
  const [orderNumber, setOrderNumber] = useState("")
  const [notes, setNotes] = useState("")
  const [orderItems, setOrderItems] = useState<any[]>([{ itemId: "", quantity: 0, unitPrice: 0 }])

  useEffect(() => {
    fetchOrders()
    fetchSuppliers()
    fetchItems()
    fetchUser()
  }, [])

  const fetchUser = async () => {
    try {
      const res = await fetch("/api/auth/me")
      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
      }
    } catch (e) {}
  }

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/purchase-orders")
      if (res.ok) {
        const data = await res.json()
        setOrders(data)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const fetchSuppliers = async () => {
    try {
      const res = await fetch("/api/partners?type=supplier")
      if (res.ok) {
        const data = await res.json()
        setSuppliers(data)
      }
    } catch (error) {}
  }

  const fetchItems = async () => {
    try {
      const res = await fetch("/api/inventory/balance")
      if (res.ok) {
        const data = await res.json()
        setItems(data.filter((i: any) => i.type === 'raw_material' || i.type === 'finished_good'))
      }
    } catch (error) {}
  }

  const handleAddItem = () => {
    setOrderItems([...orderItems, { itemId: "", quantity: 0, unitPrice: 0 }])
  }

  const handleRemoveItem = (index: number) => {
    const newItems = [...orderItems]
    newItems.splice(index, 1)
    setOrderItems(newItems)
  }

  const handleItemChange = (index: number, field: string, value: string) => {
    const newItems = [...orderItems]
    newItems[index][field] = value
    setOrderItems(newItems)
  }

  const totalAmount = orderItems.reduce((acc, curr) => acc + (Number(curr.quantity) * Number(curr.unitPrice) || 0), 0)

  const handleSaveOrder = async () => {
    if (!selectedSupplier || orderItems.some(i => !i.itemId || !i.quantity || !i.unitPrice)) {
      alert("Please complete the form properly.")
      return
    }

    try {
      const res = await fetch("/api/purchase-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          partnerId: parseInt(selectedSupplier),
          orderNumber,
          notes,
          items: orderItems.map(i => ({
            itemId: parseInt(i.itemId),
            quantity: Number(i.quantity),
            unitPrice: Number(i.unitPrice)
          })),
          totalAmount
        })
      })

      if (res.ok) {
        setIsCreating(false)
        fetchOrders()
        // Reset form
        setSelectedSupplier("")
        setOrderNumber("")
        setNotes("")
        setOrderItems([{ itemId: "", quantity: 0, unitPrice: 0 }])
      } else {
        const err = await res.json()
        alert(err.error)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleApprove = async (id: number) => {
    try {
      const res = await fetch(`/api/purchase-orders/${id}/approve`, { method: "POST" })
      if (res.ok) fetchOrders()
    } catch (e) {}
  }

  const handleReceive = async (order: any) => {
    try {
      // In a real app, you would open a modal to confirm received quantities.
      // Here we assume full receipt for simplicity if approved.
      const res = await fetch(`/api/purchase-orders/${order.id}`)
      if (res.ok) {
        const orderDetails = await res.json()
        const receiveItems = orderDetails.lines.map((l: any) => ({
          lineId: l.id,
          quantity: Number(l.quantity) - Number(l.received_quantity)
        })).filter((l: any) => l.quantity > 0)

        if (receiveItems.length === 0) return

        const recvRes = await fetch(`/api/purchase-orders/${order.id}/receive`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: receiveItems })
        })
        if (recvRes.ok) fetchOrders()
      }
    } catch (e) {}
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending_approval': return <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-full">Pending</span>;
      case 'approved': return <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">Approved</span>;
      case 'received': return <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full">Received</span>;
      default: return <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded-full">{status}</span>;
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <ShoppingCart className="h-6 w-6 text-blue-600" />
          {t("purchaseOrders")}
        </h2>
        {!isCreating ? (
          <Button onClick={() => setIsCreating(true)} className="gap-2 bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4" /> {t("newOrder")}
          </Button>
        ) : (
          <Button onClick={() => setIsCreating(false)} variant="outline">
            {t("cancel")}
          </Button>
        )}
      </div>

      {isCreating ? (
        <Card className="bg-slate-50 border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg text-slate-700">{t("newOrderDetails")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">{t("supplier")} *</label>
                <select 
                  className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-sm focus-visible:outline-none"
                  value={selectedSupplier}
                  onChange={e => setSelectedSupplier(e.target.value)}
                >
                  <option value="">-- Select --</option>
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">PO Number</label>
                <Input value={orderNumber} onChange={e => setOrderNumber(e.target.value)} placeholder="Auto-generated if empty" className="bg-white" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">{t("notes")}</label>
                <Input value={notes} onChange={e => setNotes(e.target.value)} placeholder="..." className="bg-white" />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-slate-700 border-b pb-2">Items</h4>
              {orderItems.map((item, index) => (
                <div key={index} className="flex gap-4 items-end">
                  <div className="flex-1">
                    <select 
                      className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 text-sm focus-visible:outline-none"
                      value={item.itemId}
                      onChange={e => handleItemChange(index, 'itemId', e.target.value)}
                    >
                      <option value="">-- Item --</option>
                      {items.map(i => (
                        <option key={i.itemId} value={i.itemId}>
                          {i.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="w-24">
                    <Input type="number" placeholder="Qty" value={item.quantity || ""} onChange={e => handleItemChange(index, 'quantity', e.target.value)} />
                  </div>
                  <div className="w-28">
                    <Input type="number" placeholder="Price" value={item.unitPrice || ""} onChange={e => handleItemChange(index, 'unitPrice', e.target.value)} />
                  </div>
                  <div className="w-32 h-9 flex items-center px-3 bg-slate-100 rounded-md text-sm font-bold">
                    {((Number(item.quantity) * Number(item.unitPrice)) || 0).toLocaleString()}
                  </div>
                  <Button onClick={() => handleRemoveItem(index)} variant="ghost" size="icon" className="text-red-500">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button onClick={handleAddItem} variant="outline" size="sm" className="gap-1 mt-2">
                <Plus className="h-4 w-4" /> Add Item
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-100 rounded-lg">
              <div className="text-lg font-bold">Total: {totalAmount.toLocaleString()}</div>
              <Button onClick={handleSaveOrder} className="bg-blue-600 hover:bg-blue-700 text-white">Save Draft Order</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
                  <tr>
                    <th className="px-6 py-4 font-medium">Order Number</th>
                    <th className="px-6 py-4 font-medium">Supplier</th>
                    <th className="px-6 py-4 font-medium">Date</th>
                    <th className="px-6 py-4 font-medium">Amount</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-medium text-slate-900">{order.order_number}</td>
                      <td className="px-6 py-4 text-slate-600">{order.supplier_name}</td>
                      <td className="px-6 py-4 text-slate-500">{new Date(order.created_at).toLocaleDateString()}</td>
                      <td className="px-6 py-4 font-bold text-slate-700">{Number(order.total_amount).toLocaleString()}</td>
                      <td className="px-6 py-4">{getStatusBadge(order.status)}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          {order.status === 'pending_approval' && user?.role === 'admin' && (
                            <Button onClick={() => handleApprove(order.id)} size="sm" className="h-8 gap-1 bg-blue-100 text-blue-700 hover:bg-blue-200">
                              <Check className="h-3 w-3" /> Approve
                            </Button>
                          )}
                          {order.status === 'approved' && ['admin', 'warehouse'].includes(user?.role) && (
                            <Button onClick={() => handleReceive(order)} size="sm" className="h-8 gap-1 bg-emerald-100 text-emerald-700 hover:bg-emerald-200">
                              <PackageCheck className="h-3 w-3" /> Receive
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {orders.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-slate-500">No purchase orders found.</td>
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
