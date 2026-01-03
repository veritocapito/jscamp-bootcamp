import Pagination from "../components/Pagination.jsx";
import jobsData from "../data.json";

import SearchFormSection from "../components/SearchFormSection.jsx";
import SearchResultsSection from "../components/SearchResultsSection.jsx";
import { useState } from "react";

const RESULTS_PER_PAGE = 5;

function Search() {
    const [filters, setFilters] = useState ({
    technology: '',
    location: '',
    experienceLevel: ''
  })

  const [textToFilter, setTextToFilter] = useState ('');
  const [currentPage, setCurrentPage] = useState(1);

  const jobsFilteredByFilters = jobsData.filter((job) => {
    return (filters.technology === '' || job.data.technology === filters.technology) &&
      (filters.location === '' || job.data.modalidad === filters.location) &&
      (filters.experienceLevel === '' || job.data.nivel === filters.experienceLevel);
  });
  
  const jobsWithTextFilter = textToFilter === ''
  ? jobsFilteredByFilters
  : jobsFilteredByFilters.filter((job) =>  {
    return job.titulo.toLowerCase().includes(textToFilter.toLowerCase()) ||
    job.empresa.toLowerCase().includes(textToFilter.toLowerCase()) ||
    job.data.modalidad.toLowerCase().includes(textToFilter.toLowerCase()) ||
    job.descripcion.toLowerCase().includes(textToFilter.toLowerCase());
  });
  
  const totalPages = Math.ceil(jobsWithTextFilter.length / RESULTS_PER_PAGE);

  const handleSearch = (filters) => {
    setCurrentPage(1);
    setFilters(filters);
  };

  const handleTextChange = (newTextToFilter) => {
    setTextToFilter(newTextToFilter);
    console.log('App text to filter:', newTextToFilter);
  };
  
  const pagedResults = jobsWithTextFilter.slice(
    (currentPage - 1) * RESULTS_PER_PAGE,
    currentPage * RESULTS_PER_PAGE
  );

  const handlePageChange = (newPage) => {
    console.log('cambiando a pagina: ', newPage);
    
    setCurrentPage(newPage);
  };

 const title = `Resultados ${jobsWithTextFilter.length} | Página ${currentPage} | DevJobs`;

  return (
    <>
      <main> 
        <title>{title}</title>
        <SearchFormSection onSearch={handleSearch} onTextChange={handleTextChange}     />
        <SearchResultsSection pagedResults={pagedResults} />
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
      </main>
    </>
  );
}

export default Search;
