/* Aquí va la lógica para mostrar los resultados de búsqueda */
const container = document.querySelector('.jobs-listings');

fetch('./data.json')
  .then(response => response.json())
  .then(jobs => {
    console.log(jobs);
    // Render job listings

    /* 
    Creamos un DocumentFragment para mejorar el rendimiento.
    En lugar de agregar cada trabajo directamente al DOM (lo que haría que el navegador redibuje la página múltiples veces), guardamos todos los elementos en memoria primero. Al final, agregamos todo de una sola vez.
    
    Es como preparar todos los platos en la cocina antes de llevarlos a la mesa, en vez de hacer un viaje por cada plato, llevamos todos juntos, y es mejor :)

    Esto viene muy bien cuando tenemos muchos elementos que agregar al DOM.
    Esto no se dió directamente en los videos, pero creemos que es algo bueno de aplicar cuando estamos trabajando con muchos elementos, y por consecuencia, con mucho redibujado.
    */
    const fragment = document.createDocumentFragment();

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
      fragment.appendChild(article);
    });

    container.appendChild(fragment);
  })
  .catch(error => {
    console.error('Error fetching job data:', error);
  });