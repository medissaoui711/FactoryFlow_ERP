import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Activity, Clapperboard, Settings } from "lucide-react"
import { Link } from "react-router-dom"

export default function LiveProduction() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center justify-center py-6">
        <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <Clapperboard className="h-8 w-8 text-blue-600" />
          شاشة الإنتاج المباشر
        </h2>
        <div className="flex items-center justify-between w-full max-w-4xl mt-4">
          <p className="text-slate-500">خطوط المصنع شغالة دلوقتي - تابع الإنتاج وهو بيزيد لحظة بلحظة</p>
          <Link to="/production/cutting-orders">
            <Button variant="outline" className="gap-2">
              <Settings className="h-4 w-4" /> أمر تشريح جديد
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
         <Card className="bg-white border-slate-200">
          <CardContent className="p-6 flex flex-col items-center justify-center text-center">
            <div className="text-3xl font-bold text-slate-900 mb-1">3'203</div>
            <p className="text-sm text-slate-500">ماسورة أنتجت اليوم</p>
          </CardContent>
        </Card>
        <Card className="bg-white border-slate-200">
          <CardContent className="p-6 flex flex-col items-center justify-center text-center">
            <div className="text-3xl font-bold text-slate-900 mb-1">10.76</div>
            <p className="text-sm text-slate-500">طن إنتاج اليوم</p>
          </CardContent>
        </Card>
        <Card className="bg-white border-slate-200">
          <CardContent className="p-6 flex flex-col items-center justify-center text-center">
            <div className="text-3xl font-bold text-slate-900 mb-1">3.99</div>
            <p className="text-sm text-slate-500">طن تشريح اليوم</p>
          </CardContent>
        </Card>
        <Card className="bg-white border-slate-200">
          <CardContent className="p-6 flex flex-col items-center justify-center text-center">
            <div className="text-3xl font-bold text-slate-900 mb-1 text-blue-600">3 / 3</div>
            <p className="text-sm text-slate-500">خطوط شغالة الآن</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white border-slate-200">
        <CardContent className="p-8 space-y-12 relative overflow-hidden">
          {/* Animated Background Grid */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+CiAgPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0iI2UyZThmMCIgLz4KPC9zdmc+')] opacity-50 pointer-events-none"></div>

          <div className="flex justify-between items-center relative z-10">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-slate-500" />
              <span className="font-semibold text-slate-900">أرصدة الإنتاج</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
              07:36 م
            </div>
          </div>

          {[
            { name: "خط مواسير كبير", supervisor: "أحمد محمود", produced: "745", weight: "5.513", status: "running" },
            { name: "خط مواسير صغير", supervisor: "مصطفى كمال", produced: "1,458", weight: "5.249", status: "running" },
            { name: "خط التشريح", supervisor: "خالد سعيد", produced: "-", weight: "3.985", isCutting: true, status: "running" },
          ].map((line, i) => (
            <div key={i} className="relative z-10">
              <div className="flex items-end justify-between mb-2">
                 <div className="flex items-center gap-3">
                   <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse"></div>
                   <div>
                     <h4 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                       {line.isCutting ? <Settings className="h-5 w-5 text-slate-400" /> : <Activity className="h-5 w-5 text-slate-400" />}
                       {line.name}
                     </h4>
                     <span className="text-xs text-slate-500">الرئيس: {line.supervisor}</span>
                   </div>
                 </div>
                 <div className="text-left flex flex-col items-end">
                   <div className="font-black text-2xl text-emerald-600">
                     {line.weight} <span className="text-sm font-normal text-slate-500">طن</span>
                   </div>
                   {!line.isCutting && (
                     <div className="font-bold text-lg text-blue-600">
                       {line.produced} <span className="text-sm font-normal text-slate-500">ماسورة</span>
                     </div>
                   )}
                 </div>
              </div>
              
              {/* Animated Progress Bar / Belt */}
              <div className="relative h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                <div className="absolute inset-y-0 right-0 bg-gradient-to-l from-emerald-500/20 to-transparent w-full"></div>
                {/* Simulated items moving on belt */}
                <div className="absolute inset-y-0 right-0 flex items-center w-full animate-[slide_3s_linear_infinite]">
                  <div className="h-2 w-8 bg-emerald-500 rounded-sm mx-4"></div>
                  <div className="h-2 w-8 bg-emerald-500 rounded-sm mx-4"></div>
                  <div className="h-2 w-8 bg-emerald-500 rounded-sm mx-4"></div>
                  <div className="h-2 w-8 bg-emerald-500 rounded-sm mx-4"></div>
                  <div className="h-2 w-8 bg-emerald-500 rounded-sm mx-4"></div>
                </div>
              </div>
            </div>
          ))}

          <div className="flex justify-center mt-8 relative z-10">
             <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-4 py-2 rounded-full border border-slate-200">
               <Settings className="h-4 w-4" /> كل الخطوط تعمل بكامل طاقتها • متوسط الكفاءة 95%
             </div>
          </div>
        </CardContent>
      </Card>

      <style>{`
        @keyframes slide {
          from { transform: translateX(0); }
          to { transform: translateX(-100px); }
        }
      `}</style>
    </div>
  )
}
