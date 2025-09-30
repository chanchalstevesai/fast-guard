import { configureStore } from '@reduxjs/toolkit';
import userListReducer from "../Slice/GetuserListSlice";
import loginReducer from "../Slice/LoginSlice";
import ApprovedReducer from "../Slice/ApprovedSlice";
import formReducer from "../Slice/RegistrationSlice"
import membersSlice from '../Slice/GetAddMemberList';
const store = configureStore({
    reducer: {
        formSlice: formReducer,
        loginSlice: loginReducer,
        userListSlice: userListReducer,
        ApprovedSlice: ApprovedReducer,
        members: membersSlice,
    },
});

export default store;
