import { useEffect, useState, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { GetuserDetail, GetuserList } from "../../Networking/APIs/UserGetDetails";
import { GetCountryStateApi } from "../../Networking/APIs/UserGetDetails"; // adjust path
import { useNavigate } from "react-router-dom";
import NoData from "../../../Images/NoData.png";
import Loader from "../../Component/Loader";

export const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Table data from Redux
  const { data } = useSelector((state) => state.userListSlice);

  const [loading, setLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Local state for dropdowns
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);

  // Fetch table data via Redux
  useEffect(() => {
    if (!data || data.length === 0) {
      dispatch(GetuserList())
        .unwrap()
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [dispatch, data]);

  // Fetch countries and states using your thunk
  useEffect(() => {
    dispatch(GetCountryStateApi())
      .unwrap()
      .then((res) => {
        setCountries(res.countries || []); // adjust based on API response structure
        setStates(res.states || []);
      })
      .catch(console.error);
  }, [dispatch]);

  // Filtered table data
  const filteredData = useMemo(() => {
    if (!Array.isArray(data)) return [];

    return data.filter((user) => {
      const countryMatch = selectedCountry ? user.country === selectedCountry : true;
      const stateMatch = selectedState ? user.state === selectedState : true;
      const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
      const searchMatch = searchQuery ? fullName.includes(searchQuery.toLowerCase()) : true;

      return countryMatch && stateMatch && searchMatch;
    });
  }, [data, selectedCountry, selectedState, searchQuery]);

  const handleView = useCallback((id) => {
    dispatch(GetuserDetail({ id }));
    navigate(`/UserDetailView/${id}`);
  }, [dispatch, navigate]);

  return (
    <div className="p-5 d-flex justify-content-center" style={{ background: "linear-gradient(135deg, #fffbe6, #f7e0b5)", minHeight: "100vh" }}>
      <div className="card w-100 shadow" style={{ borderRadius: "12px", maxWidth: "1200px" }}>
        <div className="card-header text-center fw-bold text-black" style={{ backgroundColor: "#d4a52e", borderTopLeftRadius: "12px", borderTopRightRadius: "12px", fontSize: "20px", padding: "15px" }}>
          GUARD LIST
        </div>
        <div className="card-body">
          {/* Filters */}
          <div className="row mb-4">
            <div className="col-md-4">
              <label className="form-label">Search by Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter first or last name"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Filter by Country</label>
              <select className="form-select" value={selectedCountry} onChange={(e) => setSelectedCountry(e.target.value)}>
                <option value="">All Countries</option>
                {countries.map((country, i) => <option key={i} value={country}>{country}</option>)}
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Filter by State</label>
              <select className="form-select" value={selectedState} onChange={(e) => setSelectedState(e.target.value)}>
                <option value="">All States</option>
                {states.map((state, i) => <option key={i} value={state}>{state}</option>)}
              </select>
            </div>
          </div>

          {/* Loading / Data / No Data */}
          {loading ? (
            <div className="d-flex flex-column align-items-center justify-content-center text-center mt-5">
              <Loader />
              <h5 className="mt-3 text-muted">Loading Guard list...</h5>
            </div>
          ) : filteredData.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-bordered table-hover table-striped">
                <thead className="table-dark">
                  <tr>
                    <th>#</th>
                    <th>First Name</th>
                    <th>Last Name</th>
                    <th>Cell Phone</th>
                    <th>City</th>
                    <th>State</th>
                    <th>Country</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {[...filteredData].reverse().map((user, index) => (
                    <tr key={user.id || index}>
                      <td>{index + 1}</td>
                      <td>{user.first_name}</td>
                      <td>{user.last_name}</td>
                      <td>{user.cell_phone}</td>
                      <td>{user.city}</td>
                      <td>{user.state}</td>
                      <td>{user.country}</td>
                      <td>
                        <button className="btn btn-sm btn-outline-primary" onClick={() => handleView(user.id)}>
                          <i className="bi bi-eye"> View</i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="d-flex flex-column align-items-center justify-content-center text-center mt-5">
              <img src={NoData} style={{ maxWidth: "300px" }} alt="No Data Found" className="img-fluid" />
              <h4 className="mt-3 text-muted">No Data Found</h4>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
