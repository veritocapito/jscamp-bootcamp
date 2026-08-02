import { useNavigate, useLocation } from 'react-router'

export function useRouter() {
  const navigate = useNavigate()
  const location = useLocation()

  return {
    currentPath: location.pathname,
    navigateTo: navigate,
  }
}

