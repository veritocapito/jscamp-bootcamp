import JobListings from "./JobListings.jsx";


const SearchResultsSection = ({ pagedResults }) => {


  return (
    <section>
      <h2 style={{ textAlign: "center" }}>Resultados de búsqueda</h2>
      <JobListings jobs={pagedResults} />
    </section>
  );
};

export default SearchResultsSection;
