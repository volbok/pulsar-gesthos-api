<h1>DOCUMENTAÇÃO PARA INTEGRAÇÃO GESTHOS + PULSAR</h1>

<h2>GESTHOS</h2>

<h3>ATENDIMENTOS</h3>
Uma aplicação criada no ambiente GestHos consumirá a endpoint https://pulsar-gesthos-api.up.railway.app/txt_atendimento, encaminhando pelo método POST, em intervalos regulares, um JSON contendo informações referentes aos atendimentos (registros de internação e de alta dos pacientes).

Para os atendimentos (registros de internações e altas), a estrutura JSON definida foi a demonstrada abaixo:

```js
{
  credenciais: {
    empresa: "13.025.354/0001-32",
    usuario: "AABBCCDD",
    password: "AABBCCDD",
  }
  pacientes: [
    {
      internacao: {
        data: "01/01/2023",
        hora: "01:00:00",
        prontuario: "111",
        atendimento: "111",
        paciente: "PACIENTE 111",
        sexo: "F",
        nascimento: "01/01/1911",
        unidadeinternacao: "C. T. I.  01",
        leito: "111",
      }
    },
    {
      alta: {
        data: "01/01/2023",
        hora: "02:00:00",
        prontuario: "222",
        atendimento: "222",
        paciente: "PACIENTE 222",
        sexo: "M",
        nascimento: "01/01/1922",
        unidadeinternacao: "C. T. I.  01",
        leito: "222",
      }
    }
  ]
};
```
<h3>ASSISTENCIAL</h3>
A mesma aplicação criada no ambiente GestHos consumirá a endpoint http://pulsar-gesthos-api.up.railway.app/txt_assistencial, encaminhando pelo método POST, em intervalos regulares, um JSON contendo informações referentes aos registros assistenciais (precauções, alergias, dados vitais, resultados de exames laboratoriais, dentre outros).

Para os dados assistenciais (sinais vitais, evoluções, resultados de exames, etc.), a estrutura JSON definida foi a demonstrada abaixo:

```js
{
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
          atendimento: "111",
          grupo: "01 - GRUPO DADOS VITAIS E CONTROLES",
          item: "0102 - PAD",
          valor: "80",
        },
      },
    ],
  };
```