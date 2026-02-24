import React from "react";
import { Routes, Route } from "react-router-dom"
import UserSidebar from "../../Sidebar/UserSidebar";
import Dashboard from "./Home";
import Anthropometric from "./ Anthropometric ";
import DietLog from "./DietLog";
import DietHistory from "./DieryHistory";
import Frequency from "./Frequency";
import MealPlan from "./MealPlan";
import Logout from "../../Authentication/Logout";
import Plan from "./Subscription";


const UserMain = () => {
    return(
        < div style={{ display: "flex", height: "100vh", overflow: "hidden",gap:"2px" }}>
            {/* Sidebar */}
            < div style={{ flexShrink: 0 }}>
                <UserSidebar/>
            </div>
            
            {/* Main Content Area */}
            <div style={{ 
                flex: 1, 
                overflowY: "auto",
                padding: "0px 0rem",
                backgroundColor: "#f8fafc",
                minHeight: "100vh"
            }}>
                <Routes>
                    <Route path="/" element={<Dashboard/>}/>
                    <Route path="/Home" element={<Dashboard/>}/>
                    <Route path="/UserProfile" element={<Anthropometric/>}/>
                    <Route path="/DietLog" element={<DietLog/>}/>
                    <Route path="/DiaryHistory" element={<DietHistory/>}/>
                    <Route path="/Frequency" element={<Frequency/>}/>
                    <Route path="/meal_Plan" element={<MealPlan/>}/>
                    <Route path="/userPlan" element={<Plan/>}/>
                    
                    <Route path="*" element={<Logout/>}/>
                </Routes>
            </div>
        </div>
    );
};

export default UserMain;