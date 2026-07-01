import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Users, FileText, Trash, Edit } from "lucide-react"

export default function Employees() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Users className="h-6 w-6 text-blue-600" />
          الموظفين
        </h2>
        <Button>+ إضافة موظف</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الكود</TableHead>
                <TableHead>الاسم</TableHead>
                <TableHead>الوظيفة</TableHead>
                <TableHead>الموبايل</TableHead>
                <TableHead>رقم التأمين</TableHead>
                <TableHead>حساب بنكي</TableHead>
                <TableHead>الراتب</TableHead>
                <TableHead>إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                { id: "1", name: "أحمد محمود السيد", job: "رئيس مجلس الإدارة", phone: "010XXXXX100", insurance: "-", bank: "-", salary: "ج" },
                { id: "2", name: "محمد عبد الله حسن", job: "مدير المبيعات", phone: "-", insurance: "-", bank: "-", salary: "ج" },
                { id: "3", name: "مصطفى كمال إبراهيم", job: "مدير مالي", phone: "010XXXXX102", insurance: "XXXXXXXX", bank: "-", salary: "19,970 ج" },
                { id: "4", name: "خالد سعيد عبد الرحمن", job: "محاسب", phone: "010XXXXX103", insurance: "XXXXXXXX", bank: "-", salary: "8,193.75 ج" },
                { id: "5", name: "عمرو حسين علي", job: "محاسب", phone: "010XXXXX104", insurance: "XXXXXXXX", bank: "-", salary: "9,000 ج" },
                { id: "7", name: "طارق فؤاد محمد", job: "محاسب", phone: "010XXXXX105", insurance: "XXXXXXXX", bank: "-", salary: "6,500 ج" },
                { id: "8", name: "هشام جمال الدين", job: "عامل بوفيه", phone: "010XXXXX106", insurance: "XXXXXXXX", bank: "-", salary: "6,490 ج" },
              ].map((emp) => (
                <TableRow key={emp.id}>
                  <TableCell className="font-medium text-slate-900">{emp.id}</TableCell>
                  <TableCell className="text-slate-900">{emp.name}</TableCell>
                  <TableCell className="text-slate-500">{emp.job}</TableCell>
                  <TableCell className="text-slate-500" dir="ltr">{emp.phone}</TableCell>
                  <TableCell className="text-slate-500">{emp.insurance}</TableCell>
                  <TableCell className="text-slate-500">{emp.bank}</TableCell>
                  <TableCell className="font-medium">{emp.salary}</TableCell>
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
