import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Scissors, Plus, X, Settings } from "lucide-react"
import { useNavigate } from "react-router-dom"

export default function CuttingOrders() {
  const navigate = useNavigate()
  const [inventory, setInventory] = useState<any[]>([])
  
  // Selected Raw Material
  const [selectedRM, setSelectedRM] = useState<any>(null)
  const [rmWeight, setRmWeight] = useState<number>(0)
  
  // Outputs (Strips)
  const [outputs, setOutputs] = useState<any[]>([{ size: "", percentage: "", weight: 0 }])

  useEffect(() => {
    fetchInventory()
  }, [])

  const fetchInventory = async () => {
    try {
      const res = await fetch("/api/inventory/balance")
      if (res.ok) {
        const data = await res.json()
        setInventory(data.filter((i: any) => i.type === 'raw_material'))
      }
    } catch (error) {
      console.error("Error fetching inventory:", error)
    }
  }

  const handleAddOutput = () => {
    setOutputs([...outputs, { size: "", percentage: "", weight: 0 }])
  }

  const handleRemoveOutput = (index: number) => {
    const newOutputs = [...outputs]
    newOutputs.splice(index, 1)
    setOutputs(newOutputs)
  }

  const handleOutputChange = (index: number, field: string, value: string) => {
    const newOutputs = [...outputs]
    newOutputs[index][field] = value
    
    // Auto calculate weight based on percentage
    if (field === 'percentage' && rmWeight > 0) {
      const p = parseFloat(value) || 0
      newOutputs[index].weight = (rmWeight * p) / 100
    }
    setOutputs(newOutputs)
  }

  const handleRmWeightChange = (val: string) => {
    const weight = parseFloat(val) || 0
    setRmWeight(weight)
    
    // Update output weights
    const newOutputs = outputs.map(o => {
      const p = parseFloat(o.percentage) || 0
      return { ...o, weight: (weight * p) / 100 }
    })
    setOutputs(newOutputs)
  }

  const totalPercentage = outputs.reduce((acc, curr) => acc + (parseFloat(curr.percentage) || 0), 0)
  const totalOutputWeight = outputs.reduce((acc, curr) => acc + curr.weight, 0)

  const handleSaveOrder = async () => {
    if (!selectedRM || rmWeight <= 0 || outputs.length === 0 || totalPercentage !== 100) {
      alert("يرجى مراجعة البيانات. يجب اختيار خامة، وتحديد أوزان، وأن يكون مجموع النسب 100%.");
      return;
    }

    try {
      const payload = {
        inputItems: [{ itemId: selectedRM.itemId, weight: rmWeight }],
        outputItems: outputs.map(o => ({
          code: `SL-${o.size}-${selectedRM.thickness || '0'}`, // generated code
          size: o.size,
          thickness: selectedRM.thickness,
          weight: o.weight
        })),
        totalInputWeight: rmWeight
      }

      const res = await fetch("/api/production/cutting-orders", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        navigate("/inventory/items-master")
      } else {
        const error = await res.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error("Error saving cutting order:", error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Scissors className="h-6 w-6 text-blue-600" />
          أمر تشريح جديد
        </h2>
      </div>

      <Card className="border-blue-200 bg-blue-50/30 overflow-hidden">
        <div className="bg-blue-600 p-2 text-white text-sm font-medium">بيانات الخامة</div>
        <CardContent className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">اختر الخامة (من المخزون المتاح)</label>
            <select 
              className="w-full h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
              value={selectedRM?.itemId || ""}
              onChange={e => {
                const item = inventory.find(i => i.itemId === parseInt(e.target.value))
                setSelectedRM(item)
              }}
            >
              <option value="">-- اختر --</option>
              {inventory.map(item => (
                <option key={item.itemId} value={item.itemId}>
                  {item.name} - {item.code} ({item.thickness}مم) — متاح {item.balance} {item.unit}
                </option>
              ))}
            </select>
          </div>

          {selectedRM && (
            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-700">الوزن المسحوب للتشريح (طن):</label>
              <div className="flex items-center gap-4">
                <Input 
                  type="number" 
                  value={rmWeight || ""} 
                  onChange={e => handleRmWeightChange(e.target.value)} 
                  className="max-w-[200px] bg-white" 
                  placeholder="الوزن بالطن"
                />
                <span className="text-sm text-slate-500">
                  الرصيد المتاح: <span className="font-bold text-emerald-600">{selectedRM.balance} طن</span>
                </span>
              </div>
            </div>
          )}

          <div className="space-y-4 pt-4 border-t border-slate-200">
            <h4 className="font-semibold text-slate-800 text-sm">مخرجات التشريح (الشرائح):</h4>
            
            {outputs.map((output, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-4 items-end">
                <div className="col-span-4 space-y-2">
                  <label className="text-xs text-slate-500">المقاس (مم)</label>
                  <Input 
                    value={output.size} 
                    onChange={e => handleOutputChange(idx, 'size', e.target.value)} 
                    placeholder="25" 
                    className="bg-white" 
                  />
                </div>
                
                <div className="col-span-3 space-y-2">
                  <label className="text-xs text-slate-500">النسبة %</label>
                  <Input 
                    type="number" 
                    value={output.percentage} 
                    onChange={e => handleOutputChange(idx, 'percentage', e.target.value)} 
                    placeholder="%" 
                    className="bg-white text-center" 
                  />
                </div>

                <div className="col-span-4 space-y-2">
                  <label className="text-xs text-slate-500">الوزن التقريبي</label>
                  <div className="h-9 flex items-center text-emerald-600 font-bold text-sm">
                    {output.weight.toFixed(3)} طن
                  </div>
                </div>

                <div className="col-span-1 pb-1">
                   <Button onClick={() => handleRemoveOutput(idx)} variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                     <X className="h-5 w-5" />
                   </Button>
                </div>
              </div>
            ))}

            <div>
               <Button onClick={handleAddOutput} variant="outline" size="sm" className="gap-1 text-blue-600 border-blue-200 hover:bg-blue-50 bg-white">
                 <Plus className="h-4 w-4" /> إضافة مقاس
               </Button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-200 text-sm">
            <div className="text-slate-600">
              مجموع النسب: <span className={`font-bold ${totalPercentage === 100 ? 'text-emerald-600' : 'text-red-500'}`}>{totalPercentage}%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between p-4 bg-slate-900 rounded-lg text-white shadow-md">
        <div className="text-lg font-bold">
          إجمالي وزن المخرجات <span className="text-blue-400 ml-2">{totalOutputWeight.toFixed(3)} طن</span>
        </div>
        <div className="text-slate-400 text-sm">
          فرق الهالك: <span className="text-red-400">{(rmWeight - totalOutputWeight).toFixed(3)} طن</span>
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button onClick={handleSaveOrder} className="px-8 bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md">
          حفظ وتأكيد الأمر
        </Button>
      </div>
    </div>
  )
}
