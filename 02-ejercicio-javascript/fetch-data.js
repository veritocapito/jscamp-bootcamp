/* Aquí va la lógica para mostrar los resultados de búsqueda */
const container = document.querySelector('.jobs-listings');

fetch('./data.json')
  .then(response => response.json())
  .then(jobs => {
    console.log(jobs);
    // Render job listings
    const fragment = document.createDocumentFragment()

    jobs.forEach(job => {
      const article = document.createElement('article');
      article.className = 'job-listing-card';

      article.setAttribute('data-technology', job.data.technology);
      article.setAttribute('data-modalidad', job.data.modalidad);
      article.setAttribute('data-experience', job.data.nivel);
      
      article.innerHTML = `
        <div>
            <h3>${job.titulo}</h3>
            <small>${job.empresa} | ${job.ubicacion}</small>
            <p>${job.descripcion}</p>
        </div>
        <button class="button-apply-job">Aplicar</button>
      `;
      fragment.appendChild(article)
    });
    container.appendChild(fragment);
  })
  .catch(error => {
    console.error('Error fetching job data:', error);
  });