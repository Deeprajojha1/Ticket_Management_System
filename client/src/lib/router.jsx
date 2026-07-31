/* eslint-disable react-refresh/only-export-components */
import { Children, createContext, isValidElement, useCallback, useContext, useEffect, useMemo, useState } from "react";

const RouterContext = createContext(null);
const OutletContext = createContext(null);
const ParamsContext = createContext({});

const normalizePath = (path = "/") => {
  if (!path) return "/";
  const normalized = `/${path}`.replace(/\/+/g, "/");
  return normalized.length > 1 ? normalized.replace(/\/$/, "") : normalized;
};

const joinPaths = (basePath, childPath) => {
  if (!childPath) return normalizePath(basePath);
  if (childPath.startsWith("/")) return normalizePath(childPath);
  return normalizePath(`${basePath}/${childPath}`);
};

const getCurrentLocation = () => ({
  pathname: normalizePath(window.location.pathname),
  search: window.location.search,
  hash: window.location.hash,
  state: window.history.state?.usr ?? null,
});

const matchPath = (pattern, pathname) => {
  if (pattern === "*") return { params: {} };

  const routeParts = normalizePath(pattern).split("/").filter(Boolean);
  const pathParts = normalizePath(pathname).split("/").filter(Boolean);

  if (routeParts.length !== pathParts.length) return null;

  const params = {};
  for (let index = 0; index < routeParts.length; index += 1) {
    const routePart = routeParts[index];
    const pathPart = pathParts[index];

    if (routePart.startsWith(":")) {
      params[routePart.slice(1)] = decodeURIComponent(pathPart);
    } else if (routePart !== pathPart) {
      return null;
    }
  }

  return { params };
};

const renderWithOutlet = ({ element, outlet, params }) => (
  <ParamsContext.Provider value={params}>
    <OutletContext.Provider value={outlet}>{element}</OutletContext.Provider>
  </ParamsContext.Provider>
);

const matchRoutes = (children, pathname, basePath = "", inheritedParams = {}) => {
  let wildcardMatch = null;

  for (const child of Children.toArray(children)) {
    if (!isValidElement(child)) continue;

    const { children: nestedChildren, element, index, path } = child.props;

    if (index) {
      const routePath = normalizePath(basePath);
      if (normalizePath(pathname) === routePath) {
        return { element, params: inheritedParams };
      }
      continue;
    }

    if (!path) {
      const nestedMatch = matchRoutes(nestedChildren, pathname, basePath, inheritedParams);
      if (nestedMatch) {
        return {
          params: nestedMatch.params,
          element: renderWithOutlet({
            element,
            outlet: nestedMatch.element,
            params: nestedMatch.params,
          }),
        };
      }
      continue;
    }

    if (path === "*") {
      wildcardMatch = { element, params: inheritedParams };
      continue;
    }

    const routePath = joinPaths(basePath, path);
    const isExact = Boolean(matchPath(routePath, pathname));
    const isParent = nestedChildren && normalizePath(pathname).startsWith(`${routePath}/`);

    if (!isExact && !isParent) continue;

    const pathMatch = matchPath(routePath, isExact ? pathname : routePath);
    const params = { ...inheritedParams, ...(pathMatch?.params || {}) };

    if (nestedChildren) {
      const nestedMatch = matchRoutes(nestedChildren, pathname, routePath, params);
      if (nestedMatch) {
        return {
          params: nestedMatch.params,
          element: renderWithOutlet({
            element,
            outlet: nestedMatch.element,
            params: nestedMatch.params,
          }),
        };
      }
    }

    if (isExact) return { element, params };
  }

  return wildcardMatch;
};

export const BrowserRouter = ({ children }) => {
  const [location, setLocation] = useState(getCurrentLocation);

  useEffect(() => {
    const handlePopState = () => setLocation(getCurrentLocation());
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigate = useCallback((to, options = {}) => {
    const target = typeof to === "string" ? to : to.pathname;
    const state = options.state ?? null;
    const method = options.replace ? "replaceState" : "pushState";
    window.history[method]({ usr: state }, "", target);
    setLocation(getCurrentLocation());
  }, []);

  const value = useMemo(() => ({ location, navigate }), [location, navigate]);

  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
};

export const Routes = ({ children }) => {
  const { location } = useContext(RouterContext);
  const match = matchRoutes(children, location.pathname);
  return match ? <ParamsContext.Provider value={match.params}>{match.element}</ParamsContext.Provider> : null;
};

export const Route = () => null;

export const Outlet = () => useContext(OutletContext);

export const Navigate = ({ replace = false, state, to }) => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate(to, { replace, state });
  }, [navigate, replace, state, to]);

  return null;
};

export const Link = ({ children, onClick, replace = false, state, to, ...props }) => {
  const navigate = useNavigate();

  const handleClick = (event) => {
    onClick?.(event);
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.altKey ||
      event.ctrlKey ||
      event.shiftKey ||
      props.target
    ) {
      return;
    }

    event.preventDefault();
    navigate(to, { replace, state });
  };

  return (
    <a href={to} onClick={handleClick} {...props}>
      {children}
    </a>
  );
};

export const NavLink = ({ className, to, ...props }) => {
  const { pathname } = useLocation();
  const normalizedTo = normalizePath(to);
  const isActive = normalizedTo === "/" ? pathname === "/" : pathname === normalizedTo || pathname.startsWith(`${normalizedTo}/`);
  const resolvedClassName = typeof className === "function" ? className({ isActive }) : className;

  return <Link to={to} className={resolvedClassName} aria-current={isActive ? "page" : undefined} {...props} />;
};

export const useLocation = () => useContext(RouterContext).location;

export const useNavigate = () => useContext(RouterContext).navigate;

export const useParams = () => useContext(ParamsContext);
