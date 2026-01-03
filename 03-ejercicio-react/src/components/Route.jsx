import useRouter from '../hooks/useRouter.jsx';

const Route = ({ path, component: Component }) => {
  const { currentPath } = useRouter();
  if (currentPath !== path)   return null;

  return <Component />
}

export default Route