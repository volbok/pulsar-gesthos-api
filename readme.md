<h1>DOCUMENTAÇÃO PARA INTEGRAÇÃO GESTHOS + PULSAR</h1>

<h2>GESTHOS</h2>

<h3>ATENDIMENTOS</h3>
Uma aplicação criada no ambiente GestHos consumirá a endpoint http://pulsar-gesthos-api.up.railway.app/gesthos_atendimentos, encaminhando pelo método POST, em intervalos regulares, um JSON contendo informações referentes aos atendimentos (registros de internação e de alta dos pacientes).

<h3>ASSISTENCIAL</h3>
A mesma aplicação criada no ambiente GestHos consumirá a endpoint http://pulsar-gesthos-api.up.railway.app/gesthos_assistencial, encaminhando pelo método POST, em intervalos regulares, um JSON contendo informações referentes aos registros assistenciais (precauções, alergias, dados vitais, resultados de exames laboratoriais, dentre outros).

**Exemplo da aplicação em JavaScript:**

```js
const axios = require("axios");

let html = "https://pulasr-gesthos-api.herokuapp.com/";
// let html = 'http://localhost:3333/'

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
          data: "05/02/2023",
          hora: "01:37:04",
          prontuario: "111",
          atendimento: "111",
          paciente: "PACIENTE 111",
          sexo: "F",
          nascimento: "01/01/1911",
          unidadeinternacao: "C. T. I.  01",
          leito: "111",
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
    .post(html + "gesthos_atendimentos", obj)
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
          atendimento: "111",
          grupo: "01 - GRUPO DADOS VITAIS E CONTROLES",
          item: "0102 - PAD",
          valor: "80",
        },
      },
    ],
  };

  axios
    .post(html + "gesthos_assistencial", obj)
    .then(() => {
      console.log("ENVIADO! " + JSON.stringify(obj));
    })
    .catch((err) => console.log(err));
};

setInterval(() => {
  criandoJsonAtendimento();
  criandoJsonAssistencial();
}, 20000);
```

OBS.: esta aplicação é utilizada por mim para testes, e apenas ilustra como se comporta o Robô Gesthos.

<h2>PULSAR</h2>

<h3>ATENDIMENTOS</h3>
A API criada no ambiente Pulsar (API Pulsar) declara a endpoint http://pulsar-gesthos-api.up.railway.app/gesthos_atendimentos. Como explicado acima, quando o robô Gesthos consome esta endpoint, é retornado um JSON que será imediatamente tratado na API pulsar.

Os objetos retornados são aninhados com as propriedades credenciais e pacientes no primeiro nível, e os objetos de atendimento propriamente ditos estão na array contida na propriedade pacientes. Cada objeto da array, por sua vez, está aninhado nas propriedades de internação ou de alta. Observe o JSON abaixo:

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

Este aninhamento complexo do JSON exigiu a criação de funções capaz de modificar cada objeto recebido (**createObjInternacao** e **createObjAlta**), incluindo as propriedades de situação (internação ou alta) e de data como timestamp (essencial para que fosse possível aplicar o .sort() na nova array de objetos).

```js
const createObjInternacao = (item) => {
  var obj = {
    situacao: "internacao",
    data: moment(item.data + " " + item.hora, "DD/MM/YYYY HH:mm:ss"),
    prontuario: item.prontuario,
    atendimento: item.atendimento,
    paciente: item.paciente,
    sexo: item.sexo,
    nascimento: item.nascimento,
    unidadeinternacao: item.unidadeinternacao,
    leito: item.leito,
  };
  objetos.push(obj);
};
const createObjAlta = (item) => {
  var obj = {
    situacao: "alta",
    data: moment(item.data + " " + item.hora, "DD/MM/YYYY HH:mm:ss"),
    prontuario: item.prontuario,
    atendimento: item.atendimento,
    paciente: item.paciente,
    sexo: item.sexo,
    nascimento: item.nascimento,
    unidadeinternacao: item.unidadeinternacao,
    leito: item.leito,
  };
  objetos.push(obj);
};
resposta
  .filter((item) => item.hasOwnProperty("internacao") == true)
  .map((item) => createObjInternacao(item.internacao));
resposta
  .filter((item) => item.hasOwnProperty("alta") == true)
  .map((item) => createObjAlta(item.alta));
trataAtendimentos();
```

