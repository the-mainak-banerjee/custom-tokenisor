class GPTTokenizer {
  constructor() {
    this.vocab = {
      // Single characters
      ...Object.fromEntries(
        Array.from({ length: 256 }, (_, i) => [String.fromCharCode(i), i])
      ),
      // Common words and subwords
      " the": 256,
      " a": 257,
      " in": 258,
      " of": 259,
      " to": 260,
      ing: 261,
      ed: 262,
      ly: 263,
      er: 264,
      est: 265,
      // Some whole words
      hello: 266,
      world: 267,
      token: 268,
      izer: 269,
      // Special tokens
      "<|endoftext|>": 270,
    };

    this.inverseVocab = Object.fromEntries(
      Object.entries(this.vocab).map(([k, v]) => [v, k])
    );
  }

  encodeWord(text) {
    let tokens = [];
    let current = "";

    text = " " + text.toLowerCase();

    for (let char of text) {
      current += char;
      if (!(current in this.vocab)) {
        let found = false;
        for (let i = current.length - 1; i > 0; i--) {
          const substr = current.slice(0, i);
          if (substr in this.vocab) {
            tokens.push(this.vocab[substr]);
            current = current.slice(i);
            found = true;
            break;
          }
        }
        if (!found) {
          for (let byte of new TextEncoder().encode(current)) {
            tokens.push(byte);
          }
          current = "";
        }
      }
    }

    if (current in this.vocab) {
      tokens.push(this.vocab[current]);
    }
    return tokens.join("");
  }

  encode(sentence) {
    const words = sentence.split(/\s+/);
    const tokensMapping = words.flatMap((word) => {
      const token = this.encodeWord(word);
      return { token: token, word: word };
    });
    return tokensMapping;
  }

  decode(tokens) {
    return tokens.map((t) => this.inverseVocab[t]).join("");
  }
}

const inputText = document.getElementById("inputText");
const outputText = document.getElementById("outputText");
const tokenizeButton = document.getElementById("tokenizeButton");

console.log(
  "Welcome to the GPT Tokenizer! Enter text to see how it tokenizes words and characters."
);

tokenizeButton.addEventListener("click", async () => {
  console.log("clicked");
  const text = inputText.value;
  if (!text) {
    outputText.value = "Please enter some text to convert.";
    return;
  }
  const tokenizer = new GPTTokenizer();
  const tokensMapping = tokenizer.encode(text);
  const texts = tokensMapping.map((item) => item.word).join(", ");
  const tokens = tokensMapping.map((item) => item.token).join(", ");
  outputText.value = `Words: ${texts}\nTokens: ${tokens}`;
});
