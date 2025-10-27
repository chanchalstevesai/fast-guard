import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
} from "react";

// Initial state
const initialState = {
  page: 1,
  hasMore: true,
  localList: [],
  loading: false,
  selectedCountry: "",
  selectedState: "",
  searchQuery: "",
  scrollPosition: 0,
  lastViewedItemId: null,
  isInitialized: false,
  isReturningFromDetail: false,
};

// Action types
const DASHBOARD_ACTIONS = {
  SET_PAGE: "SET_PAGE",
  SET_HAS_MORE: "SET_HAS_MORE",
  SET_LOCAL_LIST: "SET_LOCAL_LIST",
  APPEND_LOCAL_LIST: "APPEND_LOCAL_LIST",
  SET_LOADING: "SET_LOADING",
  SET_SELECTED_COUNTRY: "SET_SELECTED_COUNTRY",
  SET_SELECTED_STATE: "SET_SELECTED_STATE",
  SET_SEARCH_QUERY: "SET_SEARCH_QUERY",
  SET_SCROLL_POSITION: "SET_SCROLL_POSITION",
  SET_LAST_VIEWED_ITEM: "SET_LAST_VIEWED_ITEM",
  RESET_FILTERS: "RESET_FILTERS",
  RESET_PAGINATION: "RESET_PAGINATION",
  INITIALIZE: "INITIALIZE",
  RESET_ALL: "RESET_ALL",
  SET_RETURNING_FROM_DETAIL: "SET_RETURNING_FROM_DETAIL",
};

// Reducer
const dashboardReducer = (state, action) => {
  switch (action.type) {
    case DASHBOARD_ACTIONS.SET_PAGE:
      return { ...state, page: action.payload };

    case DASHBOARD_ACTIONS.SET_HAS_MORE:
      return { ...state, hasMore: action.payload };

    case DASHBOARD_ACTIONS.SET_LOCAL_LIST:
      return { ...state, localList: action.payload };

    case DASHBOARD_ACTIONS.APPEND_LOCAL_LIST:
      return { ...state, localList: [...state.localList, ...action.payload] };

    case DASHBOARD_ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };

    case DASHBOARD_ACTIONS.SET_SELECTED_COUNTRY:
      return { ...state, selectedCountry: action.payload };

    case DASHBOARD_ACTIONS.SET_SELECTED_STATE:
      return { ...state, selectedState: action.payload };

    case DASHBOARD_ACTIONS.SET_SEARCH_QUERY:
      return { ...state, searchQuery: action.payload };

    case DASHBOARD_ACTIONS.SET_SCROLL_POSITION:
      return { ...state, scrollPosition: action.payload };

    case DASHBOARD_ACTIONS.SET_LAST_VIEWED_ITEM:
      return { ...state, lastViewedItemId: action.payload };

    case DASHBOARD_ACTIONS.RESET_FILTERS:
      return {
        ...state,
        selectedCountry: "",
        selectedState: "",
        searchQuery: "",
      };

    case DASHBOARD_ACTIONS.RESET_PAGINATION:
      return {
        ...state,
        page: 1,
        hasMore: true,
        localList: [],
      };

    case DASHBOARD_ACTIONS.INITIALIZE:
      return { ...state, isInitialized: true };

    case DASHBOARD_ACTIONS.RESET_ALL:
      return { ...initialState, isInitialized: true };

    case DASHBOARD_ACTIONS.SET_RETURNING_FROM_DETAIL:
      return { ...state, isReturningFromDetail: action.payload };

    default:
      return state;
  }
};

// Context
const DashboardContext = createContext();

// Provider component
export const DashboardProvider = ({ children }) => {
  const [state, dispatch] = useReducer(dashboardReducer, initialState);

  // Action creators
  const actions = {
    setPage: useCallback((page) => {
      dispatch({ type: DASHBOARD_ACTIONS.SET_PAGE, payload: page });
    }, []),

    setHasMore: useCallback((hasMore) => {
      dispatch({ type: DASHBOARD_ACTIONS.SET_HAS_MORE, payload: hasMore });
    }, []),

    setLocalList: useCallback((list) => {
      dispatch({ type: DASHBOARD_ACTIONS.SET_LOCAL_LIST, payload: list });
    }, []),

    appendLocalList: useCallback((list) => {
      dispatch({ type: DASHBOARD_ACTIONS.APPEND_LOCAL_LIST, payload: list });
    }, []),

    setLoading: useCallback((loading) => {
      dispatch({ type: DASHBOARD_ACTIONS.SET_LOADING, payload: loading });
    }, []),

    setSelectedCountry: useCallback((country) => {
      dispatch({
        type: DASHBOARD_ACTIONS.SET_SELECTED_COUNTRY,
        payload: country,
      });
    }, []),

    setSelectedState: useCallback((state) => {
      dispatch({ type: DASHBOARD_ACTIONS.SET_SELECTED_STATE, payload: state });
    }, []),

    setSearchQuery: useCallback((query) => {
      dispatch({ type: DASHBOARD_ACTIONS.SET_SEARCH_QUERY, payload: query });
    }, []),

    setScrollPosition: useCallback((position) => {
      dispatch({
        type: DASHBOARD_ACTIONS.SET_SCROLL_POSITION,
        payload: position,
      });
    }, []),

    setLastViewedItem: useCallback((id) => {
      dispatch({ type: DASHBOARD_ACTIONS.SET_LAST_VIEWED_ITEM, payload: id });
    }, []),

    resetFilters: useCallback(() => {
      dispatch({ type: DASHBOARD_ACTIONS.RESET_FILTERS });
    }, []),

    resetPagination: useCallback(() => {
      dispatch({ type: DASHBOARD_ACTIONS.RESET_PAGINATION });
    }, []),

    initialize: useCallback(() => {
      dispatch({ type: DASHBOARD_ACTIONS.INITIALIZE });
    }, []),

    resetAll: useCallback(() => {
      dispatch({ type: DASHBOARD_ACTIONS.RESET_ALL });
    }, []),

    setReturningFromDetail: useCallback((value) => {
      dispatch({
        type: DASHBOARD_ACTIONS.SET_RETURNING_FROM_DETAIL,
        payload: value,
      });
    }, []),
  };

  return (
    <DashboardContext.Provider value={{ state, actions }}>
      {children}
    </DashboardContext.Provider>
  );
};

// Custom hook to use dashboard context
export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
};

export default DashboardContext;
