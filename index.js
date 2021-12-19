const inputPalavraChave = document.querySelector(".palavra-chave");

inputPalavraChave.addEventListener("input", (e) => {
  const text = quill.getText();
  updatePercentageCouting(text, text.split(" ").length);
});

let numeroDeTitulos = 0;

// CONFIGURAÇÕES DO EDITOR DE TEXTO
const quill = new Quill(".editor-de-texto", {
  theme: "snow",
  modules: {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ["bold", "italic", "underline", "strike"], // toggled buttons
      ["blockquote", "code-block"],
      [{ header: 1 }, { header: 2 }], // custom button values
      [{ list: "ordered" }, { list: "bullet" }],
      [{ script: "sub" }, { script: "super" }], // superscript/subscript
      [{ indent: "-1" }, { indent: "+1" }], // outdent/indent
      [{ direction: "rtl" }], // text direction
      [{ align: [] }],
    ],
  },
});

quill.on("text-change", function (delta, oldDelta, source) {
  const text = quill.getText();
  if (text === "") {
    updateCharCounting(0);
    updateWordCouting(0);
  } else {
    const numeroDePalavras = text.split(" ").length;
    updateCharCounting(text.length - 1);
    updateWordCouting(numeroDePalavras);
    updatePercentageCouting(text, numeroDePalavras);
  }
});

// RENDERIZÇÕES EM TELA
function updateCharCounting(numberOfChars) {
  const wordsCounter = document.querySelector(".char-counter");
  wordsCounter.innerHTML = numberOfChars + " ";
}
function updateWordCouting(numberOfWords) {
  const wordsCounter = document.querySelector(".word-counter");
  wordsCounter.innerHTML = numberOfWords + " ";
}
function updatePercentageCouting(texto, numberOfWords) {
  const focusCounter = document.querySelector(".focus-counter");
  const palavraChave = document.querySelector(".palavra-chave").value;

  const numeroDeOcorrencias = texto
    .split(" ")
    .filter((palavra) =>
      palavra.toLowerCase().includes(palavraChave.toLowerCase())
    ).length;

  const porcentagemDeOcorrencias = (numeroDeOcorrencias * 100) / numberOfWords;

  focusCounter.innerHTML = porcentagemDeOcorrencias.toFixed(2) + "%";
}

function atualizarBarraDePontuacao(pontos) {
  const barPontuacao = document.querySelector(".pontuacao");
  const circlePontuacao = document.querySelector(".pontuacao .circle");
  const numeroPontuacao = document.querySelector(".pontuacao .circle strong");

  numeroPontuacao.innerHTML = pontos;

  barPontuacao.classList.remove("orange");
  circlePontuacao.classList.remove("orange");
  barPontuacao.classList.remove("green");
  circlePontuacao.classList.remove("green");
  barPontuacao.classList.remove("red");
  circlePontuacao.classList.remove("red");

  if (pontos >= 0 && pontos <= 30) {
    barPontuacao.classList.add("red");
    circlePontuacao.classList.add("red");
  } else if (pontos > 30 && pontos < 90) {
    barPontuacao.classList.add("orange");
    circlePontuacao.classList.add("orange");
  } else {
    barPontuacao.classList.add("green");
    circlePontuacao.classList.add("green");
  }

  barPontuacao.style.width = `${pontos}%`;
}

function atualizarChecks(checks) {
  const elementos = document.querySelectorAll(".check");
  console.log(numeroDeTitulos);

  elementos.forEach((el) => {
    el.classList.remove("green");
    if (el.classList.contains("h5") || el.classList.contains("h6")) {
      el.classList.add("orange");
    } else if (el.classList.contains("h1") && numeroDeTitulos > 1) {
      el.classList.add("orange");
    } else {
      el.classList.add("red");
    }
  });

  const allChecks = [];
  checks.forEach((el) => {
    const query = `.check.${el}`;
    const check = document.querySelector(query);

    allChecks.push(check);
  });

  allChecks.forEach((el) => {
    el.classList.remove("red");
    el.classList.remove("orange");
    el.classList.add("green");
  });
}

function renderizarResultado(pontos, checks) {
  console.log(pontos, checks);
  atualizarBarraDePontuacao(pontos);
  atualizarChecks(checks);
}

// ACIONAMENTO DO BOTÃO
function analisarTexto() {
  const editor = document.querySelector(".ql-editor");
  const numeroDePalavras = quill.getText().split(" ").length;
  const palavraChave = document.querySelector(".palavra-chave").value;

  const texto = editor.innerHTML;

  if (!texto) return alert("Digite algum texto para ser analisado.");
  if (!palavraChave) return alert("Digite uma palavra chave");

  const { pontos, checks } = checarConteudo(
    texto.toLowerCase(),
    numeroDePalavras,
    palavraChave.toLowerCase()
  );

  renderizarResultado(pontos, checks);
}