No código acima, resposta corresponde ao JSON recebido do robô Gesthos, já mapeado para a propriedade pacientes. As funções **createObjInternacao** e **createObjAlta** criam os objetos "aperfeiçoados" mencionados acima. Estes, por sua vez, são sortidos em ordem crescente de data, e logo em seguida a função **trataAtendimentos()** é chamada, mapeando esta nova array de objetos.

Sortir os novos objetos por ordem crescente de data é FUNDAMENTAL para o correto registro e exclusão de atendimentos no banco de dados Pulsar, como demonstrado na função trataAtendimentos() abaixo:

```js
const trataAtendimentos = () => {
  // mapeando os objetos sortidos por data e verificando se os mesmos já estão registrados no banco de dados.
  objetos
    .sort((a, b) => (moment(a.data) > moment(b.data) ? 1 : -1))
    .map((item) => {
      // console.log(objetos.sort((a, b) => moment(a.data) > moment(b.data) ? 1 : -1).map(item => moment(item.data).format('DD/MM/YYYY HH:mm')));
      // retornando todos os registros de atendimento no banco de dados.
      var sql = "SELECT * FROM gesthos_atendimento";
      pool.query(sql, (error, results) => {
        db_atendimentos = results.rows;
        /* 
      SITUAÇÃO 1:
      o objeto é uma internação,
      o objeto não tem registro prévio de atendimento no banco de dados,
      o objeto não tem um objeto de alta concorrente (mesmo atendimento) posterior.
      */
        if (
          item.situacao == "internacao" &&
          db_atendimentos.filter(
            (valor) => valor.atendimento == item.atendimento
          ).length == 0 &&
          objetos.filter(
            (valor) =>
              valor.situacao == "alta" &&
              valor.atendimento == item.atendimento &&
              moment(valor.data) > moment(item.data)
          ).length == 0
        ) {
          insertAtendimento(item);
          /*
        SITUAÇÃO 2:
        o objeto é uma internação,
        o objeto tem registro prévio de atendimento no banco de dados,
        o objeto tem um objeto de alta concorrente (mesmo atendimento) posterior.
        */
        } else if (
          item.situacao == "internacao" &&
          db_atendimentos.filter(
            (valor) => valor.atendimento == item.atendimento
          ).length > 0 &&
          objetos.filter(
            (valor) =>
              valor.situacao == "alta" &&
              valor.atendimento == item.atendimento &&
              moment(valor.data) > moment(item.data)
          ).length > 0
        ) {
          deleteAtendimento(item);
          /*
        SITUAÇÃO 3:
        o objeto é uma alta,
        o objeto tem registro prévio de atendimento no banco de dados,
        o objeto não tem um objeto de internação concorrente (mesmo atendimento) posterior.
        */
        } else if (
          item.situacao == "alta" &&
          db_atendimentos.filter(
            (valor) => valor.atendimento == item.atendimento
          ).length > 0 &&
          objetos.filter(
            (valor) =>
              valor.situacao == "internacao" &&
              valor.atendimento == item.atendimento &&
              moment(valor.data) > moment(item.data)
          ).length == 0
        ) {
          deleteAtendimento(item);
          /*
        SITUAÇÃO 4:
        o objeto é uma alta,
        o objeto tem registro prévio de atendimento no banco de dados,
        o objeto tem um objeto de internação concorrente (mesmo atendimento) posterior.
        */
        } else if (
          item.situacao == "alta" &&
          db_atendimentos.filter(
            (valor) => valor.atendimento == item.atendimento
          ).length > 0 &&
          objetos.filter(
            (valor) =>
              valor.situacao == "internacao" &&
              valor.atendimento == item.atendimento &&
              moment(valor.data) > moment(item.data)
          ).length > 0
        ) {
          let concorrente = objetos
            .filter(
              (valor) =>
                valor.situacao == "internacao" &&
                valor.atendimento == item.atendimento &&
                moment(valor.data) > moment(item.data)
            )
            .pop();
          console.log(concorrente);
          deleteAtendimento(item);
          insertAtendimento(concorrente);
        } else {
          console.log("NADA A SER FEITO");
        }
      });
    });
};
```

