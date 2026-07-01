import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Edit, Trash, Printer, FileText, ArrowRightLeft } from "lucide-react"
import { Link } from "react-router-dom"

export default function InventoryStrips() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <FileText className="h-6 w-6 text-blue-600" />
          مخزن الشرائح
        </h2>
        <div className="flex gap-2">
          <Link to="/inventory/pipes">
            <Button variant="outline">مخزن المواسير</Button>
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
                <TableHead>كود الصنف</TableHead>
                <TableHead>المقاس (مم)</TableHead>
                <TableHead>السمك</TableHead>
                <TableHead>النوع</TableHead>
                <TableHead>عدد الشرائح</TableHead>
                <TableHead>الوزن المتاح</TableHead>
                <TableHead>من لفة</TableHead>
                <TableHead>تاريخ الإدخال</TableHead>
                <TableHead>كارت</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                { code: "SL-25-100", size: 25, thickness: "1.0 مم", type: "ساخن", count: 0, weight: "1,000 طن", roll: "RM-10-B001", date: "2026-06-15" },
                { code: "SL-32-100", size: 32, thickness: "1.0 مم", type: "ساخن", count: 40, weight: "9,000 طن", roll: "RM-10-B001", date: "2026-06-15" },
              ].map((item, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium text-slate-900">{item.code}</TableCell>
                  <TableCell>{item.size} مم</TableCell>
                  <TableCell>{item.thickness}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 rounded-full text-xs bg-amber-50 border border-amber-200 text-amber-600">{item.type}</span>
                  </TableCell>
                  <TableCell>{item.count}</TableCell>
                  <TableCell className="text-emerald-600 font-medium">{item.weight}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 rounded-md bg-slate-100 text-xs text-slate-700">{item.roll}</span>
                  </TableCell>
                  <TableCell className="text-slate-500">{item.date}</TableCell>
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
          
          <div className="mt-4 p-3 rounded-md bg-blue-50 border border-blue-200 text-sm text-blue-700 flex items-center gap-2">
            <span className="font-bold">ملاحظة:</span> مخزن الشرائح يتغذى تلقائياً من أمر التشريح فقط - لا إضافة يدوية حفاظاً على دقة الحسابات.
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5 text-slate-500" />
            سجل أذون التحويل المخزني
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
             <TableHeader>
               <TableRow>
                 <TableHead>رقم الإذن</TableHead>
                 <TableHead>التاريخ</TableHead>
                 <TableHead>من</TableHead>
                 <TableHead>إلى</TableHead>
                 <TableHead>النوع</TableHead>
                 <TableHead>التفاصيل</TableHead>
                 <TableHead></TableHead>
               </TableRow>
             </TableHeader>
             <TableBody>
               {[
                 { id: "TR-0004", date: "2026-06-16", from: "مخزن الشرائح", to: "خط مواسير كبير", type: "صرف شرائح للتشغيل", details: "شرائح SL-25-100 (40 شريحة)", typeColor: "text-blue-700 bg-blue-50 border border-blue-200" },
                 { id: "TR-0003", date: "2026-06-15", from: "خط تشريح", to: "مخزن الشرائح", type: "توريد شرائح للمخزن", details: "صاج RM-10-B001 (9,000 طن) شرائح SL-32-100", typeColor: "text-emerald-700 bg-emerald-50 border border-emerald-200" },
                 { id: "TR-0002", date: "2026-06-15", from: "خط تشريح", to: "مخزن الشرائح", type: "توريد شرائح للمخزن", details: "صاج RM-10-B001 (1,000 طن) شرائح SL-25-100", typeColor: "text-emerald-700 bg-emerald-50 border border-emerald-200" },
                 { id: "TR-0001", date: "2026-06-15", from: "مخزن الملفات (الخام)", to: "خط تشريح", type: "صرف صاج للتشريح", details: "صاج RM-10-B001 (20,000 طن)", typeColor: "text-blue-700 bg-blue-50 border border-blue-200" },
               ].map((tr, i) => (
                 <TableRow key={i}>
                   <TableCell className="font-medium">{tr.id}</TableCell>
                   <TableCell className="text-slate-500">{tr.date}</TableCell>
                   <TableCell>{tr.from}</TableCell>
                   <TableCell>{tr.to}</TableCell>
                   <TableCell>
                      <span className={`px-2 py-1 rounded-md text-xs ${tr.typeColor}`}>{tr.type}</span>
                   </TableCell>
                   <TableCell className="text-slate-500 text-xs">{tr.details}</TableCell>
                   <TableCell>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-900 hover:bg-slate-100"><Printer className="h-4 w-4" /></Button>
                   </TableCell>
                 </TableRow>
               ))}
             </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
