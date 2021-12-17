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
    updateCharCounting(text.length - 1);
    updateWordCouting(text.split(" ").length);
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

function atualizarBarraDePontuacao(pontos) {
  const barPontuacao = document.querySelector(".pontuacao");
  const circlePontuacao = document.querySelector(".pontuacao .circle");
  const numeroPontuacao = document.querySelector(".pontuacao .circle strong");

  numeroPontuacao.innerHTML = pontos

  if(pontos >= 0 || pontos < 50){
    barPontuacao.classList.add('red');
    circlePontuacao.classList.add('red');
  } else if(pontos >= 50 || pontos < 70){
    barPontuacao.classList.add('orange');
    circlePontuacao.classList.add('orange');
  } else {
    barPontuacao.classList.add('grenn');
    circlePontuacao.classList.add('grenn');
  }

  barPontuacao.style.width = `${pontos}%`
}

function atualizarChecks(checks){
  const elementos = document.querySelectorAll(".check");

  elementos.forEach(el => {
    if(el.classList.contains('h5') || el.classList.contains('h6')){
      el.classList.add('orange')
    } else { 
      el.classList.add('red')
    }
  })
  
  const allChecks = [];
  checks.forEach(el => {
    const query = `.check.${el}`;
    const check = document.querySelector(query)

    allChecks.push(check)
  });

  console.log(allChecks, 'checks');

  allChecks.forEach(el => {
    el.classList.remove('red');
    el.classList.remove('orange');
    el.classList.add('green');
  })

}

function renderizarResultado(pontos, checks){
  atualizarBarraDePontuacao(pontos)
  atualizarChecks(checks)
}

// ACIONAMENTO DO BOTÃO
function analisarTexto() {
  const editor = document.querySelector(".ql-editor");
  const numeroDePalavras = quill.getText().split(" ").length;
  const palavraChave = document.querySelector(".palavra-chave").value;
  console.log(editor);
  const texto = editor.innerHTML;

  if (!texto) return alert("Digite algum texto para ser analisado.");
  if (!palavraChave) return alert("Digite uma palavra chave");

  const { pontos, checks } = checarConteudo(texto, numeroDePalavras, palavraChave);

  renderizarResultado(pontos, checks)
}

function checarConteudo(texto, numeroDePalavras, palavraChave) {
  let pontos = 0;
  const checks = []

  Object.keys(valoresDePontuacao).forEach((key) => {
    console.log(key, pontos);

    if(key === 'Atributos de imagem' && texto.includes("<img")){
      pontos += valoresDePontuacao[key];
      checks.push('imagem')
      return;
    }

    // Negrito
    if (
      key === "Negrito na palavra chave" &&
      (texto.includes("<strong>" + palavraChave + "</strong>") ||
      texto.includes("<strong><em>" + palavraChave + "</em></strong>") )
    ) {
      pontos += valoresDePontuacao[key];
      checks.push('negrito')
      return;
    }

    // Itálico
    if (
      key === "Itálico na palavra chave" &&
      (texto.includes("<em>" + palavraChave + "</em>") ||
      texto.includes("<em><strong>" + palavraChave + "</strong></em>"))
    ) {
      pontos += valoresDePontuacao[key];
      checks.push('italico')
      return;
    }

    // 1000 palavras
    if (key === "Mais de 1000 palavras" && numeroDePalavras >= 1000) {
      pontos += valoresDePontuacao[key];
      checks.push('palavras')
      return;
    }

    if(key === "Link" && texto.includes('<a href=')){
      pontos += valoresDePontuacao[key];
      checks.push('link')
      return;
    }

    // Listas
    if(key === "Lista não ordenada" && texto.includes('<ul>')){
      pontos += valoresDePontuacao[key];
      checks.push('ul')
      return;
    }
    if(key === "Lista ordenada" && texto.includes('<ol>')){
      pontos += valoresDePontuacao[key];
      checks.push('ol')
      return;
    }

    if(key === 'Palavra chave em foco'){
      const numeroDeOcorrencias = texto.split(' ').filter(palavra => palavra === palavraChave).length;

      const porcentagemDeOcorrencias = (numeroDeOcorrencias * numeroDePalavras) / 100
      console.log(porcentagemDeOcorrencias);

      if(porcentagemDeOcorrencias <= 5 && porcentagemDeOcorrencias >= 1){
        pontos += valoresDePontuacao[key];
        checks.push('foco')
        return;
        }
    }

    // Títulos
    if (texto.includes(key)) {
      pontos += valoresDePontuacao[key];
      checks.push(key)
      return;
    }

    
  });
  
  return {
    pontos,
    checks,
  };
}

// VARIÁVEL CONTENDO PONTUAÇÕES
const valoresDePontuacao = {
  'h1': 20,
  'h2': 15,
  'h3': 10,
  'h4': 5,
  'h5': 0,
  'h6': 0,
  "Negrito na palavra chave": 5,
  "Itálico na palavra chave": 2,
  "Atributos de imagem": 3,
  "Lista ordenada": 3,
  "Lista não ordenada": 2,
  'Link': 10,
  "Mais de 1000 palavras": 15,
  "Palavra chave em foco": 10,
};