A função **trataAtendimentos()** executa as seguintes tarefas:

- Em cada map, recupera primeiro todos os registros de atendimento no banco de dados Pulsar.
- Verifica se o objeto mapeado está em situação de internação ou de alta.
- Verifica se o objeto mapeado tem algum registro correspondente no recém-verificado banco de dados Pulsar (registro de internação previamente armazenado, com o mesmo código de atendimento).
- Verifica se há algum outro "objeto aperfeiçoado" concorrente (objeto de internação ou de alta, com mesmo número de atendimento e data posterior).

Após a definição dessas condições, é seguido o seguinte algoritmo:

<h4>SITUAÇÃO 01:</h4>

1. É mapeado um objeto de internação.
2. A função verifica que não existe no banco de dados Pulsar qualquer registro de internação com o número de atendimento do objeto.
3. A função verifica também que não existe objeto de alta com mesmo número de atendimento e data posterior.
4. Ação: insere o objeto como registro de internação no banco de dados Pulsar.

<h4>SITUAÇÃO 02:</h4>

1. É mapeado um objeto de internação.
2. A função verifica que existe no banco de dados Pulsar um registro de internação com o número de atendimento do objeto.
3. A função verifica também que não existe objeto de alta com mesmo número de atendimento e data posterior.
4. Ação: nenhuma.

<h4>SITUAÇÃO 03:</h4>

1. É mapeado um objeto de internação.
2. A função verifica que não existe no banco de dados Pulsar qualquer registro de internação com o número de atendimento do objeto.
3. A função verifica também que existe um objeto de alta com mesmo número de atendimento e data posterior.
4. Ação: nenhuma.

<h4>SITUAÇÃO 04:</h4>

1. É mapeado um objeto de internação.
2. A função verifica que existe no banco de dados Pulsar um registro de internação com o número de atendimento do objeto.
3. A função verifica também que existe um objeto de alta com mesmo número de atendimento e data posterior.
4. Ação: deleta o registro de internação com mesmo número de atendimento do objeto mapeado.

<h4>SITUAÇÃO 05:</h4>

1. É mapeado um objeto de alta.
2. A função verifica que não existe no banco de dados Pulsar qualquer registro de internação com o número de atendimento do objeto.
3. A função verifica também que não existe objeto de internação com mesmo número de atendimento e data posterior.
4. Ação: nenhuma.

<h4>SITUAÇÃO 06:</h4>

1. É mapeado um objeto de alta.
2. A função verifica que existe no banco de dados Pulsar um registro de internação com o número de atendimento do objeto.
3. A função verifica também que não existe objeto de internação com mesmo número de atendimento e data posterior.
4. Ação: deleta o registro de internação com mesmo número de atendimento do objeto mapeado.

<h4>SITUAÇÃO 07:</h4>

1. É mapeado um objeto de alta.
2. A função verifica que não existe no banco de dados Pulsar qualquer registro de internação com o número de atendimento do objeto.
3. A função verifica também que existe objeto de internação com mesmo número de atendimento e data posterior.
4. Ação: insere o objeto concorrente como registro de internação no banco de dados Pulsar.

<h4>SITUAÇÃO 08:</h4>

1. É mapeado um objeto de alta.
2. A função verifica que existe no banco de dados Pulsar um registro de internação com o número de atendimento do objeto.
3. A função verifica também que existe um objeto de internação com mesmo número de atendimento e data posterior.
4. Ação: deleta o registro com mesmo código de atendimento e insere o objeto concorrente como registro de internação no banco de dados Pulsar.

As imagens abaixo facilitam o entendimento do algoritmo descrito acima:

![Probabilidades para objetos de internação](/images/probabilidades_internacao.jpeg)

