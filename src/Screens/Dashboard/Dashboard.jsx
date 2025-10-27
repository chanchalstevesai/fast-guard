import { useEffect, useState, useCallback, useRef } from "react";
import { useDispatch } from "react-redux";
import {
  GetuserList,
  GetuserDetail,
  GetCountryStateApi,
} from "../../Networking/APIs/UserGetDetails";
import { useNavigate } from "react-router-dom";
import NoData from "../../../Images/NoData.png";
import Loader from "../../Component/Loader";
import { useDashboard } from "../../Context/DashboardContext";

export const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { state, actions } = useDashboard();

  const {
    page,
    hasMore,
    localList,
    loading,
    selectedCountry,
    selectedState,
    searchQuery,
    scrollPosition,
  } = state;

  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);

  const isFetchingRef = useRef(false);
  const lastFetchedPageRef = useRef(0);

  //  FETCH USERS
  const fetchUsers = useCallback(
    async (pageNum = 1, reset = false) => {
      if (isFetchingRef.current) return;
      if (!reset && lastFetchedPageRef.current >= pageNum) return;
      if (!hasMore && !reset) return;

      isFetchingRef.current = true;
      lastFetchedPageRef.current = pageNum;

      const params = { page: pageNum, status: "None" };
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (selectedCountry) params.country = selectedCountry;
      if (selectedState) params.state = selectedState;

      actions.setLoading(true);

      try {
        const res = await dispatch(GetuserList(params)).unwrap();
        if (res?.length > 0) {
          if (reset) actions.setLocalList(res);
          else actions.appendLocalList(res);
          actions.setHasMore(true);
        } else {
          if (reset) actions.setLocalList([]);
          actions.setHasMore(false);
        }
      } catch (err) {
        console.error("Error fetching users:", err);
      } finally {
        isFetchingRef.current = false;
        actions.setLoading(false);
      }
    },
    [dispatch, searchQuery, selectedCountry, selectedState, actions, hasMore]
  );

  // INITIAL LOAD (Runs Once)
  useEffect(() => {
    if (lastFetchedPageRef.current === 0) {
      fetchUsers(1, true);
    }
  }, [fetchUsers]);

  //  PAGINATION (Load next page only once)
  useEffect(() => {
    if (page > 1 && !isFetchingRef.current && hasMore) {
      fetchUsers(page);
    }
  }, [page]);

  //  FILTERS & SEARCH (Re-fetch once)
  useEffect(() => {
    const timer = setTimeout(() => {
      lastFetchedPageRef.current = 0;
      actions.resetPagination();
      fetchUsers(1, true);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedCountry, selectedState]);

  //  FETCH COUNTRY / STATE ONCE
  useEffect(() => {
    dispatch(GetCountryStateApi())
      .unwrap()
      .then((res) => {
        setCountries(res.countries || []);
        setStates(res.states || []);
      })
      .catch(console.error);
  }, [dispatch]);

  //  INFINITE SCROLL
  const handleScroll = useCallback(() => {
    if (loading || isFetchingRef.current || !hasMore) return;
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
    if (scrollTop + clientHeight + 100 >= scrollHeight) {
      actions.setPage(page + 1);
    }
  }, [page, hasMore, loading]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  //  SCROLL RESTORE (after returning)
  useEffect(() => {
    if (scrollPosition > 0 && localList.length > 0) {
      setTimeout(() => {
        window.scrollTo({ top: scrollPosition, behavior: "smooth" });
        actions.setScrollPosition(0);
      }, 300);
    }
  }, [localList.length]);

  //  VIEW DETAIL
  const handleView = (id) => {
    actions.setScrollPosition(window.pageYOffset);
    dispatch(GetuserDetail({ id }));
    navigate(`/UserDetailView/${id}`);
  };

  //  SEARCH + FILTER HANDLERS
  const handleSearch = (e) => actions.setSearchQuery(e.target.value);
  const handleCountryChange = (e) => actions.setSelectedCountry(e.target.value);
  const handleStateChange = (e) => actions.setSelectedState(e.target.value);

  //  RENDER UI
  return (
    <div className="p-5 d-flex justify-content-center" style={{ background: "linear-gradient(135deg, #fffbe6, #f7e0b5)", minHeight: "100vh" }}>
      <div className="card w-100 shadow" style={{ borderRadius: "12px", maxWidth: "1200px" }}>
        <div className="card-header text-center fw-bold text-black" style={{ backgroundColor: "#d4a52e", borderTopLeftRadius: "12px", borderTopRightRadius: "12px", fontSize: "20px" }}>
          NEW GUARDS
        </div>

        <div className="card-body">
          <div className="row mb-4">
            <div className="col-md-4">
              <label className="form-label">Search by Name</label>
              <input type="text" className="form-control" placeholder="Enter name" onChange={handleSearch} />
            </div>
            <div className="col-md-4">
              <label className="form-label">Country</label>
              <select className="form-select" onChange={handleCountryChange} value={selectedCountry}>
                <option value="">All Countries</option>
                {countries.map((c, i) => <option key={i}>{c}</option>)}
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">State</label>
              <select className="form-select" onChange={handleStateChange} value={selectedState}>
                <option value="">All States</option>
                {states.map((s, i) => <option key={i}>{s}</option>)}
              </select>
            </div>
          </div>

          {loading && localList.length === 0 ? (
            <div className="d-flex justify-content-center mt-5">
              <Loader />
            </div>
          ) : localList.length > 0 ? (
            <>
              <div className="table-responsive">
                <table className="table table-bordered table-striped">
                  <thead className="table-dark">
                    <tr>
                      <th>#</th>
                      <th>First</th>
                      <th>Last</th>
                      <th>Phone</th>
                      <th>City</th>
                      <th>State</th>
                      <th>Country</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {localList.map((user, i) => (
                      <tr key={i}>
                        <td>{i + 1}</td>
                        <td>{user.first_name}</td>
                        <td>{user.last_name}</td>
                        <td>{user.cell_phone}</td>
                        <td>{user.city}</td>
                        <td>{user.state}</td>
                        <td>{user.country}</td>
                        <td>
                          <button className="btn btn-sm btn-outline-primary" onClick={() => handleView(user.id)}>
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {loading && <div className="text-center my-3"><Loader /></div>}
              {!hasMore && <p className="text-center text-muted mt-3">No more data</p>}
            </>
          ) : (
            <div className="text-center mt-5">
              <img src={NoData} alt="No data" style={{ width: "200px" }} />
              <h5 className="text-muted mt-3">No Data Found</h5>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
