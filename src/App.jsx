import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import QuotationForm1 from "./QuotationForm1";
import BasicForm from "./BasicFrom";
import { Provider } from 'react-redux';
import { Login } from './Screens/Login/Login';
import store from './Networking/Store/store';
import { Dashboard } from './Screens/Dashboard/Dashboard';
import PrivateRoute from './Route/ProtectedRoute';
import { UserDetailView } from './Screens/UserDetail/UserDetailView';
import { ResetPassword } from './Screens/Login/ResetPassword';
import { ApprovedListComponent } from './Screens/Approve/Decline/ApprovedList';
import { NotApprovedListComponent } from './Screens/Approve/Decline/NotApproved';
import { ApprovedView } from './Screens/Approve/Decline/ApprovedView';
import { NotApprovedView } from './Screens/Approve/Decline/NotApprovedView';
import PublicRoute from './Route/PublicRoute';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { GuardPriceList } from './Screens/GuardPrice/GuardProiceList';
import SignUp from './Screens/SignUp/SignUp';
import MemberActivity from './Screens/MemberActivity/MemberActivity';
import ViewActivity from './Screens/ViewActivity/ViewActivity';


const App = () => {
  const token = localStorage.getItem('token');

  return (
    <Provider store={store}>
      <ToastContainer position="top-right" autoClose={3000} />
      <Router>
        <div className="App" style={{ width: "98.8vw" }}>
          <Routes>
            <Route path="/" element={<BasicForm />} />
            <Route path="/subcontractor" element={<QuotationForm1 />} />
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/Reset_password" element={<PrivateRoute><ResetPassword /></PrivateRoute>} />
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/UserDetailView/:id" element={<PrivateRoute><UserDetailView /></PrivateRoute>} />
            <Route path="/ApprovedList" element={<PrivateRoute><ApprovedListComponent /></PrivateRoute>} />
            <Route path="/NotApprovelist" element={<PrivateRoute><NotApprovedListComponent /></PrivateRoute>} />
            <Route path="/ApprovedView" element={<PrivateRoute><ApprovedView /></PrivateRoute>} />
            <Route path="/NotApprovedView" element={<PrivateRoute><NotApprovedView /></PrivateRoute>} />
            <Route path="/GuardPriceList" element={<PrivateRoute><GuardPriceList /></PrivateRoute>} />
            <Route path="/signup" element={<PrivateRoute><SignUp /></PrivateRoute>} />
            <Route path="/member-activity" element={<PrivateRoute><MemberActivity /></PrivateRoute>} />
            <Route path="/view-activity" element={<PrivateRoute><ViewActivity /></PrivateRoute>} />


          

            
            </Routes>
        </div>
      </Router>
    </Provider>
  );
};

export default App;