![Probabilidades para objetos de alta](/images/probabilidades_alta.jpeg)

<h3>ASSISTENCIAL</h3>

A API Pulsar declara também a endpoint http://pulsar-gesthos-api.up.railway.app/gesthos_assistencial. Quando o robô Gesthos consome esta endpoint, é retornada uma array de JSONs contendo registros assistenciais (precauções, alergias, dados vitais, resultados de exames, etc.), que serão armazenados no banco de Dados Pulsar.
Os dados assistenciais serão disponibilizados para o FrontEnd através da endpoint http://pulsar-gesthos-api.up.railway.app/lista_assistencial.

**Fragmento do código da API Pulsar (Web Server) explicitando o código para tratamento dos dados assistenciais:**

```js
// ## INTEGRAÇÃO GESTHOS ## //
let assistenciais = []; // objetos "assistenciais" injetados pelo robô Gesthos.
let arrayassistencial = [];

// função que insere objeto de registro assistencial no banco de dados Pulsar.
const insertRegistroAssistencial = (obj) => {
  console.log("INSERINDO REGISTRO ASSISTENCIAL...");
  var sql =
    "INSERT INTO gesthos_assistencial (data, hora, prontuario, atendimento, grupo, item, valor) VALUES ($1, $2, $3, $4, $5, $6, $7)";
  pool.query(
    sql,
    [
      obj.data,
      obj.hora,
      obj.prontuario,
      obj.atendimento,
      obj.grupo,
      obj.item,
      obj.valor,
    ],
    (error, results) => {
      if (error)
        return res.json({ success: false, message: "ERRO DE CONEXÃO." });
      console.log(
        "REGISTRO INSERIDO NO BANCO COM SUCESSO: " + JSON.stringify(results)
      );
    }
  );
};

/*
injetando objetos de dados assistenciais (robô Gesthos >> api Pulsar), com gravação dos
mesmos no banco de dados Pulsar.
*/
app.post("/gesthos_assistencial", (req, res) => {
  arrayassistencial = [];
  assistenciais = req.body;
  console.log(assistenciais);
  if (
    assistenciais == [] ||
    assistenciais == null ||
    assistenciais == undefined ||
    assistenciais == ""
  ) {
    console.log("SEM DADOS ENVIADOS PELO BOT GESTHOS");
    res.json({
      message: "SEM DADOS ENVIADOS PELO BOT GESTHOS.",
      content: assistenciais,
    });
  } else {
    let dados_assistenciais = [];
    dados_assistenciais = assistenciais.registro;
    dados_assistenciais.map((item) => arrayassistencial.push(item));
    res.json({
      message: "NOVOS REGISTROS ASSISTENCIAIS:",
      conteudo: assistenciais.registro,
    });
    // atualizando banco de dados.
    var documentos = arrayassistencial.filter(
      (item) => item.hasOwnProperty("documento") == true
    ).length;
    var precaucao = arrayassistencial.filter(
      (item) => item.hasOwnProperty("precaucao") == true
    ).length;
    var exame = arrayassistencial.filter(
      (item) => item.hasOwnProperty("exame") == true
    ).length;

    console.log(documentos + " - " + precaucao + " - " + exame);
    arrayassistencial
      .filter((item) => item.hasOwnProperty("documento") == true)
      .map((item) => insertRegistroAssistencial(item.documento));
    arrayassistencial
      .filter((item) => item.hasOwnProperty("precaucao") == true)
      .map((item) => insertRegistroAssistencial(item.precaucao));
    arrayassistencial
      .filter((item) => item.hasOwnProperty("exame") == true)
      .map((item) => insertRegistroAssistencial(item.exame));
  }
});
```

<h2>PRÓXIMOS PASSOS</h2>

1. Substituir os caminhos das endpoints no FrontEnd Pulsar por variáveis de ambiente (segurança).
2. Login.
3. Injetar no Pulsar dados complementares relativos aos controles (diurese, evacuações, tax, glicemia).
4. Integrar no Pulsar dados complementares relativos à anamnese.
5. Integrar dados de anamnese.
