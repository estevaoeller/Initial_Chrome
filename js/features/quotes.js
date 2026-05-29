const PREMIUM_QUOTES = [
  { text: 'A persistência é o caminho do êxito.', author: 'Charles Chaplin' },
  {
    text: 'A simplicidade é o último grau de sofisticação.',
    author: 'Leonardo da Vinci',
  },
  {
    text: 'Foque no caminho, não no destino. A alegria está no esforço, não apenas no resultado.',
    author: 'Provérbio Zen',
  },
  {
    text: 'Seja você a mudança que deseja ver no mundo.',
    author: 'Mahatma Gandhi',
  },
  {
    text: 'A melhor maneira de prever o futuro é criá-lo.',
    author: 'Peter Drucker',
  },
  { text: 'Feito é melhor que perfeito.', author: 'Sheryl Sandberg' },
  {
    text: 'Comece onde você está. Use o que você tem. Faça o que puder.',
    author: 'Arthur Ashe',
  },
  { text: 'Não conte os dias, faça os dias contarem.', author: 'Muhammad Ali' },
  {
    text: 'A vida é 10% o que acontece a você e 90% como você reage a isso.',
    author: 'Charles R. Swindoll',
  },
  {
    text: 'Tudo o que um sonho precisa para ser realizado é alguém que acredite nele.',
    author: 'Roberto Shinyashiki',
  },
  {
    text: 'Grandes coisas são feitas de uma série de pequenas coisas reunidas.',
    author: 'Vincent van Gogh',
  },
  {
    text: 'A jornada de mil milhas começa com um único passo.',
    author: 'Lao Tzu',
  },
  {
    text: 'Produtividade nunca é um acidente. É sempre o resultado de compromisso com a excelência.',
    author: 'Paul J. Meyer',
  },
  {
    text: 'Obstáculos são aquelas coisas assustadoras que você vê quando desvia os olhos da sua meta.',
    author: 'Henry Ford',
  },
  {
    text: "Não espere. O tempo nunca será o 'momento certo'.",
    author: 'Napoleon Hill',
  },
];

export class QuotesManager {
  constructor() {
    this.containerEl = null;
    this.textEl = null;
    this.authorEl = null;
  }

  init() {
    this.containerEl = document.getElementById('quote-widget');
    this.textEl = document.getElementById('quote-text');
    this.authorEl = document.getElementById('quote-author');

    if (!this.containerEl || !this.textEl || !this.authorEl) {
      console.warn('Elementos do Widget de Citações não encontrados no DOM.');
      return;
    }

    // On click, show a new quote
    this.containerEl.addEventListener('click', () => this.showRandomQuote());

    // Show initial quote
    this.showRandomQuote();
  }

  showRandomQuote() {
    // Smooth transition effect
    this.containerEl.classList.add('quote-fade-out');

    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * PREMIUM_QUOTES.length);
      const quote = PREMIUM_QUOTES[randomIndex];

      this.textEl.textContent = `“${quote.text}”`;
      this.authorEl.textContent = quote.author;

      this.containerEl.classList.remove('quote-fade-out');
      this.containerEl.classList.add('quote-fade-in');

      setTimeout(() => {
        this.containerEl.classList.remove('quote-fade-in');
      }, 300);
    }, 300);
  }
}
