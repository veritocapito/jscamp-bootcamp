const filterLocation = document.getElementById('filter-location');
const filterExperience = document.getElementById('filter-experience-level');
const filterTechnology = document.getElementById('filter-technology');
const searchInput = document.getElementById('empleos-search-input');

const jobListContainer = document.querySelector('.jobs-listings');

function applyFilters() {
  const selectedLocation = filterLocation.value;
  const selectedExperience = filterExperience.value;
  const selectedTechnology = filterTechnology.value;

  const selectedSearchText = searchInput.value.toLowerCase().trim();

  const jobs = document.querySelectorAll('.job-listing-card');

  let matchJobsCount = 0;

  jobs.forEach(job => {
    const jobTitle = job.querySelector('h3').textContent.toLowerCase();
    const jobLocation = job.getAttribute('data-modalidad');
    const jobExperience = job.getAttribute('data-experience');
    const jobTechnology = job.getAttribute('data-technology');

    const titleMatch = jobTitle.includes(selectedSearchText);

    const techArray = jobTechnology.split(',');

    const locationMatch = selectedLocation === '' || jobLocation === selectedLocation; 
    const experienceMatch = selectedExperience === '' || jobExperience === selectedExperience;
    const technologyMatch = selectedTechnology === '' || techArray.includes(selectedTechnology);

    if (titleMatch && locationMatch && experienceMatch && technologyMatch) {
      job.classList.remove('is-hidden');
      matchJobsCount++;
    } else {
      job.classList.add('is-hidden');
    }
  });
  
  const existingMessage = document.getElementById('no-results-message');
    if (existingMessage) {
      existingMessage.remove();
    }
  
    if (matchJobsCount === 0) {
      const noResultsMessage = document.createElement('span');
      noResultsMessage.id = 'no-results-message';
      noResultsMessage.classList.add('no-results-text')
      noResultsMessage.textContent = 'No se encontraron empleos que cumplan con los criterios de búsqueda.';
      
      jobListContainer.after(noResultsMessage);
    }
}


filterLocation.addEventListener('change', applyFilters);
filterExperience.addEventListener('change', applyFilters);
filterTechnology.addEventListener('change', applyFilters);
searchInput.addEventListener('keyup', applyFilters);