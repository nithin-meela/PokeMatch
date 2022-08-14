const pokeAPIBaseUrl = 'https://pokeapi.co/api/v2/pokemon/';

const colors = {
  fire: '#FDDFDF',
  grass: '#DEFDE0',
  electric: '#FCF7DE',
  water: '#DEF3FD',
  ground: '#f4e7da',
  rock: '#d5d5d4',
  fairy: '#fceaff',
  poison: '#98d7a5',
  bug: '#f8d5a3',
  dragon: '#97b3e6',
  psychic: '#eaeda1',
  flying: '#F5F5F5',
  fighting: '#E6E0D4',
  normal: '#F5F5F5',
};

const game = document.getElementById('game');

let isPaused = false;
let firstPick;
let matches;

const loadPokemon = async () => {
  const randomIds = new Set();
  while (randomIds.size < 8) {
    randomIds.add(Math.ceil(Math.random() * 150)); // Generating a random number and adding that to set
  }
  const pokePromises = [...randomIds].map((id) => fetch(pokeAPIBaseUrl + id));
  const response = await Promise.all(pokePromises);
  const pokemon = await Promise.all(response.map((res) => res.json()));
  return pokemon;
};

const displayPokemon = (pokemon) => {
  pokemon.sort((_) => Math.random() - 0.5);
  const pokemonHtml = pokemon
    .map((pokemon) => {
      const type = pokemon.types[0]?.type?.name || 'normal';
      const color = colors[type];
      return `
        <div class="card" style="background-color:${color}" onclick="clickCard(event)" data-pokename="${pokemon.name}">
            <div class="front">
            </div>
            <div class="back rotated" style="background-color:${color}">
                <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}"/>
                <h3>${pokemon.name}</h3>
            </div>
        </div>
        `;
    })
    .join('');
  //   console.log(pokemonHtml);
  game.innerHTML = pokemonHtml;
};

const clickCard = (event) => {
  const pokemonCard = event.currentTarget;
  const [front, back] = getFrontAndBack(pokemonCard);
  if (front.classList.contains('rotated') || isPaused) return;
  isPaused = true;
  rotateElements([front, back]);
  if (!firstPick) {
    firstPick = pokemonCard;
    isPaused = false;
  } else {
    const secondPokemonName = pokemonCard.dataset.pokename;
    const firstPokemonName = firstPick.dataset.pokename;
    if (firstPokemonName != secondPokemonName) {
      const [fFront, fBack] = getFrontAndBack(firstPick);
      setTimeout(() => {
        rotateElements([front, back, fFront, fBack]);
        firstPick = null;
        isPaused = false;
      }, 500);
    } else {
      matches++;
      if (matches === 8) {
        alert('CONGRATUATIONS YOU WON!');
        resetGame();
      }
      firstPick = null;
      isPaused = false;
    }
  }
};

const getFrontAndBack = (card) => {
  const front = card.querySelector('.front');
  const back = card.querySelector('.back');
  return [front, back];
};

const resetGame = async () => {
  game.innerHTML = '';
  isPaused = true;
  firstPick = null;
  matches = 0;
  setTimeout(async () => {
    const loadedPokemon = await loadPokemon();
    displayPokemon([...loadedPokemon, ...loadedPokemon]);
    isPaused = false;
  }, 200);
};

const rotateElements = (elements) => {
  if (typeof elements != 'object' || !elements.length) return;
  elements.forEach((element) => {
    element.classList.toggle('rotated');
  });
};

resetGame();
