<h1>DOCUMENTAÇÃO PARA INTEGRAÇÃO GESTHOS + PULSAR</h1>

<h2>GESTHOS</h2>
Uma aplicação criada no ambiente GestHos consumirá a endpoint http://pulsar-gesthos-api.up.railway.app/gesthos_pacientes, encaminhando pelo método POST, em intervalos regulares, uma array de JSONs contendo informações referentes aos atendimentos.

**Exemplo da aplicação em JavaScript:**

    const axios = require("axios");

    const criandoJson = () => {
      console.log('ENVIADO ARRAY COM JSONS');
      var obj =
      {
        "pacientes": [
          {
            "internacao": {
              "data": "05/02/2023",
              "hora": "00:21:48",
              "prontuario": "304574",
              "atendimento": "1475486",
              "paciente": "LENI APARECIDA DE SOUZA MIGUEL",
              "sexo": "F",
              "nascimento": "28/10/1960",
              "unidadeinternacao": "C. T. I.  03",
              "leito": "19"
            }
          },
          {
            "internacao": {
              "data": "05/02/2023",
              "hora": "01:37:04",
              "prontuario": "340012",
              "atendimento": "1487506",
              "paciente": "ANA PAULA FERNANDES FIGUEIREDO",
              "sexo": "F",
              "nascimento": "02/10/1980",
              "unidadeinternacao": "C. T. I.  01",
              "leito": "10"
            }
          },
          {
            "alta": {
              "data": "05/02/2023",
              "hora": "05:44:54",
              "prontuario": "339302",
              "atendimento": "1481177",
              "paciente": "NATAIR ROSA DE JESUS",
              "sexo": "F",
              "nascimento": "29/08/1926",
              "unidadeinternacao": "C. T. I.  03",
              "leito": "2"
            }
          }
        ]
      }
      axios.post('http://pulsar-gesthos-api.up.railway.app/gesthos_pacientes', obj).then(() => {
      }).catch((err) => console.log(err));
    }

    setInterval(() => {
      criandoJson();
    }, 3000);

OBS.: esta aplicação está disponível para uso, se necessário.

<h2>PULSAR</h2>
A API criada no ambiente Pulsar (api Pulsar) declara a endpoint http://pulsar-gesthos-api.up.railway.app/gesthos_pacientes. Como explicado acima, quando o robô Gesthos consome esta endpoint, é retornada uma array de JSONs que será armazenada na API pulsar, e posteriormente acessada pelo FrontEnd, pelo método GET, via endpoint http://pulsar-gesthos-api.up.railway.app/pulsar_pacientes.

**Fragmento do código da api Pulsar (Web Server) explicitando a integração.**

    // ## INTEGRAÇÃO GESTHOS ## //
    // recebendo dados dos atendimentos (robô Gesthos >> api Pulsar).
    let atendimentos = [];
    app.post("/gesthos_atendimentos", (req, res) => {
      atendimentos = req.body;
      console.log(atendimentos);
    });

    // entregando ao Front Pulsar os dados (api Pulsar >> front Pulsar).
    app.get("/pulsar_atendimentos", (req, res) => {
      if (atendimentos == []) {
        console.log('SEM INFORMAÇÕES')
      } else {
        res.send(atendimentos);
      }
    });
