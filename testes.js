const axios = require("axios");

// let html = "https://pulsar-gesthos-api.up.railway.app/";
let html = "http://localhost:3333/";

const criandoJsonAtendimento = () => {
  console.log("ENVIADO ARRAY COM JSONS");
  var obj = {
    credenciais: {
      empresa: "13.025.354/0001-32",
      usuario: "AABBCCDD",
      password: "AABBCCDD",
    },
    pacientes: [
      {
        internacao: {
          data: "05/03/2026",
          hora: "01:37:04",
          prontuario: "112",
          atendimento: "112",
          paciente: "PACIENTE 2026 - 31MAR26",
          sexo: "F",
          nascimento: "01/01/1956",
          unidadeinternacao: "C. T. I.  01",
          leito: "112",
        },
      },
      {
        alta: {
          data: "05/02/2023",
          hora: "01:37:04",
          prontuario: "222",
          atendimento: "222",
          paciente: "PACIENTE 222",
          sexo: "F",
          nascimento: "01/01/1911",
          unidadeinternacao: "C. T. I.  01",
          leito: "222",
        },
      },
    ],
  };
  axios
    .post(html + "txt_atendimento", obj)
    .then(() => {
      console.log("ENVIADO! " + JSON.stringify(obj));
    })
    .catch((err) => console.log(err));
};

const criandoJsonAssistencial = () => {
  function sanitizeBrokenJson(raw) {
    let result = '';
    let inString = false;
    let escaped = false;
    for (let i = 0; i < raw.length; i++) {
      let char = raw[i];
      // controla entrada/saída de string JSON
      if (char === '"' && !escaped) {
        inString = !inString;
      }
      if (inString) {
        // corrige CR/LF reais
        if (char === '\n') {
          result += '\\n';
          continue;
        }
        if (char === '\r') {
          result += '\\r';
          continue;
        }
        if (char === '\t') {
          result += '\\t';
          continue;
        }
        // remove outros control chars invisíveis
        if (char.charCodeAt(0) < 32) {
          continue;
        }
      }
      // controle de escape
      escaped = char === '\\' && !escaped;
      result += char;
    }
    return result;
  }

  const fs = require('fs');
  const raw = fs.readFileSync('./brokenjson.json', 'utf8');
  try {
    JSON.parse(raw);
    console.log('JSON original válido');
  } catch (e) {
    console.log('JSON original INVÁLIDO');
    console.log(e.message);
  }

  const sanitized = sanitizeBrokenJson(raw).replace(/,\s*([\]}])/g, '$1');

  try {
    const parsed = JSON.parse(sanitized);
    console.log('JSON sanitizado válido');
    console.log(JSON.stringify(parsed));
  } catch (e) {
    console.error('Ainda inválido');
    console.error(e.message);
  }

  const obj = sanitized;
  console.log(sanitized);

  
  axios
    .post(html + "txt_assistencial", JSON.stringify(sanitized))
    .then(() => {
      console.log("ENVIADO! " + JSON.stringify(sanitized));
    })
    .catch((err) => console.log(err));
  

};

//setInterval(() => {
// console.log('CRIANDO DADOS DE TESTE.');
// criandoJsonAtendimento();
criandoJsonAssistencial();
//}, 2000);