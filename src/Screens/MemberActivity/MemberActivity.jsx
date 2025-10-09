
import React, { useEffect, useState } from "react";
import { memberActivity } from "../../Networking/APIs/MemberActivityApi";
import { useNavigate } from "react-router-dom"; 
import { useDispatch } from "react-redux";
 import { setSelectedUsermail } from "../../Networking/Slice/GetMailSlice";

const MemberActivity = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
    const navigate = useNavigate();
     const dispatch = useDispatch();

 useEffect(() => {
  const fetchMembers = async () => {
    try {
      setLoading(true);
      const data = await memberActivity();
      console.log("API response:", data);
      setMembers(data);
    } catch (err) {
      setError("Failed to load members");
    } finally {
      setLoading(false);
    }
  };

  fetchMembers();
}, []);

const handleClick = (email) =>{
dispatch(setSelectedUsermail(email));
localStorage.setItem("selectedEmail", email);
   navigate("/view-activity"); 
}

  if (loading) return <p className="text-center py-6">Loading...</p>;
  if (error) return <p className="text-center text-red-500 py-6">{error}</p>;

  return (
 
    <div className="min-h-screen bg-gradient-to-b from-[#fef8e7] to-[#fdf4dc] py-8 px-3 sm:px-6 flex justify-center items-start">
  <div
    className="bg-white w-full overflow-hidden "
    style={{ maxWidth: "1000px", margin: "0 auto" }}
  >
    <h2 className="text-lg sm:text-xl font-semibold text-gray-800 p-4 border-b bg-gradient-to-b from-[#fef8e7] to-[#fdf4dc]">
      Member Activity
    </h2>

    <div className="divide-y shadow-md rounded-lg">
      {members.length > 0 ? (
        members.map((member) => (
          <div
            key={member.id}
            className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 px-4 py-3 hover:bg-gray-50 transition"
          >
            <p className="text-gray-900 font-medium text-sm sm:text-base break-all">
              {member.email}
            </p>

            <button
              onClick={() => handleClick(member.email)}
              className="w-full sm:w-auto text-center border border-blue-500 text-blue-600 px-3 py-2 rounded-md text-sm sm:text-base hover:bg-blue-50 transition"
            >
              View Activity
            </button>
          </div>
        ))
      ) : (
        <p className="text-center text-gray-500 py-6">No members found</p>
      )}
    </div>
  </div>
</div>

  );
};

export default MemberActivity;

