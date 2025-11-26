import { Route, Routes } from "react-router-dom";
import Customers from "../../pages/Customers";
import Dashboard from "../../pages/Dashbaord";
import Inventory from "../../pages/Inventory";
import Orders from "../../pages/Orders";
import Help  from "../../pages/Help";
import Staffs from "../../pages/Staffs";
import Promotion from "../../pages/Promotion";
import Messages from "../../pages/Messages";



function AppRoutes() {
  return (
    
    <Routes>
      <Route path="/" element={<Dashboard />}></Route>
      <Route path="/inventory" element={<Inventory />}></Route>
      <Route path="/orders" element={<Orders />}></Route>
      <Route path="/customers" element={<Customers />}></Route>
      <Route path="/help" element={<Help />}></Route>
      <Route path="/staffs" element={<Staffs />}></Route>
      <Route path="/promotion" element={<Promotion />}></Route>
      <Route path="/messages" element={<Messages />}></Route>
    </Routes>
  );
}
export default AppRoutes;
