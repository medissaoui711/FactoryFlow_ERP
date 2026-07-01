/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { MainLayout } from "./components/layout/MainLayout"
import Dashboard from "./pages/Dashboard"
import InventoryStrips from "./pages/inventory/InventoryStrips"
import PipesInventory from "./pages/inventory/PipesInventory"
import ItemCard from "./pages/inventory/ItemCard"
import ItemsMaster from "./pages/inventory/ItemsMaster"
import Employees from "./pages/hr/Employees"
import Clients from "./pages/sales/Clients"
import Purchases from "./pages/purchases/PurchaseOrders"
import Sales from "./pages/sales/Sales"
import LiveProduction from "./pages/production/LiveProduction"
import CuttingOrders from "./pages/production/CuttingOrders"
import Treasury from "./pages/finance/Treasury"
import Checks from "./pages/finance/Checks"
import Expenses from "./pages/finance/Expenses"
import Journal from "./pages/finance/Journal"
import Reports from "./pages/Reports"

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="inventory" element={<InventoryStrips />} />
          <Route path="inventory/items-master" element={<ItemsMaster />} />
          <Route path="inventory/pipes" element={<PipesInventory />} />
          <Route path="inventory/item-card" element={<ItemCard />} />
          <Route path="hr" element={<Employees />} />
          <Route path="partners" element={<Clients />} />
          <Route path="sales" element={<Sales />} />
          <Route path="purchases" element={<Purchases />} />
          <Route path="production" element={<LiveProduction />} />
          <Route path="production/cutting-orders" element={<CuttingOrders />} />
          <Route path="finance/treasury" element={<Treasury />} />
          <Route path="finance/checks" element={<Checks />} />
          <Route path="finance/expenses" element={<Expenses />} />
          <Route path="finance/journal" element={<Journal />} />
          <Route path="reports" element={<Reports />} />
          <Route path="*" element={<div className="p-6 text-center text-slate-400">الصفحة قيد التطوير</div>} />
        </Route>
      </Routes>
    </Router>
  )
}






