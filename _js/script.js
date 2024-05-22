const pokemonName = document.querySelector('.pokemon_name');
const pokemonNumber = document.querySelector('.pokemon_number');
const pokemonImage = document.querySelector('.pokemon_image');
const pokemonDescricao = document.querySelector('.pokemon_desc');
const pokemonTipo = document.querySelector('.pokemon_tipo');

const form = document.querySelector('.form');
const input = document.querySelector('.input_search');
const buttonPrev = document.querySelector('.btn-prev');
const buttonNext = document.querySelector('.btn-next');
const buttonReview = document.querySelector('.btn-review');
const buttonUpload = document.querySelector('.btn-upload');
const fileInput = document.querySelector('.fileInput');

let searchPokemon = 1;
let userUploadedImages = JSON.parse(localStorage.getItem('userUploadedImages')) || {};
let currentPokemonImage = '';

const fetchPokemon = async (pokemon) => {
    const APIResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon}`);
    if (APIResponse.status === 200) {
        const data = await APIResponse.json();
        return data;
    }
};

const fetchPokemonSpecies = async (pokemonId) => {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemonId}/`);
    if (response.ok) {
        const data = await response.json();
        return data;
    } else {
        console.error('Erro ao buscar dados da espécie do Pokémon:', response.status);
        return null;
    }
};

const renderPokemon = async (pokemon) => {
    pokemonName.innerHTML = 'Loading...';
    pokemonNumber.innerHTML = '';

    const data = await fetchPokemon(pokemon);
    if (data) {
        pokemonImage.style.display = 'block';
        pokemonName.innerHTML = data.name;
        pokemonNumber.innerHTML = data.id;
        pokemonTipo.innerHTML = 'TYPE: ' + data.types.map(type => type.type.name.toUpperCase()).join(', ');

        currentPokemonImage = data['sprites']['other']['home']['front_default'];
        buttonReview.addEventListener('click', () => {
            pokemonImage.src = currentPokemonImage;
        });

        const speciesData = await fetchPokemonSpecies(data.id);
        if (speciesData) {
            const description = speciesData.flavor_text_entries.find(
                entry => entry.language.name === 'en'
            );
            if (description) {
                pokemonDescricao.textContent = description.flavor_text.replace(/[^a-zA-Z0-9.,!?À-ÖØ-öø-ÿ\s']/g, '');
            } else {
                pokemonDescricao.textContent = 'Descrição não disponível.';
            }
        } else {
            pokemonDescricao.textContent = 'Descrição não disponível.';
        }

        searchPokemon = data.id;

        if (userUploadedImages[searchPokemon]) {
            pokemonImage.src = userUploadedImages[searchPokemon];
            buttonReview.addEventListener('click', () => {
            pokemonImage.addEventListener('mouseenter', handleMouseEnter);
            pokemonImage.addEventListener('mouseleave', handleMouseLeave);})
        } else {
            pokemonImage.src = './_imagens/images.png';
            pokemonImage.removeEventListener('mouseenter', handleMouseEnter);
            pokemonImage.removeEventListener('mouseleave', handleMouseLeave);
        }
    } else {
        pokemonImage.style.display = 'none';
        pokemonName.innerHTML = 'Not Found :C';
        pokemonNumber.innerHTML = '';
    }
};

const handleMouseEnter = () => {
    pokemonImage.style.transition = 'opacity 0.5s';
    pokemonImage.style.opacity = 0;
    setTimeout(() => {
        pokemonImage.src = userUploadedImages[searchPokemon];
        pokemonImage.style.opacity = 1;
    }, 500);
};

const handleMouseLeave = () => {
    pokemonImage.style.transition = 'opacity 0.5s';
    pokemonImage.style.opacity = 0;
    setTimeout(() => {
        pokemonImage.src = currentPokemonImage;
        pokemonImage.style.opacity = 1;
    }, 500);
};

form.addEventListener('submit', (event) => {
    event.preventDefault();
    renderPokemon(input.value.toLowerCase());
    input.value = '';
});

buttonPrev.addEventListener('click', () => {
    if (searchPokemon > 1) {
        searchPokemon -= 1;
        renderPokemon(searchPokemon);
    }
});

buttonNext.addEventListener('click', () => {
    searchPokemon += 1;
    renderPokemon(searchPokemon);
});

buttonUpload.addEventListener('click', () => {
    fileInput.click();
});

fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            userUploadedImages[searchPokemon] = e.target.result;
            localStorage.setItem('userUploadedImages', JSON.stringify(userUploadedImages));
            pokemonImage.src = userUploadedImages[searchPokemon];
            pokemonImage.addEventListener('mouseenter', handleMouseEnter);
            pokemonImage.addEventListener('mouseleave', handleMouseLeave);
        };
        reader.readAsDataURL(file);
    }
});

renderPokemon(searchPokemon);

