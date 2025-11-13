/* Aquí va la lógica para dar funcionalidad al botón de "Aplicar" */
const jobListingSection = document.querySelector('.jobs-listings');

jobListingSection?.addEventListener('click', (e) => {
    const element = e.target;

    if (element.classList.contains('button-apply-job')) {
        element.textContent = '¡Aplicado!';
        element.disabled = true;
        element.classList.add('is-applied');
    }
});