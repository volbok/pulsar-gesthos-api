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
  console.log("ENVIADO ARRAY COM JSONS");
  var obj = {
    credenciais: {
      empresa: "13.025.354/0001-32",
      usuario: "AABBCCDD",
      password: "AABBCCDD",
    },
    registro: [
      {
        documento: {
          data: "01/03/2023",
          hora: "00:03:06",
          prontuario: "111",
          atendimento: "111",
          grupo: "01 - GRUPO DADOS VITAIS E CONTROLES",
          item: "0101 - PAS",
          valor: "120",
        },
      },
      {
        documento: {
          data: "01/03/2023",
          hora: "00:03:06",
          prontuario: "111",
          atendimento: "111"
          ,
          grupo: "01 - GRUPO DADOS VITAIS E CONTROLES",
          item: "0102 - PAD",
          valor: "80",
        },
      },
    ],
  };

  axios
    .post(html + "txt_assistencial", obj)
    .then(() => {
      console.log("ENVIADO! " + JSON.stringify(obj));
    })
    .catch((err) => console.log(err));
};

//setInterval(() => {
console.log('CRIANDO DADOS DE TESTE.');
// criandoJsonAtendimento();
criandoJsonAssistencial();
//}, 2000);