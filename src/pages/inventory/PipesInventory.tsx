import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Edit, Trash, FileText, ArrowRightLeft, Package } from "lucide-react"
import { Link } from "react-router-dom"

export default function PipesInventory() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Package className="h-6 w-6 text-blue-600" />
          مخزن المواسير
        </h2>
        <div className="flex gap-2">
          <Link to="/inventory">
            <Button variant="outline">مخزن الشرائح</Button>
          </Link>
          <Link to="/inventory/item-card">
            <Button variant="outline">كارت حركة الصنف</Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-col md:flex-row items-center justify-between gap-4 pb-4">
          <div className="relative w-full md:w-96">
            <Search className="absolute right-3 top-2.5 h-4 w-4 text-slate-500" />
            <Input placeholder="بحث..." className="pl-4 pr-10" />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>كود الماسورة</TableHead>
                <TableHead>المقاس</TableHead>
                <TableHead>السمك</TableHead>
                <TableHead>الطول</TableHead>
                <TableHead>العدد</TableHead>
                <TableHead>وزن الماسورة</TableHead>
                <TableHead>الوزن الكلي</TableHead>
                <TableHead>كارت</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                { code: "PP-25-100-L6", size: "25 مم", thickness: "1.0 مم", length: "6 م", count: 300, weight: "3.66 كجم", totalWeight: "1.098 طن" },
              ].map((item, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium text-slate-900">{item.code}</TableCell>
                  <TableCell>{item.size}</TableCell>
                  <TableCell>{item.thickness}</TableCell>
                  <TableCell>{item.length}</TableCell>
                  <TableCell>{item.count}</TableCell>
                  <TableCell className="text-slate-600">{item.weight}</TableCell>
                  <TableCell className="text-blue-600 font-medium">{item.totalWeight}</TableCell>
                  <TableCell>
                     <div className="flex items-center gap-2">
                       <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100"><FileText className="h-4 w-4" /></Button>
                       <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100"><Trash className="h-4 w-4" /></Button>
                       <Button variant="ghost" size="icon" className="h-8 w-8 text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100"><Edit className="h-4 w-4" /></Button>
                     </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <ArrowRightLeft className="h-5 w-5 text-slate-500" />
            حركة المخزن (وارد / منصرف)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
             <TableHeader>
               <TableRow>
                 <TableHead>التاريخ</TableHead>
                 <TableHead>الحركة</TableHead>
                 <TableHead>البيان</TableHead>
                 <TableHead>الطرف</TableHead>
                 <TableHead>الكمية</TableHead>
               </TableRow>
             </TableHeader>
             <TableBody>
               {[
                 { date: "2026-06-16", type: "وارد", statement: "إنتاج 25×1.0", party: "خط مواسير كبير", qty: "+500 ماسورة", qtyColor: "text-emerald-600" },
                 { date: "2026-06-15", type: "منصرف", statement: "خروج 25×1.0 (DO-0001)", party: "الشركة المتحدة للصناعات المعدنية (في ص 1234 محمد السيد)", qty: "-200 ماسورة", qtyColor: "text-red-600" },
               ].map((mov, i) => (
                 <TableRow key={i}>
                   <TableCell className="text-slate-500">{mov.date}</TableCell>
                   <TableCell>
                      <span className={`px-2 py-1 rounded-md text-xs ${mov.type === 'وارد' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                        {mov.type}
                      </span>
                   </TableCell>
                   <TableCell className="text-slate-700 text-sm">{mov.statement}</TableCell>
                   <TableCell className="text-slate-600">{mov.party}</TableCell>
                   <TableCell className={`font-bold ${mov.qtyColor}`} dir="ltr">{mov.qty}</TableCell>
                 </TableRow>
               ))}
             </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
