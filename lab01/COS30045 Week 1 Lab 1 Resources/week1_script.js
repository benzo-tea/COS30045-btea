function showImage(year) {
    const img = document.getElementById('data-visualisation');
    const caption = document.getElementById('caption');
    if (year === '2019') {
        img.src = 'images/pet_ownership_2019.png';
        img.alt = 'Pet ownership data in 2019';
        caption.innerHTML = 'Pet ownership in 2019. Data Source: ' +
            '<a href="https://animalmedicinesaustralia.org.au/wp-content/uploads/2021/08/AMAU005-PATP-Report21_v1.41_WEB.pdf">Animal Medicines Report Australia</a>';
    } else if (year === '2021') {
        img.src = 'images/pet_ownership_2021.png';
        img.alt = 'Pet ownership data in 2021';
        caption.innerHTML = 'Pet ownership in 2021. Data Source: ' +
            '<a href="https://animalmedicinesaustralia.org.au/wp-content/uploads/2021/08/AMAU005-PATP-Report21_v1.41_WEB.pdf">Animal Medicines Report Australia</a>';
    } else if (year === 'both') {
        img.src = 'images/pet_ownership_comparison.png';
        img.alt = 'Comparison of pet ownership data in 2019 and 2021';
        caption.innerHTML = 'Comparison of pet ownership in 2019 and 2021. Data Source: ' +
            '<a href="https://animalmedicinesaustralia.org.au/wp-content/uploads/2021/08/AMAU005-PATP-Report21_v1.41_WEB.pdf">Animal Medicines Report Australia</a>';
    }
}