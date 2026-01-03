import useRouter from "../hooks/useRouter.jsx";

const Link = ({ href, children, ...restOfProps }) => {
  const {navigateTo} = useRouter();

  const handleClick = (e) => {
    e.preventDefault();
    navigateTo(href);
  };

  return (
    <a href={href} onClick={handleClick} {...restOfProps}>
      {children}
    </a>
  );
};

export default Link;