function checarConteudo(texto, numeroDePalavras, palavraChave) {
  let pontos = 0;
  const checks = [];

  Object.keys(valoresDePontuacao).forEach((key) => {
    if (key === "Atributos de imagem" && texto.includes("<img")) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(texto, "text/html");
      const imgs = doc.querySelectorAll("img");

      let temPalavraChave = false;

      imgs.forEach((img) => {
        img.alt.includes(palavraChave) ? (temPalavraChave = true) : null;
      });

      if (temPalavraChave) {
        pontos += valoresDePontuacao[key];
        checks.push("imagem");
        return;
      }
    }

    // Negrito
    else if (key === "Negrito na palavra chave") {
      const parser = new DOMParser();
      const doc = parser.parseFromString(texto, "text/html");
      const strongs = doc.querySelectorAll("strong");

      let temPalavraChave = false;

      strongs.forEach((strong) => {
        strong.innerHTML.includes(palavraChave)
          ? (temPalavraChave = true)
          : null;
      });

      if (temPalavraChave) {
        pontos += valoresDePontuacao[key];
        checks.push("negrito");
        return;
      }
    }

    // Itálico
    else if (key === "Itálico na palavra chave") {
      const parser = new DOMParser();
      const doc = parser.parseFromString(texto, "text/html");
      const ems = doc.querySelectorAll("em");

      let temPalavraChave = false;

      ems.forEach((em) => {
        em.innerHTML.includes(palavraChave) ? (temPalavraChave = true) : null;
      });

      if (temPalavraChave) {
        pontos += valoresDePontuacao[key];
        checks.push("italico");
        return;
      }
    }

    // 1000 palavras
    else if (key === "Mais de 1000 palavras" && numeroDePalavras >= 1000) {
      pontos += valoresDePontuacao[key];
      checks.push("palavras");
      return;
    } else if (key === "Link" && texto.includes("<a href=")) {
      pontos += valoresDePontuacao[key];
      checks.push("link");
      return;
    }

    // Listas
    else if (key === "Lista não ordenada" && texto.includes("<ul>")) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(texto, "text/html");
      const lis = doc.querySelectorAll("ul li");

      let temPalavraChave = false;

      lis.forEach((li) => {
        li.innerHTML.toLowerCase().includes(palavraChave.toLowerCase())
          ? (temPalavraChave = true)
          : null;
      });

      if (temPalavraChave) {
        pontos += valoresDePontuacao[key];
        checks.push("ul");
        return;
      }
    } else if (key === "Lista ordenada" && texto.includes("<ol>")) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(texto, "text/html");
      const lis = doc.querySelectorAll("ol li");

      let temPalavraChave = false;

      lis.forEach((li) => {
        li.innerHTML.toLowerCase().includes(palavraChave.toLowerCase())
          ? (temPalavraChave = true)
          : null;
      });

      if (temPalavraChave) {
        pontos += valoresDePontuacao[key];
        checks.push("ol");
        return;
      }
    } else if (key === "Palavra chave em foco") {
      const numeroDeOcorrencias = texto
        .split(" ")
        .filter((palavra) =>
          palavra.toLowerCase().includes(palavraChave.toLowerCase())
        ).length;

      const porcentagemDeOcorrencias =
        (numeroDeOcorrencias * 100) / numeroDePalavras;

      if (porcentagemDeOcorrencias <= 5 && porcentagemDeOcorrencias >= 1) {
        pontos += valoresDePontuacao[key];
        checks.push("foco");
        return;
      }
    }

    // Títulos
    else if (texto.includes("<" + key + ">")) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(texto, "text/html");
      const titles = doc.querySelectorAll(key);

      let temPalavraChave = false;
      console.log(temPalavraChave, "aqui");

      titles.forEach((el) => {
        if (el.innerHTML.toLowerCase().includes(palavraChave.toLowerCase())) {
          temPalavraChave = true;
        }
      });

      if (temPalavraChave) {
        pontos += valoresDePontuacao[key];
        if (key === "h1" && titles.length > 1) {
          numeroDeTitulos = titles.length;
        } else {
          checks.push(key);
        }

        return;
      }
    }
  });

  return {
    pontos,
    checks,
  };
}

// VARIÁVEL CONTENDO PONTUAÇÕES
const valoresDePontuacao = {
  h1: 20,
  h2: 15,
  h3: 10,
  h4: 5,
  h5: 0,
  h6: 0,
  "Negrito na palavra chave": 5,
  "Itálico na palavra chave": 2,
  "Atributos de imagem": 3,
  "Lista ordenada": 3,
  "Lista não ordenada": 2,
  Link: 10,
  "Mais de 1000 palavras": 15,
  "Palavra chave em foco": 10,
};
