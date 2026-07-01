import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Users, FileText, Trash, Edit, Search } from "lucide-react"

export default function Clients() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Users className="h-6 w-6 text-blue-600" />
          العملاء
        </h2>
        <div className="flex gap-2">
           <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">PDF</Button>
           <Button variant="outline">طباعة</Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-4">
           <div className="relative w-full md:w-96">
            <Search className="absolute right-3 top-2.5 h-4 w-4 text-slate-500" />
            <Input placeholder="بحث..." className="pl-4 pr-10" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الكود</TableHead>
                <TableHead>اسم العميل</TableHead>
                <TableHead>التليفون</TableHead>
                <TableHead>البطاقة الضريبية</TableHead>
                <TableHead>الرصيد الحالي</TableHead>
                <TableHead>إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                { id: "1", name: "الشركة المتحدة للصناعات المعدنية", phone: "-", taxId: "-", balance: "16,480 ج", balanceColor: "text-red-600" },
                { id: "2", name: "مصنع النور للأثاث المعدني", phone: "-", taxId: "XXX-XXX-XXX", balance: "ج", balanceColor: "text-slate-500" },
                { id: "3", name: "الصفا للتجارة والتوريدات", phone: "-", taxId: "-", balance: "ج", balanceColor: "text-slate-500" },
                { id: "4", name: "شركة الفجر الصناعية", phone: "-", taxId: "-", balance: "ج", balanceColor: "text-slate-500" },
                { id: "5", name: "مصنع الياسمين للمعادن", phone: "-", taxId: "-", balance: "ج", balanceColor: "text-slate-500" },
                { id: "6", name: "الرواد للتشكيل المعدني", phone: "-", taxId: "-", balance: "ج", balanceColor: "text-slate-500" },
                { id: "7", name: "شركة الأمانة للتوريدات", phone: "-", taxId: "-", balance: "ج", balanceColor: "text-slate-500" },
              ].map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium text-slate-900">{client.id}</TableCell>
                  <TableCell className="text-slate-900">{client.name}</TableCell>
                  <TableCell className="text-slate-500" dir="ltr">{client.phone}</TableCell>
                  <TableCell className="text-slate-500">{client.taxId}</TableCell>
                  <TableCell className={`font-medium ${client.balanceColor}`}>{client.balance}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                       <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 bg-blue-50 hover:bg-blue-100"><FileText className="h-4 w-4" /></Button>
                       <Button variant="ghost" size="icon" className="h-8 w-8 text-amber-600 bg-amber-50 hover:bg-amber-100"><Edit className="h-4 w-4" /></Button>
                       <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 bg-red-50 hover:bg-red-100"><Trash className="h-4 w-4" /></Button>
                    </div>
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
