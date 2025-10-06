import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { GetuserDetail, GetuserList, GetCountryStateApi } from "../../Networking/APIs/UserGetDetails";
import { useNavigate } from "react-router-dom";
import NoData from "../../../Images/NoData.png";
import Loader from "../../Component/Loader";
import { HiOutlineGif } from "react-icons/hi2";

export const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [localList, setLocalList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);

  const { data, loading: reduxLoading, error } = useSelector(state => state.userListSlice);

  // Fetch paginated data
  const fetchUsers = useCallback((pageNum = 1, reset = false) => {
    const params = {
      page: pageNum,
      status: "None",
    };

    if (searchQuery.trim()) params.search = searchQuery.trim();
    if (selectedCountry) params.country = selectedCountry;
    if (selectedState) params.state = selectedState;

    setLoading(true);

    dispatch(GetuserList(params))
      .unwrap()
      .then((res) => {
        if (res && res.length > 0) {
          setLocalList(prev => reset ? [...res] : [...prev, ...res]);
        } else {
          setHasMore(false);
          if (reset) setLocalList([]);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [dispatch, searchQuery, selectedCountry, selectedState]);

  useEffect(() => {
    fetchUsers(page);
  }, [fetchUsers, page]);

  useEffect(() => {
    fetchUsers(page);
  }, [fetchUsers, page]);

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    fetchUsers(1, true);
  }, [searchQuery, selectedCountry, selectedState]);



  // Fetch countries & states
  useEffect(() => {
    dispatch(GetCountryStateApi())
      .unwrap()
      .then((res) => {
        setCountries(res.countries || []);
        setStates(res.states || []);
      })
      .catch(console.error);
  }, [dispatch]);

  const handleView = useCallback((id) => {
    dispatch(GetuserDetail({ id }));
    navigate(`/UserDetailView/${id}`);
  }, [dispatch, navigate]);

  // Debounce helper
  const debounce = (fn, delay) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  };

  // Infinite scroll
  const handleScroll = useCallback(
    debounce(() => {
      if (!hasMore || loading) return;
      const scrollTop = document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const fullHeight = document.documentElement.offsetHeight;
      if (scrollTop + windowHeight + 50 >= fullHeight) {
        setPage(prev => prev + 1);
      }
    }, 200),
    [hasMore, loading]
  );

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Debounced search/filter
  const handleSearch = useCallback(
    debounce((value) => {
      setPage(1);
      setHasMore(true);
      setSearchQuery(value);
    }, 500),
    []
  );

  const handleCountryChange = (value) => {
    setSelectedCountry(value);
    setPage(1);
    setHasMore(true);
  };

  const handleStateChange = (value) => {
    setSelectedState(value);
    setPage(1);
    setHasMore(true);
  };

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
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Filter by Country</label>
              <select className="form-select" value={selectedCountry} onChange={(e) => handleCountryChange(e.target.value)}>
                <option value="">All Countries</option>
                {countries.map((c, i) => <option key={i} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Filter by State</label>
              <select className="form-select" value={selectedState} onChange={(e) => handleStateChange(e.target.value)}>
                <option value="">All States</option>
                {states.map((s, i) => <option key={i} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Table or Loader */}
          {loading && page === 1 ? (
            <div className="d-flex justify-content-center mt-5"><Loader /></div>
          ) : localList.length > 0 ? (
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
                  {localList.map((user, index) => (
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
              {loading && page > 1 && <div className="d-flex justify-content-center my-3"><Loader /></div>}
              {!hasMore && <div className="text-center text-muted my-3"><small>No more data to load</small></div>}
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



